/**
 * Lights — Fluorescent light fixtures with flickering
 */
import * as THREE from 'three';
import { randomRange } from '../utils/MathUtils.js';

export class FluorescentLight {
  /**
   * @param {object} opts
   * @param {number} opts.x
   * @param {number} opts.y - height (usually ceiling height - 0.05)
   * @param {number} opts.z
   * @param {number} opts.intensity
   * @param {boolean} opts.flicker - whether this light flickers
   * @param {boolean} opts.startOff
   */
  constructor(opts = {}) {
    const {
      x = 0, y = 2.95, z = 0,
      intensity = 4.0,
      flicker = false,
      startOff = false,
      color = 0xfff5d0
    } = opts;

    this.group = new THREE.Group();
    this.flicker = flicker;
    this.baseIntensity = intensity;
    this.isOff = startOff;

    // Fixture visual — a rectangular panel
    const fixtureMat = new THREE.MeshStandardMaterial({
      color: startOff ? 0x808070 : color,
      emissive: startOff ? 0x000000 : color,
      emissiveIntensity: startOff ? 0 : 1.0,
      roughness: 0.4
    });
    this.fixtureMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.04, 0.2),
      fixtureMat
    );
    this.fixtureMesh.position.set(0, 0, 0);
    this.group.add(this.fixtureMesh);

    // Point light with decay 1.0 for balanced illumination
    this.light = new THREE.PointLight(color, startOff ? 0 : intensity, 12, 1.0);
    this.light.position.set(0, -0.1, 0);
    this.group.add(this.light);

    this.group.position.set(x, y, z);

    // Flicker state
    this.flickerTimer = randomRange(2, 8);
    this.flickering = false;
    this.flickerPhase = 0;
  }

  setOff(off) {
    this.isOff = off;
    this.light.intensity = off ? 0 : this.baseIntensity;
    this.fixtureMesh.material.emissiveIntensity = off ? 0 : 0.6;
    this.fixtureMesh.material.emissive.set(off ? 0x000000 : 0xfff5d0);
  }

  update(dt) {
    if (this.isOff && !this.flickering) return;

    if (this.flicker) {
      this.flickerTimer -= dt;
      if (this.flickerTimer <= 0 && !this.flickering) {
        this.flickering = true;
        this.flickerPhase = 0;
      }

      if (this.flickering) {
        this.flickerPhase += dt;
        // Flicker pattern: on-off-on-off-on over ~0.5s
        const phase = this.flickerPhase;
        let on = true;
        if (phase < 0.05) on = false;
        else if (phase < 0.1) on = true;
        else if (phase < 0.18) on = false;
        else if (phase < 0.22) on = true;
        else if (phase < 0.28) on = false;
        else on = true;

        this.light.intensity = on ? this.baseIntensity : 0;
        this.fixtureMesh.material.emissiveIntensity = on ? 0.6 : 0.05;

        if (this.flickerPhase > 0.4) {
          this.flickering = false;
          this.flickerTimer = randomRange(3, 12);
          this.light.intensity = this.baseIntensity;
          this.fixtureMesh.material.emissiveIntensity = 0.6;
        }
      }
    }
  }

  addToScene(scene) {
    scene.add(this.group);
  }
}
