/**
 * Door — Interactive door with physics collider
 */
import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class Door {
  /**
   * @param {object} opts
   * @param {number} opts.x - position X
   * @param {number} opts.z - position Z
   * @param {string} opts.axis - 'x' or 'z' (which axis the door faces)
   * @param {boolean} opts.locked
   * @param {string} opts.requiredKey - key ID needed to open
   * @param {string} opts.requiredCode - code needed
   * @param {Function} opts.onOpen - callback when opened
   */
  constructor(opts = {}) {
    const {
      x = 0, z = 0,
      axis = 'z',
      locked = false,
      requiredKey = null,
      requiredCode = null,
      onOpen = null,
      visible = true
    } = opts;

    this.x = x;
    this.z = z;
    this.axis = axis;
    this.locked = locked;
    this.requiredKey = requiredKey;
    this.requiredCode = requiredCode;
    this.onOpen = onOpen;
    this.isOpen = false;
    this.physicsBody = null;

    // Visual
    const tex = TextureGenerator.doorTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const geo = new THREE.BoxGeometry(
      axis === 'z' ? 1.0 : 0.08,
      2.2,
      axis === 'z' ? 0.08 : 1.0
    );
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, 1.1, z);
    this.mesh.visible = visible;

    // Door frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4030, roughness: 0.9 });
    this.frame = new THREE.Group();

    // Frame sides
    const sideGeo = new THREE.BoxGeometry(
      axis === 'z' ? 0.06 : 0.1,
      2.3,
      axis === 'z' ? 0.1 : 0.06
    );
    const left = new THREE.Mesh(sideGeo, frameMat);
    const right = new THREE.Mesh(sideGeo, frameMat);
    if (axis === 'z') {
      left.position.set(x - 0.55, 1.15, z);
      right.position.set(x + 0.55, 1.15, z);
    } else {
      left.position.set(x, 1.15, z - 0.55);
      right.position.set(x, 1.15, z + 0.55);
    }
    this.frame.add(left, right);

    // Interaction data
    this.mesh.userData.interactable = true;
    this.mesh.userData.type = 'door';
    this.mesh.userData.doorRef = this;
    this.mesh.userData.prompt = locked ? (requiredCode ? 'Enter code' : 'Locked') : 'Open door';
  }

  /**
   * Register the door collider with physics
   */
  registerCollider(physics) {
    const w = this.axis === 'z' ? 1.0 : 0.3;
    const d = this.axis === 'z' ? 0.3 : 1.0;
    this.physicsBody = physics.addDoor(this.x, this.z, w, d, { door: this });
  }

  /**
   * Open the door
   */
  open(physics, audio) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.mesh.visible = false;

    // Remove physics body
    if (this.physicsBody && physics) {
      physics.removeBody(this.physicsBody);
      this.physicsBody = null;
    }

    if (audio) audio.playDoor();
    if (this.onOpen) this.onOpen();
  }

  /**
   * Try to interact with the door
   * @returns {string|null} message if can't open, null if opened
   */
  tryOpen(playerInventory, physics, audio) {
    if (this.isOpen) return null;

    if (this.requiredKey) {
      if (!playerInventory.has(this.requiredKey)) {
        return 'You need a key.';
      }
    }

    if (this.requiredCode) {
      // Code entry handled by UI
      return 'CODE_REQUIRED';
    }

    if (this.locked && !this.requiredKey && !this.requiredCode) {
      return 'This door is locked.';
    }

    this.locked = false;
    this.open(physics, audio);
    return null;
  }

  addToScene(scene) {
    scene.add(this.mesh);
    scene.add(this.frame);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    if (this.mesh.material.map) this.mesh.material.map.dispose();
  }
}
