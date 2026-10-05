/**
 * Corridor — Builds a corridor segment with lights
 */
import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';
import { FluorescentLight } from './Lights.js';

export class Corridor {
  constructor() {
    this.group = new THREE.Group();
    this.colliders = [];
    this.lights = [];
  }

  /**
   * Create a corridor segment
   * @param {object} opts
   * @param {number} opts.length - length along primary axis
   * @param {number} opts.width - corridor width
   * @param {number} opts.height
   * @param {number} opts.x - start X
   * @param {number} opts.z - start Z
   * @param {string} opts.direction - 'north'|'south'|'east'|'west'
   * @param {boolean} opts.addLights
   * @param {number} opts.lightSpacing
   * @param {string} opts.floorType
   */
  create(opts = {}) {
    const {
      length = 10, width = 4, height = 3,
      x = 0, z = 0,
      direction = 'north',
      addLights = true,
      lightSpacing = 4,
      floorType = 'carpet',
      flickerLights = false
    } = opts;

    this.group.position.set(x, 0, z);

    const wallTex = TextureGenerator.wallTexture();
    const floorTex = floorType === 'concrete'
      ? TextureGenerator.concreteTexture()
      : TextureGenerator.carpetTexture();
    const ceilTex = TextureGenerator.ceilingTexture();

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 });
    const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 });

    const isNS = direction === 'north' || direction === 'south';
    const corridorW = isNS ? width : length;
    const corridorD = isNS ? length : width;

    // Floor
    floorTex.repeat.set(corridorW / 4, corridorD / 4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(corridorW, corridorD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);

    // Ceiling
    ceilTex.repeat.set(corridorW / 4, corridorD / 4);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(corridorW, corridorD), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = height;
    this.group.add(ceil);

    // Walls
    if (isNS) {
      // Left wall (west)
      const lwTex = TextureGenerator.wallTexture();
      lwTex.repeat.set(length / 4, 1);
      const lwMat = new THREE.MeshStandardMaterial({ map: lwTex, roughness: 0.9 });
      const lw = new THREE.Mesh(new THREE.BoxGeometry(0.15, height, length), lwMat);
      lw.position.set(-width / 2, height / 2, 0);
      this.group.add(lw);
      this.colliders.push({ x: x - width / 2, z: z, w: 0.3, d: length });

      // Right wall (east)
      const rwTex = TextureGenerator.wallTexture();
      rwTex.repeat.set(length / 4, 1);
      const rwMat = new THREE.MeshStandardMaterial({ map: rwTex, roughness: 0.9 });
      const rw = new THREE.Mesh(new THREE.BoxGeometry(0.15, height, length), rwMat);
      rw.position.set(width / 2, height / 2, 0);
      this.group.add(rw);
      this.colliders.push({ x: x + width / 2, z: z, w: 0.3, d: length });
    } else {
      // North wall
      const nwTex = TextureGenerator.wallTexture();
      nwTex.repeat.set(length / 4, 1);
      const nwMat = new THREE.MeshStandardMaterial({ map: nwTex, roughness: 0.9 });
      const nw = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.15), nwMat);
      nw.position.set(0, height / 2, -width / 2);
      this.group.add(nw);
      this.colliders.push({ x: x, z: z - width / 2, w: length, d: 0.3 });

      // South wall
      const swTex = TextureGenerator.wallTexture();
      swTex.repeat.set(length / 4, 1);
      const swMat = new THREE.MeshStandardMaterial({ map: swTex, roughness: 0.9 });
      const sw = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.15), swMat);
      sw.position.set(0, height / 2, width / 2);
      this.group.add(sw);
      this.colliders.push({ x: x, z: z + width / 2, w: length, d: 0.3 });
    }

    // Lights
    if (addLights) {
      const count = Math.floor(length / lightSpacing);
      for (let i = 0; i < count; i++) {
        const offset = -length / 2 + lightSpacing / 2 + i * lightSpacing;
        const lx = isNS ? 0 : offset;
        const lz = isNS ? offset : 0;
        const fl = new FluorescentLight({
          x: x + lx, y: height - 0.05, z: z + lz,
          flicker: flickerLights || (Math.random() > 0.7),
          intensity: 0.6
        });
        this.lights.push(fl);
      }
    }

    return this;
  }

  addToScene(scene) {
    scene.add(this.group);
    this.lights.forEach(l => l.addToScene(scene));
  }

  registerColliders(physics) {
    for (const c of this.colliders) {
      physics.addWall(c.x, c.z, c.w, c.d);
    }
  }

  update(dt) {
    this.lights.forEach(l => l.update(dt));
  }

  dispose() {
    this.group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
  }
}
