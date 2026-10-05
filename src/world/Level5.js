/**
 * Level 5 — THE EXIT
 * Final level combining all mechanics. Find 3 clues, then find the exit.
 */
import * as THREE from 'three';
import { LevelBase } from './LevelBase.js';
import { TextureGenerator } from '../environment/TextureGenerator.js';
import { FluorescentLight } from '../environment/Lights.js';
import { Furniture } from '../environment/Furniture.js';
import { Door } from '../environment/Door.js';
import { Watcher } from '../entity/Watcher.js';

export class Level5 extends LevelBase {
  constructor(game) {
    super(game);
    this.cluesFound = 0;
    this.totalClues = 3;
    this.watcher = null;
    this.finalSequenceStarted = false;
  }

  getSpawnPosition() {
    return { x: 0, z: 0 };
  }

  build() {
    const scene = this.scene;
    const physics = this.physics;
    const h = 3;

    // Complex layout: corridor → office → maintenance → strange room → exit

    // === Entry corridor (going south) ===
    this._buildSection(scene, physics, 0, -8, 4, 16, h);
    // Walls
    physics.addWall(-2, -8, 0.3, 16);
    physics.addWall(2, -8, 0.3, 16);
    physics.addWall(0, 0.5, 4, 0.3); // north cap
    this._addVisualWalls(scene, 0, -8, 4, 16, h, false);
    scene.add(this._makeWall(4, h, 0.15, 0, h / 2, 0.5));

    // Lights
    for (let z = -2; z > -16; z -= 4) {
      const fl = new FluorescentLight({
        x: 0, y: h - 0.05, z: z,
        flicker: Math.random() > 0.5,
        intensity: 0.3
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // === Office Room (east side at z=-8) ===
    // Opening in east wall at z=-8
    this._buildSection(scene, physics, 7, -8, 8, 6, h);
    physics.addWall(11, -8, 0.3, 6);  // east wall
    physics.addWall(7, -11, 8, 0.3);  // south wall
    physics.addWall(7, -5, 8, 0.3);   // north wall

    const desk = Furniture.createDesk(8, 0, -8);
    scene.add(desk);
    scene.add(Furniture.createChair(8, 0, -7));
    scene.add(Furniture.createComputer(8, 0.76, -8.2));
    scene.add(Furniture.createCabinet(10, 0, -10));

    // Clue 1 — note on desk
    this._addClue(scene, 8.3, 0.77, -8, `FINAL LOG\n\nThe exit exists.\nBut it moves.\n\nLook for the green sign.\nIt will guide you.\n\nDo not trust the other doors.`);

    const officeLight = new FluorescentLight({ x: 7, y: h - 0.05, z: -8, intensity: 0.35, flicker: true });
    officeLight.addToScene(scene);
    this.lights.push(officeLight);

    // === Maintenance Room (west side at z=-14) ===
    this._buildSection(scene, physics, -7, -14, 8, 6, h);
    physics.addWall(-11, -14, 0.3, 6); // west wall
    physics.addWall(-7, -17, 8, 0.3);  // south wall
    physics.addWall(-7, -11, 8, 0.3);  // north wall (partial - opening to corridor)

    scene.add(Furniture.createElectricalBox(-10, 1.3, -14));
    scene.add(Furniture.createVent(-7, 2.5, -16.8));

    // Clue 2
    this._addClue(scene, -9, 0.5, -13, `MAINTENANCE NOTE\n\nPower fluctuations detected.\nSource unknown.\n\nDo NOT enter sub-level B.\n\nThe last person who went down\nnever came back up.`);

    const maintLight = new FluorescentLight({ x: -7, y: h - 0.05, z: -14, intensity: 0.25 });
    maintLight.addToScene(scene);
    this.lights.push(maintLight);

    // === Strange Room (south, at z=-20) ===
    this._buildSection(scene, physics, 0, -22, 6, 6, h);
    physics.addWall(-3, -22, 0.3, 6);
    physics.addWall(3, -22, 0.3, 6);
    physics.addWall(0, -25, 6, 0.3);
    // Opening from corridor to strange room
    // Need opening in south cap of corridor

    // Strange room is darker
    const strangeLight = new FluorescentLight({
      x: 0, y: h - 0.05, z: -22,
      intensity: 0.15,
      flicker: true
    });
    strangeLight.addToScene(scene);
    this.lights.push(strangeLight);

    // Clue 3
    this._addClue(scene, 0, 0.01, -23, `Day ???\n\nI have been here before.\nI have read this note before.\n\nThe exit was right there.\nI opened it.\n\nBut I woke up here again.\n\nOr did I?`);

    // Corridor south cap — partial wall with opening to strange room
    physics.addWall(-3, -16, 2, 0.3);
    physics.addWall(3, -16, 2, 0.3);

    // Strange room → final exit corridor
    this._buildSection(scene, physics, 0, -30, 4, 8, h);
    physics.addWall(-2, -30, 0.3, 8);
    physics.addWall(2, -30, 0.3, 8);

    // Exit door
    const exitDoor = new Door({
      x: 0, z: -34,
      axis: 'z',
      locked: true,
      onOpen: () => {
        // Trigger ending
        this.game.showEnding();
      }
    });
    exitDoor.mesh.userData.prompt = 'Exit';
    exitDoor.addToScene(scene);
    exitDoor.registerCollider(physics);
    this.doors.push(exitDoor);
    this.interaction.addInteractable(exitDoor.mesh);
    this.exitDoor = exitDoor;

    physics.addWall(0, -34.5, 4, 0.3); // End wall

    // Exit sign
    scene.add(Furniture.createExitSign(0, 2.6, -33.5));

    // Very dim ambient
    scene.add(new THREE.AmbientLight(0x6a6050, 0.06));

    // === THE WATCHER (appears again) ===
    this.watcher = new Watcher(scene, this.audio);
    this.watcher.setWaypoints([
      { x: 0, z: -12 },
      { x: 7, z: -8 },
      { x: -7, z: -14 },
      { x: 0, z: -22 },
      { x: 0, z: -28 }
    ]);
    this.scheduleTimeout(() => {
      if (this.watcher) this.watcher.activate(0, -20);
    }, 15000);

    this.setObjective(`Find 3 clues. (0/${this.totalClues})`);
    this.audio.startAmbientDrone(0.03);

    this.horror.scheduleEvent('distant_sound', 10);
    this.horror.scheduleEvent('scare_sting', 30);
  }

  _addClue(scene, x, y, z, text) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
    );
    mesh.position.set(x, y + 0.05, z);
    mesh.userData.interactable = true;
    mesh.userData.type = 'clue';
    mesh.userData.prompt = 'Read clue';
    mesh.userData.noteText = text;
    scene.add(mesh);
    this.interaction.addInteractable(mesh);
  }

  _buildSection(scene, physics, cx, cz, w, d, h) {
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

  _addVisualWalls(scene, cx, cz, w, d, h, horizontal) {
    const wallMat = () => new THREE.MeshStandardMaterial({
      map: TextureGenerator.wallTexture(), roughness: 0.9
    });

    if (horizontal) {
      scene.add(this._makeWall(w, h, 0.15, cx, h / 2, cz + d / 2));
      scene.add(this._makeWall(w, h, 0.15, cx, h / 2, cz - d / 2));
    } else {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, d), wallMat());
      e.position.set(cx + w / 2, h / 2, cz);
      scene.add(e);
      const ww = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, d), wallMat());
      ww.position.set(cx - w / 2, h / 2, cz);
      scene.add(ww);
    }
  }

  _makeWall(w, h, d, x, y, z) {
    const tex = TextureGenerator.wallTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  onClueFound() {
    this.cluesFound++;
    this.setObjective(`Find 3 clues. (${this.cluesFound}/${this.totalClues})`);

    if (this.cluesFound >= this.totalClues) {
      this.setObjective('Find the exit.');
      // Unlock exit door
      if (this.exitDoor) {
        this.exitDoor.locked = false;
        this.exitDoor.mesh.userData.prompt = 'Open exit';
      }
      // Start final sequence
      this._startFinalSequence();
    }
  }

  _startFinalSequence() {
    if (this.finalSequenceStarted) return;
    this.finalSequenceStarted = true;

    this.audio.playScareSting();
    this.game.player.shake(0.04);

    // Lights flicker and go dim
    this.scheduleTimeout(() => {
      for (const light of this.lights) {
        light.flicker = true;
      }
    }, 1000);

    this.scheduleTimeout(() => {
      for (let i = 0; i < this.lights.length; i += 2) {
        this.lights[i].setOff(true);
      }
    }, 3000);

    // Entity appears briefly
    if (this.watcher && !this.watcher.active) {
      this.watcher.activate(0, -15);
    }

    this.audio.playEntityDrone(5);
  }

  update(dt) {
    super.update(dt);

    const playerPos = this.game.player.getPosition();
    const playerDir = this.game.player.getDirection();

    if (this.watcher) {
      this.watcher.update(dt, playerPos, playerDir);
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
