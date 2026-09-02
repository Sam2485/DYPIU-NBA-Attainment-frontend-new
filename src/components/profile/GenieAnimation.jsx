import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import genieTextureCache from './GenieTextureCache';

/**
 * ============================================================================
 * PHASE 5 — INSTANT GENIE ANIMATION (ZERO CAPTURE DELAY)
 * ============================================================================
 *
 * Core Improvements:
 * 1. ZERO click-to-animation delay: Uses pre-rasterized CanvasTexture from
 *    GenieTextureCache synchronously. No html-to-image in the click path!
 * 2. ZERO DOM flash: Real DOM modal stays hidden during 'opening' and 'closing',
 *    revealing only after the 900ms Genie unfurl finishes.
 * 3. LOCKED Phase 3 Mathematics: 48x48 mesh, Bezier trajectories, asymmetric
 *    pull-order, and concave waist taper are 100% preserved.
 * 4. Default DEBUG = false: Blue wireframe, blue mesh, and progress badge
 *    are disabled for clean production appearance (available if toggled).
 */

// Debug flag: false by default. When true, shows wireframe overlay and progress chip
const DEBUG = false;
const ANIMATION_DURATION = 900; // ms
const GRID_SUBDIVISIONS = 48; // 48x48 grid for continuous curvature

// Cubic bezier evaluator for smooth trajectory
function cubicBezier(p0, p1, p2, p3, t) {
  const oneMinusT = 1 - t;
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  );
}

// Hermite smoothstep for clean transitions
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function GenieAnimation({
  sourceRef,
  destinationRef,
  profileState,
  activeTab = 'profile',
  onAnimationComplete,
}) {
  const containerRef = useRef(null);

  const isAnimating = profileState === 'opening' || profileState === 'closing';

  useEffect(() => {
    if (!isAnimating || !containerRef.current) return;

    let animId = null;
    const sourceEl = sourceRef?.current;
    const destEl = destinationRef?.current;
    const isOpening = profileState === 'opening';

    // 1. Measure physical DOM endpoints dynamically
    const sourceRect = sourceEl
      ? sourceEl.getBoundingClientRect()
      : { left: 20, top: window.innerHeight - 70, width: 240, height: 44 };

    const sourcePoint = {
      x: sourceRect.left + sourceRect.width * 0.5,
      y: sourceRect.top + sourceRect.height * 0.5,
    };

    let destRect = destEl ? destEl.getBoundingClientRect() : null;
    if (!destRect || destRect.width <= 0) {
      destRect = {
        left: 340 + 60,
        top: 20,
        width: Math.min(867, window.innerWidth - 380),
        height: Math.min(646, window.innerHeight - 40),
      };
    }

    const panelW = destRect.width;
    const panelH = destRect.height;
    const panelX0 = destRect.left;
    const panelY0 = destRect.top;
    const panelCenterX = panelX0 + panelW * 0.5;

    // 2. Obtain pre-rasterized texture IMMEDIATELY from cache (0ms delay!)
    // Both OPEN and CLOSE dynamically represent the activeTab UI
    // (Physical source coordinate is always the sidebar Profile card)
    const targetTab = activeTab || 'profile';
    const texture = genieTextureCache.getTexture(targetTab);

    // 3. Setup Three.js Scene, Orthographic Camera & Renderer
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    // 1:1 Screen Pixel Coordinate System:
    // Top-left is (0, 0), Bottom-right is (width, -height)
    const camera = new THREE.OrthographicCamera(0, width, 0, -height, -1000, 1000);
    camera.position.z = 10;

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('GenieAnimation: WebGL context creation failed, falling back:', err);
      if (destEl) destEl.style.visibility = 'visible';
      onAnimationComplete?.(profileState);
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
    canvas.style.zIndex = '350';
    containerRef.current.appendChild(canvas);

    // 4. Create Subdivided Plane Geometry & Accurate UV Mapping
    const geometry = new THREE.PlaneGeometry(1, 1, GRID_SUBDIVISIONS, GRID_SUBDIVISIONS);
    const posAttr = geometry.attributes.position;
    const uvAttr = geometry.attributes.uv;
    const vertexCount = posAttr.count;

    const uvs = new Float32Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i++) {
      const origX = posAttr.getX(i);
      const origY = posAttr.getY(i);
      const u = origX + 0.5; // 0 (left) -> 1 (right)
      const v = 0.5 - origY; // 0 (top) -> 1 (bottom)
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;

      // In Three.js with flipY=true: UV V=1 is top row, UV V=0 is bottom row
      uvAttr.setXY(i, u, 1 - v);
    }
    uvAttr.needsUpdate = true;

    // 5. Textured Material
    const surfaceMaterial = new THREE.MeshBasicMaterial({
      map: texture || null,
      color: texture ? 0xffffff : 0x6366f1,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, surfaceMaterial);
    scene.add(mesh);

    // Wireframe overlay in DEBUG mode only
    let wireframeMesh = null;
    let wireframeMaterial = null;
    if (DEBUG) {
      wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        depthTest: false,
      });
      wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
      scene.add(wireframeMesh);
    }

    // Precomputed per-vertex static lookup arrays for zero-allocation hot loop
    const uArray = new Float32Array(vertexCount);
    const xRestArray = new Float32Array(vertexCount);
    const yRestArray = new Float32Array(vertexCount);
    const tStartArray = new Float32Array(vertexCount);
    const tInvArray = new Float32Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const u = uvs[i * 2];
      const v = uvs[i * 2 + 1];
      uArray[i] = u;
      xRestArray[i] = panelX0 + u * panelW;
      yRestArray[i] = -(panelY0 + v * panelH);

      const pullOrder = 0.58 * (1 - v) + 0.42 * u;
      const tStart = pullOrder * 0.34;
      const tEnd = 0.66 + pullOrder * 0.34;
      tStartArray[i] = tStart;
      tInvArray[i] = 1.0 / (tEnd - tStart);
    }

    const posArray = posAttr.array;

    // 6. Mathematical Deformation Engine (LOCKED Phase 3 Equations)
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
        const xRest = xRestArray[i];
        const yRest = yRestArray[i];

        const localT = Math.max(0, Math.min(1, (T - tStartArray[i]) * tInvArray[i]));
        const phi = localT * localT * (3 - 2 * localT);

        // Centerline trajectory
        const centerX = cubicBezier(C0_x, C1_x, C2_x, C3_x, phi);

        // Concave waist width taper
        const waistFactor = 1.0 - 0.32 * Math.sin(phi * Math.PI);
        const currentHalfWidth = (panelW * 0.5) * (1 - phi) * waistFactor;

        const sideBias = 1.0 - 0.18 * (1 - u) * phi;
        const xOffset = (u - 0.5) * 2 * currentHalfWidth * sideBias;

        const posX = centerX + xOffset;

        // Vertical descent trajectory
        const C0_y = yRest;
        const C1_y = yRest - 0.35 * Math.abs(Sy - yRest);
        const C2_y = Sy + 0.15 * Math.abs(Sy - yRest);
        const C3_y = Sy;

        const posY = cubicBezier(C0_y, C1_y, C2_y, C3_y, phi);
        const posZ = Math.sin(phi * Math.PI) * 12 * Math.sin(u * Math.PI);

        posArray[pIdx++] = posX;
        posArray[pIdx++] = posY;
        posArray[pIdx++] = posZ;
      }

      posAttr.needsUpdate = true;
    };

    // 7. Animation Loop (STARTS IMMEDIATELY ON FRAME 1)
    const startTime = performance.now();

    // On closing start: immediately hide the real DOM panel so there is no duplicate visual
    if (!isOpening && destEl) {
      destEl.style.visibility = 'hidden';
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
          // 1. Force the mesh to exact destination rectangle (T = 0) and render one final frame
          applyGenieDeformation(0);
          renderer.render(scene, camera);

          // 2. Make the real DOM panel visible FIRST while the Three.js canvas remains in front
          if (destEl) {
            destEl.style.visibility = 'visible';
          }

          // 3. Double-rAF ensures browser has committed and painted the visible DOM panel
          //    BEFORE removing/hiding the Genie canvas. Eliminates 100% of post-open flicker!
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (onAnimationComplete) {
                onAnimationComplete('opening');
              }
            });
          });
        } else {
          // Closing reached 100%
          applyGenieDeformation(1);
          renderer.render(scene, camera);
          if (onAnimationComplete) {
            onAnimationComplete('closing');
          }
        }
      }
    };

    animId = requestAnimationFrame(tick);

    // Resize handler
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
      if (wireframeMaterial) wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, [isAnimating, profileState, activeTab, sourceRef, destinationRef, onAnimationComplete]);

  if (!isAnimating && !DEBUG) return null;

  return (
    <div ref={containerRef}>
      {DEBUG && isAnimating && (
        <div
          style={{
            position: 'fixed',
            top: 14,
            right: 20,
            zIndex: 400,
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#c7d2fe',
            border: '1px solid rgba(129, 140, 248, 0.4)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '11.5px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        >
          GENIE DEBUG ({GRID_SUBDIVISIONS}x{GRID_SUBDIVISIONS}) · {profileState.toUpperCase()}
        </div>
      )}
    </div>
  );
}
