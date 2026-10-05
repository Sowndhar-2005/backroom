/**
 * Player — First-person camera, movement, physics, flashlight
 */
import * as THREE from 'three';
import { Flashlight } from './Flashlight.js';
import { clamp, lerp } from '../utils/MathUtils.js';

const WALK_SPEED = 4.0;
const RUN_SPEED = 7.0;
const PLAYER_HEIGHT = 1.7;
const HEAD_BOB_WALK = 0.03;
const HEAD_BOB_RUN = 0.05;
const HEAD_BOB_SPEED_WALK = 8;
const HEAD_BOB_SPEED_RUN = 12;
const JUMP_VELOCITY = 5.0;
const GRAVITY = 15.0;

export class Player {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physics = physicsWorld;

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, PLAYER_HEIGHT, 0);
    scene.add(this.camera);

    // Flashlight
    this.flashlight = new Flashlight(this.camera);

    // Euler angles for look
    this.yaw = 0;
    this.pitch = 0;

    // Vertical physics
    this.velocityY = 0;
    this.onGround = true;
    this.posY = PLAYER_HEIGHT;

    // Head bob
    this.bobPhase = 0;
    this.bobAmount = 0;
    this.cameraShake = 0;
    this.shakeDecay = 0;

    // Footstep timing
    this.footstepTimer = 0;
    this.isMoving = false;
    this.isRunning = false;

    // Spawn
    this.spawnPos = new THREE.Vector2(0, 0);
  }

  setSpawn(x, z) {
    this.spawnPos.set(x, z);
    this.physics.setPlayerPosition(x, z);
    this.camera.position.set(x, PLAYER_HEIGHT, z);
  }

  reset(x, z) {
    this.yaw = 0;
    this.pitch = 0;
    this.velocityY = 0;
    this.onGround = true;
    this.posY = PLAYER_HEIGHT;
    this.bobPhase = 0;
    this.bobAmount = 0;
    this.cameraShake = 0;
    this.footstepTimer = 0;
    this.physics.setPlayerPosition(x, z);
    this.camera.position.set(x, PLAYER_HEIGHT, z);
  }

  /** Apply camera shake */
  shake(amount = 0.05) {
    this.cameraShake = amount;
    this.shakeDecay = amount;
  }

  /**
   * Update the player each frame
   * @param {number} dt - delta time in seconds
   * @param {InputManager} input
   * @param {AudioManager} audio
   */
  update(dt, input, audio) {
    // ---- Look ----
    const mouseDelta = input.getMouseDelta();
    this.yaw -= mouseDelta.x;
    this.pitch -= mouseDelta.y;
    this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

    // ---- Movement direction ----
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const euler = new THREE.Euler(0, this.yaw, 0, 'YXZ');
    forward.applyEuler(euler);
    right.applyEuler(euler);

    let moveX = 0, moveZ = 0;
    if (input.isDown('KeyW')) { moveX += forward.x; moveZ += forward.z; }
    if (input.isDown('KeyS')) { moveX -= forward.x; moveZ -= forward.z; }
    if (input.isDown('KeyA')) { moveX -= right.x; moveZ -= right.z; }
    if (input.isDown('KeyD')) { moveX += right.x; moveZ += right.z; }

    // Normalize
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    this.isMoving = len > 0.01;
    this.isRunning = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
    const speed = this.isRunning ? RUN_SPEED : WALK_SPEED;

    if (this.isMoving) {
      moveX = (moveX / len);
      moveZ = (moveZ / len);
      this.physics.setPlayerVelocity(moveX * (speed / 60), moveZ * (speed / 60));
    } else {
      this.physics.setPlayerVelocity(0, 0);
    }

    // ---- Jump / Gravity ----
    if (input.justPressed('Space') && this.onGround) {
      this.velocityY = JUMP_VELOCITY;
      this.onGround = false;
    }

    this.velocityY -= GRAVITY * dt;
    this.posY += this.velocityY * dt;

    if (this.posY <= PLAYER_HEIGHT) {
      this.posY = PLAYER_HEIGHT;
      this.velocityY = 0;
      this.onGround = true;
    }

    // ---- Sync 3D position from physics ----
    const physPos = this.physics.getPlayerPosition();

    // ---- Head bob ----
    if (this.isMoving && this.onGround) {
      const bobSpeed = this.isRunning ? HEAD_BOB_SPEED_RUN : HEAD_BOB_SPEED_WALK;
      const bobAmt = this.isRunning ? HEAD_BOB_RUN : HEAD_BOB_WALK;
      this.bobPhase += bobSpeed * dt;
      this.bobAmount = lerp(this.bobAmount, bobAmt, dt * 10);
    } else {
      this.bobAmount = lerp(this.bobAmount, 0, dt * 8);
    }

    const headBob = Math.sin(this.bobPhase) * this.bobAmount;

    // ---- Camera shake ----
    let shakeOffset = 0;
    if (this.cameraShake > 0.001) {
      shakeOffset = (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.92;
    }

    // ---- Apply camera ----
    this.camera.position.set(
      physPos.x,
      this.posY + headBob + shakeOffset,
      physPos.z
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    // ---- Footsteps ----
    if (this.isMoving && this.onGround) {
      const stepInterval = this.isRunning ? 0.3 : 0.5;
      this.footstepTimer += dt;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        audio.playFootstep(this.isRunning);
      }
    } else {
      this.footstepTimer = 0.4; // almost ready for next step on move start
    }

    // ---- Flashlight toggle ----
    if (input.justPressed('KeyF')) {
      const state = this.flashlight.toggle();
      audio.playFlashlight();
      this._updateFlashlightUI(state);
    }

    this.flashlight.update();
  }

  _updateFlashlightUI(on) {
    const el = document.getElementById('hud-flashlight');
    if (el) {
      el.textContent = on ? '🔦 ON' : '🔦 OFF';
      el.classList.toggle('hidden', false);
    }
  }

  getPosition() {
    return this.camera.position.clone();
  }

  getDirection() {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(this.camera.rotation);
    return dir;
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    // cleanup if needed
  }
}
