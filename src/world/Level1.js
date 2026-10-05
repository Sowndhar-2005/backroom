/**
 * Level 1 — ARRIVAL
 * Large yellow/beige room. Player wakes up, explores, finds a way out.
 * No monster. Focus on atmosphere.
 */
import * as THREE from 'three';
import { LevelBase } from './LevelBase.js';
import { TextureGenerator } from '../environment/TextureGenerator.js';
import { FluorescentLight } from '../environment/Lights.js';
import { Furniture } from '../environment/Furniture.js';
import { Door } from '../environment/Door.js';

export class Level1 extends LevelBase {
  constructor(game) {
    super(game);
    this.noteRead = false;
  }

  getSpawnPosition() {
    return { x: 0, z: 0 };
  }

  build() {
    const scene = this.scene;
    const physics = this.physics;
    const height = 3;

    // === MAIN ROOM (20x20) ===
    this._buildRoom(scene, physics, 0, 0, 20, 20, height, 'carpet', { skipNorthWall: true });

    // Outer walls physics
    // South wall
    physics.addWall(0, -10, 20, 0.3);
    // East wall
    physics.addWall(10, 0, 0.3, 20);
    // West wall
    physics.addWall(-10, 0, 0.3, 20);

    // North wall — two segments with 4m opening in middle (x=-2 to x=2)
    physics.addWall(-6, 10, 8, 0.3);  // left segment
    physics.addWall(6, 10, 8, 0.3);   // right segment

    // North visual wall segments with corridor opening
    const wallTex = TextureGenerator.wallTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const nWallLeft = new THREE.Mesh(new THREE.BoxGeometry(8, height, 0.15), wallMat);
    nWallLeft.position.set(-6, height / 2, 10);
    scene.add(nWallLeft);

    const nWallRight = new THREE.Mesh(new THREE.BoxGeometry(8, height, 0.15), wallMat.clone());
    nWallRight.position.set(6, height / 2, 10);
    scene.add(nWallRight);

    const nWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.6, 0.15), wallMat.clone());
    nWallTop.position.set(0, height - 0.3, 10);
    scene.add(nWallTop);

    // Pillars
    const pillarPositions = [
      [-5, -5], [5, -5], [-5, 5], [5, 5]
    ];
    for (const [px, pz] of pillarPositions) {
      const pillar = Furniture.createPillar(px, pz, height);
      scene.add(pillar);
      physics.addWall(px, pz, 0.5, 0.5);
    }

    // Fluorescent lights
    const lightPositions = [
      [0, 0], [-5, -5], [5, -5], [-5, 5], [5, 5],
      [0, -6], [0, 6], [-7, 0], [7, 0]
    ];
    for (const [lx, lz] of lightPositions) {
      const fl = new FluorescentLight({
        x: lx, y: height - 0.05, z: lz,
        flicker: Math.random() > 0.7,
        intensity: 3.5
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // A few chairs scattered
    scene.add(Furniture.createChair(-3, 0, -2));
    scene.add(Furniture.createChair(4, 0, 3));
    scene.add(Furniture.createChair(-7, 0, 7));

    // === CORRIDOR (north of main room) ===
    this._buildCorridor(scene, physics, 0, 18, 4, 16, height);

    // Corridor lights
    for (let z = 12; z <= 24; z += 4) {
      const fl = new FluorescentLight({
        x: 0, y: height - 0.05, z: z,
        flicker: z === 20, // one flickering light
        intensity: 3.0
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // === SMALL ROOM at end of corridor ===
    this._buildRoom(scene, physics, 0, 30, 8, 6, height, 'carpet', { skipSouthWall: true });

    // Walls for small room
    physics.addWall(0, 33, 8, 0.3);  // north wall
    physics.addWall(-4, 30, 0.3, 6); // west wall
    physics.addWall(4, 30, 0.3, 6);  // east wall
    // South wall with opening (corridor connects here from x=-2 to x=2)
    physics.addWall(-3, 27, 2, 0.3);
    physics.addWall(3, 27, 2, 0.3);

    const sWallLeft = new THREE.Mesh(new THREE.BoxGeometry(2, height, 0.15), wallMat.clone());
    sWallLeft.position.set(-3, height / 2, 27);
    scene.add(sWallLeft);

    const sWallRight = new THREE.Mesh(new THREE.BoxGeometry(2, height, 0.15), wallMat.clone());
    sWallRight.position.set(3, height / 2, 27);
    scene.add(sWallRight);

    const sWallTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.6, 0.15), wallMat.clone());
    sWallTop.position.set(0, height - 0.3, 27);
    scene.add(sWallTop);

    // Note on a table in main room
    const desk = Furniture.createDesk(2, 0, -3);
    scene.add(desk);

    const noteMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
    );
    noteMarker.position.set(2, 0.8, -3);
    noteMarker.userData.interactable = true;
    noteMarker.userData.type = 'note';
    noteMarker.userData.prompt = 'Read note';
    noteMarker.userData.noteText = `Day 01\n\nI woke up here.\n\nI don't remember entering this building.\n\nThe lights hum. The carpet feels wrong.\n\nThere must be a way out somewhere.`;
    scene.add(noteMarker);
    this.interaction.addInteractable(noteMarker);

    // Exit door in small room
    const exitDoor = new Door({
      x: 0, z: 33,
      axis: 'z',
      locked: false,
      onOpen: () => {
        this.completeLevel();
      }
    });
    exitDoor.addToScene(scene);
    exitDoor.registerCollider(physics);
    this.doors.push(exitDoor);
    this.interaction.addInteractable(exitDoor.mesh);

    // Exit sign
    scene.add(Furniture.createExitSign(0, 2.6, 32.5));

    // Ambient light — balanced for liminal atmosphere
    const ambient = new THREE.AmbientLight(0xdcd0a0, 0.55);
    scene.add(ambient);

    // Set objective
    this.setObjective('Find a way out.');

    // Ambient audio
    this.audio.startAmbientHum(120, 0.025);

    // Horror events — subtle
    this.horror.scheduleEvent('distant_sound', 30);
    this.horror.scheduleEvent('flicker', 45);
    this.horror.startAmbientScares(30, 60);
  }

  _buildRoom(scene, physics, cx, cz, w, d, h, floorType, options = {}) {
    const floorTex = floorType === 'concrete'
      ? TextureGenerator.concreteTexture()
      : TextureGenerator.carpetTexture();
    floorTex.repeat.set(w / 4, d / 4);

    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0, cz);
    scene.add(floor);

    const ceilTex = TextureGenerator.ceilingTexture();
    ceilTex.repeat.set(w / 4, d / 4);
    const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, h, cz);
    scene.add(ceil);

    // Walls visual
    const wallTex = TextureGenerator.wallTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });

    // North
    if (!options.skipNorthWall) {
      const nWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), wallMat.clone());
      nWall.position.set(cx, h / 2, cz + d / 2);
      scene.add(nWall);
    }

    // South
    if (!options.skipSouthWall) {
      const sWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), wallMat.clone());
      sWall.position.set(cx, h / 2, cz - d / 2);
      scene.add(sWall);
    }

    // East
    const eWallTex = TextureGenerator.wallTexture();
    eWallTex.repeat.set(d / 4, 1);
    const eWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h, d),
      new THREE.MeshStandardMaterial({ map: eWallTex, roughness: 0.9 })
    );
    eWall.position.set(cx + w / 2, h / 2, cz);
    scene.add(eWall);

    // West
    const wWallTex = TextureGenerator.wallTexture();
    wWallTex.repeat.set(d / 4, 1);
    const wWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h, d),
      new THREE.MeshStandardMaterial({ map: wWallTex, roughness: 0.9 })
    );
    wWall.position.set(cx - w / 2, h / 2, cz);
    scene.add(wWall);
  }

  _buildCorridor(scene, physics, cx, cz, w, l, h) {
    // Floor
    const floorTex = TextureGenerator.carpetTexture();
    floorTex.repeat.set(w / 4, l / 4);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, l),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0, cz);
    scene.add(floor);

    // Ceiling
    const ceilTex = TextureGenerator.ceilingTexture();
    ceilTex.repeat.set(w / 4, l / 4);
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(w, l),
      new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, h, cz);
    scene.add(ceil);

    // Left wall
    const lwTex = TextureGenerator.wallTexture();
    lwTex.repeat.set(l / 4, 1);
    const lw = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h, l),
      new THREE.MeshStandardMaterial({ map: lwTex, roughness: 0.9 })
    );
    lw.position.set(cx - w / 2, h / 2, cz);
    scene.add(lw);
    physics.addWall(cx - w / 2, cz, 0.3, l);

    // Right wall
    const rwTex = TextureGenerator.wallTexture();
    rwTex.repeat.set(l / 4, 1);
    const rw = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h, l),
      new THREE.MeshStandardMaterial({ map: rwTex, roughness: 0.9 })
    );
    rw.position.set(cx + w / 2, h / 2, cz);
    scene.add(rw);
    physics.addWall(cx + w / 2, cz, 0.3, l);
  }

  update(dt) {
    super.update(dt);

    // Update horror events
    const playerPos = this.game.player.getPosition();
    this.horror.update(dt, playerPos, {
      onFlicker: () => {
        // Pick a random light and flicker it
        if (this.lights.length > 0) {
          const light = this.lights[Math.floor(Math.random() * this.lights.length)];
          light.flicker = true;
        }
      }
    });
  }
}
