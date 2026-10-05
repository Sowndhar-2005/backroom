/**
 * TextureGenerator — Procedural textures using Canvas API
 * Creates simple liminal-space textures with canvas caching for high performance.
 */
import * as THREE from 'three';

export class TextureGenerator {
  static _canvasCache = new Map();

  static _getCanvas(key, width, height, drawFn) {
    if (!this._canvasCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      drawFn(ctx, width, height);
      this._canvasCache.set(key, canvas);
    }
    return this._canvasCache.get(key);
  }

  /**
   * Create a dirty yellow/beige wall texture
   */
  static wallTexture(width = 256, height = 256) {
    const canvas = this._getCanvas(`wall_${width}_${height}`, width, height, (ctx, w, h) => {
      // Base color — dirty yellow/beige
      ctx.fillStyle = '#c8b880';
      ctx.fillRect(0, 0, w, h);

      // Add noise/stains
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 3 + 0.5;
        const alpha = Math.random() * 0.15;
        ctx.fillStyle = `rgba(${80 + Math.random() * 60}, ${70 + Math.random() * 50}, ${40 + Math.random() * 30}, ${alpha})`;
        ctx.fillRect(x, y, size, size);
      }

      // Occasional darker stains
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 30 + 10;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, 'rgba(80, 65, 40, 0.12)');
        gradient.addColorStop(1, 'rgba(80, 65, 40, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Create carpet texture with repeating pattern
   */
  static carpetTexture(width = 256, height = 256) {
    const canvas = this._getCanvas(`carpet_${width}_${height}`, width, height, (ctx, w, h) => {
      // Base — muted brownish-yellow
      ctx.fillStyle = '#8a7a55';
      ctx.fillRect(0, 0, w, h);

      // Diamond carpet pattern
      const gridSize = 32;
      for (let gx = 0; gx < w; gx += gridSize) {
        for (let gy = 0; gy < h; gy += gridSize) {
          const dark = ((gx / gridSize + gy / gridSize) % 2 === 0);
          ctx.fillStyle = dark ? 'rgba(60, 50, 30, 0.2)' : 'rgba(120, 100, 60, 0.15)';
          // Diamond
          ctx.beginPath();
          ctx.moveTo(gx + gridSize / 2, gy);
          ctx.lineTo(gx + gridSize, gy + gridSize / 2);
          ctx.lineTo(gx + gridSize / 2, gy + gridSize);
          ctx.lineTo(gx, gy + gridSize / 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Noise
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = `rgba(${40 + Math.random() * 40}, ${35 + Math.random() * 35}, ${20 + Math.random() * 20}, ${Math.random() * 0.1})`;
        ctx.fillRect(x, y, 1, 1);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Create ceiling tile texture
   */
  static ceilingTexture(width = 256, height = 256) {
    const canvas = this._getCanvas(`ceiling_${width}_${height}`, width, height, (ctx, w, h) => {
      // Off-white / grayish ceiling
      ctx.fillStyle = '#d0ccc0';
      ctx.fillRect(0, 0, w, h);

      // Grid lines for ceiling tiles
      ctx.strokeStyle = 'rgba(100, 90, 70, 0.3)';
      ctx.lineWidth = 2;
      const tileSize = 64;
      for (let x = 0; x <= w; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Subtle spots/stains
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${90 + Math.random() * 40}, ${70 + Math.random() * 30}, ${Math.random() * 0.06})`;
        ctx.fillRect(x, y, 1, 1);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Dark/concrete floor for darker levels
   */
  static concreteTexture(width = 256, height = 256) {
    const canvas = this._getCanvas(`concrete_${width}_${height}`, width, height, (ctx, w, h) => {
      ctx.fillStyle = '#5a5550';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const val = 40 + Math.random() * 60;
        ctx.fillStyle = `rgba(${val}, ${val - 5}, ${val - 10}, ${Math.random() * 0.12})`;
        ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Door texture
   */
  static doorTexture(width = 128, height = 256) {
    const canvas = this._getCanvas(`door_${width}_${height}`, width, height, (ctx, w, h) => {
      ctx.fillStyle = '#6a5a40';
      ctx.fillRect(0, 0, w, h);

      // Panels
      ctx.strokeStyle = 'rgba(40, 30, 20, 0.4)';
      ctx.lineWidth = 3;
      const panelMargin = 12;
      ctx.strokeRect(panelMargin, panelMargin, w - panelMargin * 2, h / 2 - panelMargin * 1.5);
      ctx.strokeRect(panelMargin, h / 2 + panelMargin * 0.5, w - panelMargin * 2, h / 2 - panelMargin * 1.5);

      // Doorknob
      ctx.fillStyle = '#8a7a55';
      ctx.beginPath();
      ctx.arc(w - 25, h / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Noise
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = `rgba(${30 + Math.random() * 40}, ${25 + Math.random() * 35}, ${15 + Math.random() * 20}, ${Math.random() * 0.08})`;
        ctx.fillRect(x, y, 1, 1);
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }
}
