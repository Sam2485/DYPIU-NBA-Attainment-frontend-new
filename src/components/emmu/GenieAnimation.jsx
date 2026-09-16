import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import genieTextureCache from './GenieTextureCache';

const ANIMATION_DURATION = 850; // ms
const GRID_SUBDIVISIONS = 48; // 48x48 grid for smooth curvature

function cubicBezier(p0, p1, p2, p3, t) {
  const oneMinusT = 1 - t;
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  );
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function GenieAnimation({
  sourceRef,
  destinationRef,
  chatState,
  onAnimationComplete,
}) {
  const containerRef = useRef(null);
  const isAnimating = chatState === 'opening' || chatState === 'closing';

  useEffect(() => {
    if (!isAnimating || !containerRef.current) return;

    let animId = null;
    const sourceEl = sourceRef?.current;
    const destEl = destinationRef?.current;
    const isOpening = chatState === 'opening';

    // 1. Measure physical DOM endpoints dynamically
    const sourceRect = sourceEl
      ? sourceEl.getBoundingClientRect()
      : {
          left: window.innerWidth - 148,
          top: window.innerHeight - 148,
          width: 120,
          height: 120,
        };

    const sourcePoint = {
      x: sourceRect.left + sourceRect.width * 0.5,
      y: sourceRect.top + sourceRect.height * 0.5,
    };

    let destRect = destEl ? destEl.getBoundingClientRect() : null;
    if (!destRect || destRect.width <= 0) {
      const modalW = Math.min(480, window.innerWidth - 32);
      const modalH = Math.min(640, window.innerHeight - 40);
      destRect = {
        left: (window.innerWidth - modalW) * 0.5,
        top: (window.innerHeight - modalH) * 0.5,
        width: modalW,
        height: modalH,
      };
    }

    const panelW = destRect.width;
    const panelH = destRect.height;
    const panelX0 = destRect.left;
    const panelY0 = destRect.top;
    const panelCenterX = panelX0 + panelW * 0.5;

    // 2. Obtain pre-rasterized texture immediately (0ms delay)
    const texture = genieTextureCache.getTexture('chat');

    // 3. Three.js Scene, Orthographic Camera & WebGL Renderer
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, width, 0, -height, -1000, 1000);
    camera.position.z = 10;

    const setPanelVisibility = (vis) => {
      const el = destinationRef?.current;
      if (el) el.style.visibility = vis;
    };

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('GenieAnimation: WebGL context creation failed, falling back:', err);
      setPanelVisibility('visible');
      onAnimationComplete?.(chatState);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100005';
    containerRef.current.appendChild(canvas);

    // 4. Create Subdivided Plane Geometry & UV Mapping
    const geometry = new THREE.PlaneGeometry(1, 1, GRID_SUBDIVISIONS, GRID_SUBDIVISIONS);
    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;
    const vertexCount = posAttr.count;

    const uvs = new Float32Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i++) {
      const origX = posAttr.getX(i);
      const origY = posAttr.getY(i);
      const u = origX + 0.5;
      const v = 0.5 - origY;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
      uvAttr.setXY(i, u, 1 - v);
    }
    uvAttr.needsUpdate = true;

    // 5. Textured Material
    const surfaceMaterial = new THREE.MeshBasicMaterial({
      map: texture || null,
      color: texture ? 0xffffff : 0x2563eb,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, surfaceMaterial);
    scene.add(mesh);

    // Precomputed per-vertex static lookup arrays
    const uArray = new Float32Array(vertexCount);
    const xRestArray = new Float32Array(vertexCount);
    const yRestArray = new Float32Array(vertexCount);
    const tStartArray = new Float32Array(vertexCount);
    const tInvArray = new Float32Array(vertexCount);

    // Determine relative direction of source vs modal center
    const isSourceOnRight = sourcePoint.x >= panelCenterX;
    const panelCenterY = panelY0 + panelH * 0.5;
    const isSourceOnBottom = sourcePoint.y >= panelCenterY;

    for (let i = 0; i < vertexCount; i++) {
      const u = uvs[i * 2];
      const v = uvs[i * 2 + 1];
      uArray[i] = u;
      xRestArray[i] = panelX0 + u * panelW;
      yRestArray[i] = -(panelY0 + v * panelH);

      // If source is on the right, right edge (u=1) pulls in first (uEff=0).
      // If source is on the left, left edge (u=0) pulls in first (uEff=0).
      const uEff = isSourceOnRight ? (1 - u) : u;

      // If source is below modal, bottom edge (v=1) pulls in first (vEff=0).
      // If source is above modal, top edge (v=0) pulls in first (vEff=0).
      const vEff = isSourceOnBottom ? (1 - v) : v;

      const pullOrder = 0.58 * vEff + 0.42 * uEff;
      const tStart = pullOrder * 0.34;
      const tEnd = 0.66 + pullOrder * 0.34;
      tStartArray[i] = tStart;
      tInvArray[i] = 1.0 / (tEnd - tStart);
    }

    const posArray = posAttr.array;

    // 6. Mathematical Deformation Engine
    const applyGenieDeformation = (T) => {
      const Sx = sourcePoint.x;
      const Sy = -sourcePoint.y;

      const C0_x = panelCenterX;
      const C1_x = panelCenterX - 0.28 * (panelCenterX - Sx);
      const C2_x = Sx + 0.08 * (panelCenterX - Sx);
      const C3_x = Sx;

      let pIdx = 0;
      for (let i = 0; i < vertexCount; i++) {
        const u = uArray[i];
        const yRest = yRestArray[i];

        const localT = Math.max(0, Math.min(1, (T - tStartArray[i]) * tInvArray[i]));
        const phi = localT * localT * (3 - 2 * localT);

        // Centerline trajectory
        const centerX = cubicBezier(C0_x, C1_x, C2_x, C3_x, phi);

        // Concave waist width taper
        const waistFactor = 1.0 - 0.32 * Math.sin(phi * Math.PI);
        const currentHalfWidth = panelW * 0.5 * (1 - phi) * waistFactor;

        const uEff = isSourceOnRight ? (1 - u) : u;
        const sideBias = 1.0 - 0.18 * (1 - uEff) * phi;
        const xOffset = (u - 0.5) * 2 * currentHalfWidth * sideBias;

        const posX = centerX + xOffset;

        // Vertical trajectory
        const signY = Sy >= yRest ? 1 : -1;
        const C0_y = yRest;
        const C1_y = yRest + signY * 0.35 * Math.abs(Sy - yRest);
        const C2_y = Sy - signY * 0.15 * Math.abs(Sy - yRest);
        const C3_y = Sy;

        const posY = cubicBezier(C0_y, C1_y, C2_y, C3_y, phi);
        const posZ = Math.sin(phi * Math.PI) * 12 * Math.sin(u * Math.PI);

        posArray[pIdx++] = posX;
        posArray[pIdx++] = posY;
        posArray[pIdx++] = posZ;
      }

      posAttr.needsUpdate = true;
    };

    // 7. Animation Loop
    const startTime = performance.now();

    // On closing start: hide real DOM immediately so there's no visual duplicate
    if (!isOpening) {
      setPanelVisibility('hidden');
    }

    let isCompleted = false;

    const tick = (now) => {
      if (isCompleted) return;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / ANIMATION_DURATION);

      const easedProgress = smoothstep(0, 1, progress);
      const T = isOpening ? 1 - easedProgress : easedProgress;

      applyGenieDeformation(T);
      renderer.render(scene, camera);

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        isCompleted = true;

        if (isOpening) {
          applyGenieDeformation(0);
          renderer.render(scene, camera);

          setPanelVisibility('visible');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (onAnimationComplete) {
                onAnimationComplete('opening');
              }
            });
          });
        } else {
          applyGenieDeformation(1);
          renderer.render(scene, camera);
          if (onAnimationComplete) {
            onAnimationComplete('closing');
          }
        }
      }
    };

    animId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!camera || !renderer) return;
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      camera.right = newW;
      camera.bottom = -newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      geometry.dispose();
      surfaceMaterial.dispose();
      renderer.dispose();
    };
  }, [isAnimating, chatState, sourceRef, destinationRef, onAnimationComplete]);

  if (!isAnimating) return null;

  return createPortal(
    <div ref={containerRef} aria-hidden="true" />,
    document.body
  );
}
