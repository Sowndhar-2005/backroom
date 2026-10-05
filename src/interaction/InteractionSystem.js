/**
 * InteractionSystem — Raycasting-based interaction
 */
import * as THREE from 'three';

export class InteractionSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.5;
    this.currentTarget = null;
    this.interactables = []; // meshes with userData.interactable = true
    this.onInteract = null; // callback(target)
  }

  addInteractable(mesh) {
    mesh.userData.interactable = true;
    this.interactables.push(mesh);
  }

  removeInteractable(mesh) {
    const idx = this.interactables.indexOf(mesh);
    if (idx >= 0) this.interactables.splice(idx, 1);
  }

  clearInteractables() {
    this.interactables = [];
  }

  update() {
    // Cast ray from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    let closest = null;
    let closestDist = Infinity;

    for (const obj of this.interactables) {
      if (!obj.visible) continue;
      const intersects = this.raycaster.intersectObject(obj, true);
      if (intersects.length > 0 && intersects[0].distance < closestDist) {
        closestDist = intersects[0].distance;
        closest = obj;
      }
    }

    this.currentTarget = closest;

    // Update HUD
    const interactEl = document.getElementById('hud-interact');
    if (interactEl) {
      if (closest) {
        const prompt = closest.userData.prompt || 'Interact';
        interactEl.innerHTML = `Press <span class="key-inline">E</span> ${prompt}`;
        interactEl.classList.remove('hidden');
      } else {
        interactEl.classList.add('hidden');
      }
    }
  }

  /**
   * Try to interact with current target
   * @returns {object|null} The target's userData if interaction happened
   */
  interact() {
    if (!this.currentTarget) return null;
    if (this.onInteract) {
      this.onInteract(this.currentTarget);
    }
    return this.currentTarget.userData;
  }
}
