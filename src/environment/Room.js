/**
 * Room — Builds walls, floor, ceiling for a rectangular room
 */
import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class Room {
  constructor() {
    this.group = new THREE.Group();
    this.colliders = []; // { x, z, w, d } for physics
  }

  /**
   * Create a rectangular room
   * @param {object} opts
   * @param {number} opts.width - X dimension
   * @param {number} opts.depth - Z dimension
   * @param {number} opts.height - Y dimension
   * @param {number} opts.x - center X
   * @param {number} opts.z - center Z
   * @param {object} opts.openings - { north, south, east, west } arrays of { offset, width }
   * @param {string} opts.floorType - 'carpet' | 'concrete'
   */
  create(opts) {
    const {
      width = 10, depth = 10, height = 3,
      x = 0, z = 0,
      openings = {},
      floorType = 'carpet'
    } = opts;

    this.group.position.set(x, 0, z);

    const wallTex = TextureGenerator.wallTexture();
    wallTex.repeat.set(width / 4, 1);

    const floorTex = floorType === 'concrete'
      ? TextureGenerator.concreteTexture()
      : TextureGenerator.carpetTexture();
    floorTex.repeat.set(width / 4, depth / 4);

    const ceilTex = TextureGenerator.ceilingTexture();
    ceilTex.repeat.set(width / 4, depth / 4);

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 });
    const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 });

    // Floor
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.group.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(width, depth);
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = height;
    this.group.add(ceil);

    // Walls — create with openings support
    const wallThickness = 0.15;
    const halfW = width / 2;
    const halfD = depth / 2;

    // North wall (positive Z)
    this._createWall(wallMat, width, height, wallThickness,
      0, height / 2, halfD, 0, openings.north || [], x, z + halfD, width, wallThickness);

    // South wall (negative Z)
    this._createWall(wallMat, width, height, wallThickness,
      0, height / 2, -halfD, Math.PI, openings.south || [], x, z - halfD, width, wallThickness);

    // East wall (positive X)
    this._createWallZ(wallMat, depth, height, wallThickness,
      halfW, height / 2, 0, -Math.PI / 2, openings.east || [], x + halfW, z, wallThickness, depth);

    // West wall (negative X)
    this._createWallZ(wallMat, depth, height, wallThickness,
      -halfW, height / 2, 0, Math.PI / 2, openings.west || [], x - halfW, z, wallThickness, depth);

    return this;
  }

  _createWall(mat, wallWidth, height, thickness, px, py, pz, rotY, openings, physX, physZ, physW, physD) {
    if (openings.length === 0) {
      const tex = TextureGenerator.wallTexture();
      tex.repeat.set(wallWidth / 4, 1);
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
      const geo = new THREE.BoxGeometry(wallWidth, height, thickness);
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(px, py, pz);
      mesh.rotation.y = rotY;
      this.group.add(mesh);
      this.colliders.push({ x: physX, z: physZ, w: physW, d: Math.max(physD, 0.3) });
    } else {
      // Build wall segments around openings
      // Sort openings by offset
      const sorted = [...openings].sort((a, b) => a.offset - b.offset);
      let cursor = -wallWidth / 2;

      for (const opening of sorted) {
        const openStart = opening.offset - opening.width / 2;
        const openEnd = opening.offset + opening.width / 2;
        const segWidth = openStart - cursor;

        if (segWidth > 0.01) {
          const segCenter = cursor + segWidth / 2;
          this._addWallSegment(mat, segWidth, height, thickness, segCenter, py, pz, rotY, physX, physZ, physW, physD, wallWidth, cursor);
        }

        // Wall above opening (door frame top)
        const doorHeight = opening.height || 2.2;
        if (doorHeight < height) {
          const aboveH = height - doorHeight;
          const tex = TextureGenerator.wallTexture();
          const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
          const geo = new THREE.BoxGeometry(opening.width, aboveH, thickness);
          const mesh = new THREE.Mesh(geo, m);
          const appliedOffset = opening.offset;
          mesh.position.set(appliedOffset, doorHeight + aboveH / 2, pz);
          mesh.rotation.y = rotY;
          this.group.add(mesh);
        }

        cursor = openEnd;
      }

      // Final segment
      const remaining = wallWidth / 2 - cursor;
      if (remaining > 0.01) {
        const segCenter = cursor + remaining / 2;
        this._addWallSegment(mat, remaining, height, thickness, segCenter, py, pz, rotY, physX, physZ, physW, physD, wallWidth, cursor);
      }
    }
  }

  _createWallZ(mat, wallDepth, height, thickness, px, py, pz, rotY, openings, physX, physZ, physW, physD) {
    // Same logic but for walls running along Z axis
    if (openings.length === 0) {
      const tex = TextureGenerator.wallTexture();
      tex.repeat.set(wallDepth / 4, 1);
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
      const geo = new THREE.BoxGeometry(wallDepth, height, thickness);
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(px, py, pz);
      mesh.rotation.y = rotY;
      this.group.add(mesh);
      this.colliders.push({ x: physX, z: physZ, w: Math.max(physW, 0.3), d: physD });
    } else {
      const sorted = [...openings].sort((a, b) => a.offset - b.offset);
      let cursor = -wallDepth / 2;

      for (const opening of sorted) {
        const openStart = opening.offset - opening.width / 2;
        const openEnd = opening.offset + opening.width / 2;
        const segWidth = openStart - cursor;

        if (segWidth > 0.01) {
          const segCenter = cursor + segWidth / 2;
          const tex = TextureGenerator.wallTexture();
          tex.repeat.set(segWidth / 4, 1);
          const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
          const geo = new THREE.BoxGeometry(segWidth, height, thickness);
          const mesh = new THREE.Mesh(geo, m);
          mesh.position.set(px, py, segCenter);
          mesh.rotation.y = rotY;
          this.group.add(mesh);

          // Compute collider position based on orientation
          if (Math.abs(rotY - Math.PI / 2) < 0.1 || Math.abs(rotY + Math.PI / 2) < 0.1) {
            this.colliders.push({ x: physX, z: physZ + segCenter, w: 0.3, d: segWidth });
          }
        }

        // Door frame top
        const doorHeight = opening.height || 2.2;
        if (doorHeight < height) {
          const aboveH = height - doorHeight;
          const tex = TextureGenerator.wallTexture();
          const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
          const geo = new THREE.BoxGeometry(opening.width, aboveH, thickness);
          const mesh = new THREE.Mesh(geo, m);
          mesh.position.set(px, doorHeight + aboveH / 2, opening.offset);
          mesh.rotation.y = rotY;
          this.group.add(mesh);
        }

        cursor = openEnd;
      }

      const remaining = wallDepth / 2 - cursor;
      if (remaining > 0.01) {
        const segCenter = cursor + remaining / 2;
        const tex = TextureGenerator.wallTexture();
        tex.repeat.set(remaining / 4, 1);
        const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
        const geo = new THREE.BoxGeometry(remaining, height, thickness);
        const mesh = new THREE.Mesh(geo, m);
        mesh.position.set(px, py, segCenter);
        mesh.rotation.y = rotY;
        this.group.add(mesh);

        if (Math.abs(rotY - Math.PI / 2) < 0.1 || Math.abs(rotY + Math.PI / 2) < 0.1) {
          this.colliders.push({ x: physX, z: physZ + segCenter, w: 0.3, d: remaining });
        }
      }
    }
  }

  _addWallSegment(mat, segWidth, height, thickness, segCenter, py, pz, rotY, physX, physZ, physW, physD, wallWidth, cursor) {
    const tex = TextureGenerator.wallTexture();
    tex.repeat.set(segWidth / 4, 1);
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
    const geo = new THREE.BoxGeometry(segWidth, height, thickness);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(segCenter, py, pz);
    mesh.rotation.y = rotY;
    this.group.add(mesh);

    // Physics collider for this segment
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    this.colliders.push({
      x: physX + segCenter * cos,
      z: physZ + segCenter * sin,
      w: Math.abs(cos) > 0.5 ? segWidth : 0.3,
      d: Math.abs(cos) > 0.5 ? 0.3 : segWidth
    });
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  registerColliders(physics) {
    for (const c of this.colliders) {
      physics.addWall(c.x, c.z, c.w, c.d);
    }
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
