/**
 * Level 2 — THE HALLWAY
 * Long repeating corridors that loop. Player must find environmental changes.
 */
import * as THREE from 'three';
import { LevelBase } from './LevelBase.js';
import { TextureGenerator } from '../environment/TextureGenerator.js';
import { FluorescentLight } from '../environment/Lights.js';
import { Furniture } from '../environment/Furniture.js';
import { Door } from '../environment/Door.js';

export class Level2 extends LevelBase {
  constructor(game) {
    super(game);
    this.loopCount = 0;
    this.loopTriggerZ = -45; // When player crosses this Z, count a loop
    this.hasTriggeredLoop = false;
    this.anomalyObjects = [];
    this.exitDoor = null;
  }

  getSpawnPosition() {
    return { x: 0, z: 0 };
  }

  build() {
    const scene = this.scene;
    const physics = this.physics;
    const h = 3;
    const corridorWidth = 4;

    // Build a long corridor going south (negative Z)
    // Total corridor: 50m long
    const corridorLength = 50;

    this._buildLongCorridor(scene, physics, 0, -corridorLength / 2, corridorWidth, corridorLength, h);

    // Add side rooms with identical doors
    const doorPositions = [-8, -16, -24, -32, -40];
    for (const dz of doorPositions) {
      // Door on left side
      this._addSideDoor(scene, physics, -corridorWidth / 2, dz, 'west', h);
      // Door on right side
      this._addSideDoor(scene, physics, corridorWidth / 2, dz, 'east', h);
    }

    // Lights along corridor
    for (let z = -2; z > -corridorLength; z -= 4) {
      const fl = new FluorescentLight({
        x: 0, y: h - 0.05, z: z,
        flicker: false,
        intensity: 0.55
      });
      fl.addToScene(scene);
      this.lights.push(fl);
    }

    // End walls
    physics.addWall(0, 0.5, corridorWidth + 1, 0.3);  // start cap
    physics.addWall(0, -corridorLength - 0.5, corridorWidth + 1, 0.3); // end cap

    // North cap wall visual
    const wallTex = TextureGenerator.wallTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const nCap = new THREE.Mesh(new THREE.BoxGeometry(corridorWidth, h, 0.15), wallMat);
    nCap.position.set(0, h / 2, 0.5);
    scene.add(nCap);

    // South cap - visual and physics already added
    const sCap = new THREE.Mesh(new THREE.BoxGeometry(corridorWidth, h, 0.15), wallMat.clone());
    sCap.position.set(0, h / 2, -corridorLength - 0.5);
    scene.add(sCap);

    // Ambient
    scene.add(new THREE.AmbientLight(0xc8b880, 0.1));

    this.setObjective('Find the exit.');
    this.audio.startAmbientHum(120, 0.02);
    this.audio.startAmbientDrone(0.01);

    this.horror.scheduleEvent('distant_sound', 15);
    this.horror.startAmbientScares(25, 50);
  }

  _buildLongCorridor(scene, physics, cx, cz, w, l, h) {
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

  _addSideDoor(scene, physics, x, z, side, h) {
    // Just a visual door on the wall (non-functional until anomaly)
    const doorTex = TextureGenerator.doorTexture();
    const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.85 });
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.0), doorMat);
    doorMesh.position.set(x, 1.1, z);
    scene.add(doorMesh);
  }

  update(dt) {
    super.update(dt);

    const playerPos = this.game.player.getPosition();

    // Loop detection — when player reaches the far end, teleport back
    if (playerPos.z < this.loopTriggerZ && !this.hasTriggeredLoop) {
      this.hasTriggeredLoop = true;
      this.loopCount++;

      // Direct teleport via physics
      this._teleportPlayer(0, -2);

      // Apply anomalies based on loop count
      this._applyAnomaly(this.loopCount);

      this.scheduleTimeout(() => { this.hasTriggeredLoop = false; }, 1000);
    }

    // Reset trigger when player is near start
    if (playerPos.z > -5) {
      this.hasTriggeredLoop = false;
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

  _teleportPlayer(x, z) {
    this.physics.setPlayerPosition(x, z);
    this.game.player.camera.position.x = x;
    this.game.player.camera.position.z = z;
  }

  _applyAnomaly(loopNum) {
    const scene = this.scene;

    switch (loopNum) {
      case 1:
        // Everything normal — first loop
        this.setObjective('Keep walking...');
        break;

      case 2:
        // One light broken
        if (this.lights.length > 3) {
          this.lights[3].setOff(true);
        }
        this.setObjective('Something changed...');
        this.audio.playDistantImpact();
        break;

      case 3: {
        // A chair appears in the middle of the corridor
        const chair = Furniture.createChair(0, 0, -20);
        scene.add(chair);
        this.anomalyObjects.push(chair);
        break;
      }

      case 4: {
        // A new door appears — this is the exit
        const exitDoor = new Door({
          x: -2, z: -30,
          axis: 'x',
          locked: false,
          onOpen: () => {
            this.completeLevel();
          }
        });
        exitDoor.addToScene(scene);
        exitDoor.registerCollider(this.physics);
        this.doors.push(exitDoor);
        this.interaction.addInteractable(exitDoor.mesh);
        this.exitDoor = exitDoor;
        this.setObjective('A new door...');
        this.audio.playScareSting();
        break;
      }

      case 5:
        // Corridor becomes darker
        for (let i = 0; i < this.lights.length; i += 2) {
          this.lights[i].setOff(true);
        }
        this.setObjective('Find the new door.');
        break;

      default:
        // More loops — make it darker
        for (const light of this.lights) {
          light.setOff(true);
        }
        break;
    }
  }
}
