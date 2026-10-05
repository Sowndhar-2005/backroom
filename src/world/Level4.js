/**
 * Level 4 — SOMETHING IS THERE
 * Introduces the Watcher entity. Dark corridors with entity encounters.
 */
import * as THREE from 'three';
import { LevelBase } from './LevelBase.js';
import { TextureGenerator } from '../environment/TextureGenerator.js';
import { FluorescentLight } from '../environment/Lights.js';
import { Furniture } from '../environment/Furniture.js';
import { Door } from '../environment/Door.js';
import { Watcher } from '../entity/Watcher.js';

export class Level4 extends LevelBase {
  constructor(game) {
    super(game);
    this.watcher = null;
    this.noteRead = false;
  }

  getSpawnPosition() {
    return { x: 0, z: 0 };
  }

  build() {
    const scene = this.scene;
    const physics = this.physics;
    const h = 3;

    // === L-shaped corridor system ===
    // Main corridor going south
    this._buildCorridor(scene, physics, 0, -15, 4, 30, h);
    // Turn east
    this._buildCorridor(scene, physics, 15, -30, 30, 4, h, true);
    // Go south again
    this._buildCorridor(scene, physics, 30, -45, 4, 26, h);

    // Connect corner 1 (south end of first corridor to east corridor)
    this._buildFloorCeiling(scene, 0, -30, 4, 4, h);
    physics.addWall(2, -32, 0.3, 4);

    // Connect corner 2 (east corridor to second south corridor)
    this._buildFloorCeiling(scene, 30, -32, 4, 4, h);
    physics.addWall(28, -30, 0.3, 4);

    // End caps
    physics.addWall(0, 1, 4.5, 0.3);   // north cap of first corridor
    physics.addWall(30, -58, 4.5, 0.3); // south cap of second corridor

    // Cap walls visual
    const wallMat = () => new THREE.MeshStandardMaterial({
      map: TextureGenerator.wallTexture(), roughness: 0.9
    });
    scene.add(this._makeWall(4, h, 0.15, 0, h / 2, 1, wallMat()));
    scene.add(this._makeWall(4, h, 0.15, 30, h / 2, -58, wallMat()));

    // Lights — sparse and dim
    const lightPositions = [
      [0, -4], [0, -10], [0, -18], [0, -24],
      [6, -30], [12, -30], [20, -30], [26, -30],
      [30, -36], [30, -42], [30, -50], [30, -56]
    ];
    for (let i = 0; i < lightPositions.length; i++) {
      const [lx, lz] = lightPositions[i];
      const fl = new FluorescentLight({
        x: lx, y: h - 0.05, z: lz,
        flicker: i % 3 === 0,
        intensity: 0.35,
        startOff: i === 5 || i === 8 // some lights off
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // Warning note at start
    const noteMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.01, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
    );
    noteMesh.position.set(0, 0.01, -3);
    noteMesh.userData.interactable = true;
    noteMesh.userData.type = 'note';
    noteMesh.userData.prompt = 'Read note';
    noteMesh.userData.noteText = `If you hear footsteps behind you,\n\ndo not run immediately.\n\nIt watches. It waits.\n\nDo not stare for too long.\n\nDo not look away too quickly.\n\nJust keep moving.`;
    scene.add(noteMesh);
    this.interaction.addInteractable(noteMesh);

    // Exit door at end
    const exitDoor = new Door({
      x: 30, z: -57.5,
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

    scene.add(Furniture.createExitSign(30, 2.6, -57));

    // Ambient — darker
    scene.add(new THREE.AmbientLight(0x8a8070, 0.08));

    // === THE WATCHER ===
    this.watcher = new Watcher(scene, this.audio);
    this.watcher.setWaypoints([
      { x: 0, z: -25 },
      { x: 0, z: -15 },
      { x: 15, z: -30 },
      { x: 25, z: -30 },
      { x: 30, z: -40 },
      { x: 30, z: -50 }
    ]);
    // Activate after a delay
    this.scheduleTimeout(() => {
      if (this.watcher) this.watcher.activate(0, -28);
    }, 10000);

    this.setObjective('Something is watching...');
    this.audio.startAmbientHum(100, 0.015);
    this.audio.startAmbientDrone(0.025);

    this.horror.scheduleEvent('distant_sound', 8);
    this.horror.scheduleEvent('scare_sting', 25);
    this.horror.startAmbientScares(15, 35);
  }

  _buildCorridor(scene, physics, cx, cz, w, l, h, horizontal = false) {
    this._buildFloorCeiling(scene, cx, cz, horizontal ? l : w, horizontal ? w : l, h);

    const wallMat = () => new THREE.MeshStandardMaterial({
      map: TextureGenerator.wallTexture(), roughness: 0.9
    });

    if (horizontal) {
      // North and south walls
      const n = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.15), wallMat());
      n.position.set(cx, h / 2, cz + w / 2);
      scene.add(n);
      physics.addWall(cx, cz + w / 2, l, 0.3);

      const s = new THREE.Mesh(new THREE.BoxGeometry(l, h, 0.15), wallMat());
      s.position.set(cx, h / 2, cz - w / 2);
      scene.add(s);
      physics.addWall(cx, cz - w / 2, l, 0.3);
    } else {
      // East and west walls
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, l), wallMat());
      e.position.set(cx + w / 2, h / 2, cz);
      scene.add(e);
      physics.addWall(cx + w / 2, cz, 0.3, l);

      const ww = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, l), wallMat());
      ww.position.set(cx - w / 2, h / 2, cz);
      scene.add(ww);
      physics.addWall(cx - w / 2, cz, 0.3, l);
    }
  }

  _buildFloorCeiling(scene, cx, cz, w, d, h) {
    const floorTex = TextureGenerator.concreteTexture();
    floorTex.repeat.set(w / 4, d / 4);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0, cz);
    scene.add(floor);

    const ceilTex = TextureGenerator.ceilingTexture();
    ceilTex.repeat.set(w / 4, d / 4);
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, h, cz);
    scene.add(ceil);
  }

  _makeWall(w, h, d, x, y, z, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  update(dt) {
    super.update(dt);

    const playerPos = this.game.player.getPosition();
    const playerDir = this.game.player.getDirection();

    // Update watcher
    if (this.watcher) {
      this.watcher.update(dt, playerPos, playerDir);

      // Shake camera if watcher is chasing
      if (this.watcher.getState() === 'CHASE') {
        this.game.player.shake(0.02);
      }
    }

    this.horror.update(dt, playerPos, {
      onFlicker: () => {
        if (this.lights.length > 0) {
          const idx = Math.floor(Math.random() * this.lights.length);
          this.lights[idx].flicker = true;
        }
      }
    });
  }

  cleanup() {
    super.cleanup();
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = null;
    }
  }
}
