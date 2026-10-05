/**
 * Level 3 — EMPTY OFFICE
 * Abandoned office floor. Find key, note, access code. Rooms change when revisited.
 */
import * as THREE from 'three';
import { LevelBase } from './LevelBase.js';
import { TextureGenerator } from '../environment/TextureGenerator.js';
import { FluorescentLight } from '../environment/Lights.js';
import { Furniture } from '../environment/Furniture.js';
import { Door } from '../environment/Door.js';

export class Level3 extends LevelBase {
  constructor(game) {
    super(game);
    this.hasKey = false;
    this.hasCode = false;
    this.noteCount = 0;
    this.visitCounts = {}; // room tracking
    this.changingObjects = [];
    this.accessCode = '742';
  }

  getSpawnPosition() {
    return { x: 0, z: 0 };
  }

  build() {
    const scene = this.scene;
    const physics = this.physics;
    const h = 3;

    // Main corridor running east-west
    this._buildFloorCeiling(scene, 0, 0, 30, 4, h);

    // Corridor walls (north/south)
    const wallTex = TextureGenerator.wallTexture();
    const wallMat = () => new THREE.MeshStandardMaterial({ map: TextureGenerator.wallTexture(), roughness: 0.9 });

    // North corridor wall
    const nWall = new THREE.Mesh(new THREE.BoxGeometry(30, h, 0.15), wallMat());
    nWall.position.set(0, h / 2, 2);
    scene.add(nWall);
    physics.addWall(0, 2, 30, 0.3);

    // South corridor wall (with gaps for rooms)
    // Segments: left solid | room1 gap | solid | room2 gap | solid | room3 gap | right solid
    const southSegments = [
      { x: -12, w: 6 },  // far left
      { x: -5, w: 4 },   // between room1 and room2
      { x: 2, w: 4 },    // between room2 and room3
      { x: 9, w: 4 },    // between room3 and exit area
      { x: 13.5, w: 3 }  // far right
    ];
    for (const seg of southSegments) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(seg.w, h, 0.15), wallMat());
      w.position.set(seg.x, h / 2, -2);
      scene.add(w);
      physics.addWall(seg.x, -2, seg.w, 0.3);
    }

    // End caps
    // West end
    const wCap = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, 4), wallMat());
    wCap.position.set(-15, h / 2, 0);
    scene.add(wCap);
    physics.addWall(-15, 0, 0.3, 4);

    // East end
    const eCap = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, 4), wallMat());
    eCap.position.set(15, h / 2, 0);
    scene.add(eCap);
    physics.addWall(15, 0, 0.3, 4);

    // Corridor lights
    for (let x = -12; x <= 12; x += 4) {
      const fl = new FluorescentLight({
        x: x, y: h - 0.05, z: 0,
        flicker: Math.random() > 0.6,
        intensity: 0.5
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // === ROOM 1 — Storage Room (has the key) ===
    this._buildRoom(scene, physics, -8, -7, 6, 6, h);
    // Key on shelf
    const keyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xc4a030, metalness: 0.8, roughness: 0.3 })
    );
    keyMesh.position.set(-8, 1.0, -7);
    keyMesh.userData.interactable = true;
    keyMesh.userData.type = 'key';
    keyMesh.userData.keyId = 'office_key';
    keyMesh.userData.prompt = 'Take key';
    scene.add(keyMesh);
    this.interaction.addInteractable(keyMesh);

    scene.add(Furniture.createCabinet(-10, 0, -8));
    scene.add(Furniture.createCabinet(-10, 0, -6));

    // Room 1 light
    const r1Light = new FluorescentLight({ x: -8, y: h - 0.05, z: -7, intensity: 3.5, flicker: true });
    r1Light.addToScene(scene);
    this.lights.push(r1Light);

    // === ROOM 2 — Meeting Room (has a note with code hint) ===
    this._buildRoom(scene, physics, -1, -7, 6, 6, h);

    const desk2 = Furniture.createDesk(-1, 0, -8);
    scene.add(desk2);
    scene.add(Furniture.createChair(-1, 0, -7));
    scene.add(Furniture.createChair(-3, 0, -7));
    scene.add(Furniture.createChair(1, 0, -7));

    // Note with code hint
    const noteMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
    );
    noteMesh.position.set(-1, 0.8, -8);
    noteMesh.userData.interactable = true;
    noteMesh.userData.type = 'note';
    noteMesh.userData.prompt = 'Read note';
    noteMesh.userData.noteText = `MAINTENANCE LOG — Entry 7\n\nThe emergency exit code was changed.\n\nNew code: Seven. Four. Two.\n\nDo NOT share this with unauthorized personnel.\n\n— Building Management`;
    scene.add(noteMesh);
    this.interaction.addInteractable(noteMesh);

    const r2Light = new FluorescentLight({ x: -1, y: h - 0.05, z: -7, intensity: 0.45 });
    r2Light.addToScene(scene);
    this.lights.push(r2Light);

    // Computer that turns on (changing object)
    const computer = Furniture.createComputer(-1, 0.76, -8.2, false);
    scene.add(computer);
    this.changingObjects.push({
      object: computer,
      room: 'room2',
      visitThreshold: 3,
      applied: false,
      apply: () => {
        // Make screen glow
        computer.traverse(child => {
          if (child.isMesh && child.material.emissive) {
            child.material.emissive.set(0x1a3a2a);
            child.material.emissiveIntensity = 0.5;
          }
        });
      }
    });

    // === ROOM 3 — Office (has another note) ===
    this._buildRoom(scene, physics, 6, -7, 6, 6, h);

    const desk3 = Furniture.createDesk(6, 0, -7);
    scene.add(desk3);
    scene.add(Furniture.createComputer(6, 0.76, -7.2));
    scene.add(Furniture.createChair(6, 0, -6));

    const noteMesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.01, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: 0.7 })
    );
    noteMesh2.position.set(6.3, 0.77, -7);
    noteMesh2.userData.interactable = true;
    noteMesh2.userData.type = 'note';
    noteMesh2.userData.prompt = 'Read note';
    noteMesh2.userData.noteText = `Day 03\n\nI walked this corridor again.\n\nI know I have already seen this room.\n\nBut the door was not here before.\n\nThe building does not stay the same.`;
    scene.add(noteMesh2);
    this.interaction.addInteractable(noteMesh2);

    const r3Light = new FluorescentLight({ x: 6, y: h - 0.05, z: -7, intensity: 0.45, flicker: true });
    r3Light.addToScene(scene);
    this.lights.push(r3Light);

    // === EXIT — Locked door at east end requiring key + code ===
    const exitDoor = new Door({
      x: 14.5, z: 0,
      axis: 'x',
      locked: true,
      requiredKey: 'office_key',
      requiredCode: this.accessCode,
      onOpen: () => {
        this.completeLevel();
      }
    });
    exitDoor.addToScene(scene);
    exitDoor.registerCollider(physics);
    this.doors.push(exitDoor);
    this.interaction.addInteractable(exitDoor.mesh);

    // Exit sign
    scene.add(Furniture.createExitSign(14.5, 2.6, 0));

    // Ambient
    scene.add(new THREE.AmbientLight(0xc8b880, 0.1));

    this.setObjective('Find the key and the exit code.');
    this.audio.startAmbientHum(120, 0.02);

    this.horror.scheduleEvent('distant_sound', 20);
    this.horror.startAmbientScares(20, 40);
  }

  _buildFloorCeiling(scene, cx, cz, w, d, h) {
    const floorTex = TextureGenerator.carpetTexture();
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

  _buildRoom(scene, physics, cx, cz, w, d, h) {
    this._buildFloorCeiling(scene, cx, cz, w, d, h);

    const wallMat = () => new THREE.MeshStandardMaterial({
      map: TextureGenerator.wallTexture(),
      roughness: 0.9
    });

    // South wall
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), wallMat());
    s.position.set(cx, h / 2, cz - d / 2);
    scene.add(s);
    physics.addWall(cx, cz - d / 2, w, 0.3);

    // East wall
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, d), wallMat());
    e.position.set(cx + w / 2, h / 2, cz);
    scene.add(e);
    physics.addWall(cx + w / 2, cz, 0.3, d);

    // West wall
    const ww = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, d), wallMat());
    ww.position.set(cx - w / 2, h / 2, cz);
    scene.add(ww);
    physics.addWall(cx - w / 2, cz, 0.3, d);
  }

  update(dt) {
    super.update(dt);

    const playerPos = this.game.player.getPosition();
    this.horror.update(dt, playerPos, {
      onFlicker: () => {
        if (this.lights.length > 0) {
          const idx = Math.floor(Math.random() * this.lights.length);
          this.lights[idx].flicker = true;
        }
      }
    });
  }
}
