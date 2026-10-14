import * as THREE from 'three';
import { toCanvas } from 'html-to-image';

/**
 * ============================================================================
 * EMMU CHAT GENIE TEXTURE CACHE & PRE-WARMING SYSTEM
 * ============================================================================
 */

function createInstantFallbackCanvas(width = 760, height = 620) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background card with rounded corners
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 16);
  ctx.fill();

  // Top header: WhatsApp emerald green
  ctx.fillStyle = '#075e54';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, 54, [16, 16, 0, 0]);
  ctx.fill();

  // Header avatar circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(28, 27, 16, 0, Math.PI * 2);
  ctx.fill();

  // Header title & subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.fillText('Emmu Messenger', 52, 24);
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '10.5px Inter, system-ui, sans-serif';
  ctx.fillText('DYPIU Institutional Communication Hub', 52, 40);

  // Close button ✕
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '16px sans-serif';
  ctx.fillText('✕', width - 28, 32);

  // Tabs bar: Chats, Suggestions, Notifications
  const tabsY = 54;
  ctx.fillStyle = '#f0f2f5';
  ctx.fillRect(0, tabsY, width, 42);
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(0, tabsY + 42);
  ctx.lineTo(width, tabsY + 42);
  ctx.stroke();

  // Active Tab indicator: Chats
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(14, tabsY + 6, 110, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#075e54';
  ctx.font = 'bold 12.5px Inter, system-ui, sans-serif';
  ctx.fillText('💬 Chats', 32, tabsY + 26);

  // Tab: Suggestions
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.fillText('💡 Suggestions', 146, tabsY + 26);

  // Tab: Notifications
  ctx.fillText('🔔 Notifications', 268, tabsY + 26);

  // Split pane: Left Sidebar (width 260)
  const contentY = tabsY + 42;
  const contentH = height - contentY;
  const sidebarW = 260;

  // Sidebar background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, contentY, sidebarW, contentH);
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(sidebarW, contentY);
  ctx.lineTo(sidebarW, height);
  ctx.stroke();

  // Sidebar search input
  ctx.fillStyle = '#f0f2f5';
  ctx.beginPath();
  ctx.roundRect(12, contentY + 10, sidebarW - 24, 34, 17);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11.5px Inter, system-ui, sans-serif';
  ctx.fillText('🔍 Search or start new chat', 26, contentY + 31);

  // Sidebar conversation item 1
  ctx.fillStyle = '#f0fdf4';
  ctx.beginPath();
  ctx.roundRect(8, contentY + 54, sidebarW - 16, 56, 10);
  ctx.fill();
  ctx.fillStyle = '#075e54';
  ctx.beginPath();
  ctx.arc(36, contentY + 82, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12.5px Inter, system-ui, sans-serif';
  ctx.fillText('Director Academics', 60, contentY + 76);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.fillText('✓✓ ATR submitted for review', 60, contentY + 94);

  // Right pane: WhatsApp background
  ctx.fillStyle = '#efeae2';
  ctx.fillRect(sidebarW, contentY, width - sidebarW, contentH);

  // Message 1 (Incoming): white bubble
  const chatX = sidebarW + 24;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(chatX, contentY + 40, 260, 52, [4, 14, 14, 14]);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = '12.5px Inter, system-ui, sans-serif';
  ctx.fillText('Please verify the CO attainment values.', chatX + 14, contentY + 64);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.fillText('10:45 AM', chatX + 210, contentY + 84);

  // Message 2 (Outgoing): WhatsApp green bubble
  const outX = width - 280;
  ctx.fillStyle = '#d9fdd3';
  ctx.beginPath();
  ctx.roundRect(outX, contentY + 110, 250, 52, [14, 4, 14, 14]);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = '12.5px Inter, system-ui, sans-serif';
  ctx.fillText('Reviewed and verified successfully.', outX + 14, contentY + 134);
  ctx.fillStyle = '#53bdeb';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.fillText('10:48 AM ✓✓', outX + 180, contentY + 154);

  // Bottom Composer Pill
  const composerY = height - 56;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(sidebarW + 16, composerY, width - sidebarW - 32, 42, 21);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText('Type an encrypted message...', sidebarW + 36, composerY + 26);

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
