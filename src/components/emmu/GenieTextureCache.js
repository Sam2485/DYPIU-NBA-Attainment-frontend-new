import * as THREE from 'three';
import { toCanvas } from 'html-to-image';

/**
 * ============================================================================
 * EMMU CHAT GENIE TEXTURE CACHE & PRE-WARMING SYSTEM
 * ============================================================================
 */

function createInstantFallbackCanvas(width = 480, height = 640) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background card with rounded corners
  ctx.fillStyle = '#f4f6fb';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 32);
  ctx.fill();

  // Header background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, 64, [32, 32, 0, 0]);
  ctx.fill();

  // Header border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(width, 64);
  ctx.stroke();

  // Header avatar placeholder
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(38, 32, 17, 0, Math.PI * 2);
  ctx.fill();

  // Header title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 15px Inter, system-ui, sans-serif';
  ctx.fillText('Emmu', 64, 28);

  // Status indicator
  ctx.fillStyle = '#10b981';
  ctx.font = '600 11px Inter, system-ui, sans-serif';
  ctx.fillText('● Online', 64, 44);

  // Message 1 (Bot)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(22, 84, 300, 72, [4, 20, 20, 20]);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText('Hi there! 👋', 38, 112);
  ctx.fillText('How can I help you today?', 38, 134);

  // Message 2 (User)
  ctx.fillStyle = '#e2edfd';
  ctx.beginPath();
  ctx.roundRect(width - 290, 176, 268, 64, [20, 20, 4, 20]);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText('Show me the pending approvals', width - 272, 206);
  ctx.fillStyle = '#2f80ed';
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.fillText('10:25 AM ✓✓', width - 90, 228);

  // Message 3 (Thinking)
  ctx.fillStyle = '#edf2f7';
  ctx.beginPath();
  ctx.roundRect(22, 260, 140, 46, [4, 20, 20, 20]);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px Inter, system-ui, sans-serif';
  ctx.fillText('••• Thinking...', 38, 288);

  // Bottom Input Bar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(20, height - 74, width - 40, 52, 26);
  ctx.fill();
  ctx.strokeStyle = '#e5eaf2';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Send button
  ctx.fillStyle = '#2f80ed';
  ctx.beginPath();
  ctx.arc(width - 48, height - 48, 20, 0, Math.PI * 2);
  ctx.fill();

  // Placeholder
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText('Ask Emmu anything...', 44, height - 43);

  return canvas;
}

class GenieTextureCacheManager {
  constructor() {
    this.textures = new Map();
    this.fallbackTexture = null;
    this.pendingTimer = null;
    this.pendingIdleId = null;
    this.activeJobId = 0;
    this.isRasterizing = false;
  }

  getTexture(key = 'chat') {
    if (this.textures.has(key)) {
      return this.textures.get(key);
    }

    if (this.textures.size > 0) {
      return this.textures.values().next().value;
    }

    if (!this.fallbackTexture) {
      const fallbackCanvas = createInstantFallbackCanvas();
      this.fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
      this.fallbackTexture.colorSpace = THREE.SRGBColorSpace;
      this.fallbackTexture.minFilter = THREE.LinearFilter;
      this.fallbackTexture.magFilter = THREE.LinearFilter;
      this.fallbackTexture.generateMipmaps = false;
      this.fallbackTexture.needsUpdate = true;
    }
    return this.fallbackTexture;
  }

  hasTexture(key = 'chat') {
    return this.textures.has(key) || Boolean(this.fallbackTexture);
  }

  async captureElement(domElement, key = 'chat') {
    if (!domElement) return null;
    try {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = await toCanvas(domElement, {
        pixelRatio,
        skipFonts: true,
        backgroundColor: null,
        style: {
          transform: 'none',
          margin: '0',
          visibility: 'visible',
          opacity: '1',
        },
      });

      const newTexture = new THREE.CanvasTexture(canvas);
      newTexture.colorSpace = THREE.SRGBColorSpace;
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.magFilter = THREE.LinearFilter;
      newTexture.generateMipmaps = false;
      newTexture.needsUpdate = true;

      if (this.textures.has(key)) {
        this.textures.get(key).dispose();
      }

      this.textures.set(key, newTexture);
      return newTexture;
    } catch (err) {
      console.warn('GenieTextureCache: captureElement warning', err);
      return null;
    }
  }

  scheduleCapture(domElement, key = 'chat', delay = 300, force = false) {
    if (!domElement) return;

    if (!force && this.textures.has(key)) {
      return;
    }

    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    if (this.pendingIdleId && typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(this.pendingIdleId);
      this.pendingIdleId = null;
    }

    const jobId = ++this.activeJobId;

    const executeRasterization = async () => {
      if (jobId !== this.activeJobId || !domElement) return;

      this.isRasterizing = true;
      try {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = await toCanvas(domElement, {
          pixelRatio,
          skipFonts: true,
          backgroundColor: null,
          style: {
            transform: 'none',
            margin: '0',
            visibility: 'visible',
            opacity: '1',
          },
        });

        if (jobId !== this.activeJobId) return;

        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.minFilter = THREE.LinearFilter;
        newTexture.magFilter = THREE.LinearFilter;
        newTexture.generateMipmaps = false;
        newTexture.needsUpdate = true;

        if (this.textures.has(key)) {
          this.textures.get(key).dispose();
        }

        this.textures.set(key, newTexture);
      } catch (err) {
        console.warn('GenieTextureCache: background capture warning', err);
      } finally {
        this.isRasterizing = false;
      }
    };

    this.pendingTimer = setTimeout(() => {
      if (typeof requestIdleCallback === 'function') {
        this.pendingIdleId = requestIdleCallback(
          () => executeRasterization(),
          { timeout: 1000 }
        );
      } else {
        executeRasterization();
      }
    }, delay);
  }

  dispose() {
    if (this.pendingTimer) clearTimeout(this.pendingTimer);
    if (this.pendingIdleId && typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(this.pendingIdleId);
    }
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
    if (this.fallbackTexture) {
      this.fallbackTexture.dispose();
      this.fallbackTexture = null;
    }
  }
}

export const genieTextureCache = new GenieTextureCacheManager();
export default genieTextureCache;
