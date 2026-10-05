/**
 * Flashlight — SpotLight attached to the camera
 */
import * as THREE from 'three';

export class Flashlight {
  constructor(camera) {
    this.camera = camera;
    this.on = false;

    this.light = new THREE.SpotLight(0xfffae0, 20.0, 30, Math.PI / 5, 0.35, 1.0);
    this.light.castShadow = false;
    this.light.visible = false;

    this.target = new THREE.Object3D();
    this.light.target = this.target;

    camera.add(this.light);
    camera.add(this.target);
    this.light.position.set(0, -0.1, 0);
    this.target.position.set(0, 0, -5);
  }

  toggle() {
    this.on = !this.on;
    this.light.visible = this.on;
    return this.on;
  }

  setOn(v) {
    this.on = v;
    this.light.visible = v;
  }

  /** Briefly flicker the flashlight */
  flicker() {
    if (!this.on) return;
    this.light.visible = false;
    setTimeout(() => {
      if (this.on) this.light.visible = true;
    }, 80);
    setTimeout(() => {
      if (this.on) this.light.visible = false;
    }, 150);
    setTimeout(() => {
      if (this.on) this.light.visible = true;
    }, 220);
  }

  update() {
    // flashlight follows camera automatically since it's a child
  }
}
