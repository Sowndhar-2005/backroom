/**
 * Watcher — The entity that observes and stalks the player
 * Simple state-machine AI with IDLE, OBSERVE, MOVE, HIDE, CHASE, DISAPPEAR states.
 */
import * as THREE from 'three';
import { distance2D, randomRange } from '../utils/MathUtils.js';

const WatcherState = {
  IDLE: 'IDLE',
  OBSERVE: 'OBSERVE',
  MOVE: 'MOVE',
  HIDE: 'HIDE',
  CHASE: 'CHASE',
  DISAPPEAR: 'DISAPPEAR'
};

export class Watcher {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    this.state = WatcherState.IDLE;
    this.stateTimer = 0;
    this.active = false;
    this.position = new THREE.Vector3(0, 0, 0);
    this.waypoints = [];
    this.currentWaypoint = 0;
    this.chaseSpeed = 4.5;
    this.moveSpeed = 1.5;
    this.observeDistance = 20;
    this.chaseDistance = 5;
    this.disappearDistance = 2;
    this.hasBeenSeen = false;
    this.sightCount = 0;

    // Visual — tall dark silhouette, slightly unnatural proportions
    this.group = new THREE.Group();

    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    // Body — tall thin cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.2, 6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    this.group.add(body);

    // Head — slightly elongated sphere
    const headGeo = new THREE.SphereGeometry(0.18, 6, 6);
    headGeo.scale(1, 1.3, 1);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 2.35;
    this.group.add(head);

    // Arms — thin cylinders hanging slightly forward
    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 1.0, 4);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.3, 1.2, 0.05);
    leftArm.rotation.z = 0.1;
    leftArm.rotation.x = 0.15;
    this.group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.3, 1.2, 0.05);
    rightArm.rotation.z = -0.1;
    rightArm.rotation.x = 0.15;
    this.group.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 1.1, 4);
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.1, 0, 0);
    this.group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.1, 0, 0);
    this.group.add(rightLeg);

    this.group.visible = false;
    scene.add(this.group);
  }

  /**
   * Set waypoints the watcher can move between
   */
  setWaypoints(points) {
    this.waypoints = points; // [{x, z}, ...]
  }

  /**
   * Activate the watcher at a position
   */
  activate(x, z) {
    this.active = true;
    this.position.set(x, 0, z);
    this.group.position.set(x, 0, z);
    this.state = WatcherState.IDLE;
    this.stateTimer = randomRange(5, 15);
    this.sightCount = 0;
    this.hasBeenSeen = false;
  }

  deactivate() {
    this.active = false;
    this.group.visible = false;
    this.state = WatcherState.IDLE;
  }

  /**
   * Check if the player is looking at the watcher
   */
  isPlayerLooking(playerPos, playerDir) {
    if (!this.group.visible) return false;
    const toWatcher = new THREE.Vector3(
      this.position.x - playerPos.x,
      0,
      this.position.z - playerPos.z
    ).normalize();
    const flatDir = new THREE.Vector3(playerDir.x, 0, playerDir.z).normalize();
    const dot = flatDir.dot(toWatcher);
    return dot > 0.85; // within ~30 degree cone
  }

  update(dt, playerPos, playerDir) {
    if (!this.active) return;

    const dist = distance2D(this.position.x, this.position.z, playerPos.x, playerPos.z);
    const isLooking = this.isPlayerLooking(playerPos, playerDir);

    this.stateTimer -= dt;

    // Face toward player
    if (this.group.visible) {
      const angle = Math.atan2(playerPos.x - this.position.x, playerPos.z - this.position.z);
      this.group.rotation.y = angle;
    }

    switch (this.state) {
      case WatcherState.IDLE:
        this.group.visible = false;
        if (this.stateTimer <= 0) {
          // Appear at distance
          this.state = WatcherState.OBSERVE;
          this.stateTimer = randomRange(5, 12);
          // Position far from player
          if (this.waypoints.length > 0) {
            // Pick a waypoint that's far-ish from the player
            let best = this.waypoints[0];
            let bestDist = 0;
            for (const wp of this.waypoints) {
              const d = distance2D(wp.x, wp.z, playerPos.x, playerPos.z);
              if (d > bestDist && d > 8) {
                bestDist = d;
                best = wp;
              }
            }
            this.position.set(best.x, 0, best.z);
            this.group.position.set(best.x, 0, best.z);
          }
          this.group.visible = true;
          this.audio.playEntityDrone(2);
        }
        break;

      case WatcherState.OBSERVE:
        this.group.visible = true;
        if (isLooking) {
          this.hasBeenSeen = true;
          this.sightCount++;
          // Stay still while being watched
          if (this.sightCount >= 3 && this.stateTimer < 3) {
            this.state = WatcherState.CHASE;
            this.stateTimer = 4;
            this.audio.playScareSting();
          }
        } else if (this.hasBeenSeen) {
          // Player looked away — move closer
          this.state = WatcherState.MOVE;
          this.stateTimer = randomRange(2, 5);
        }
        if (this.stateTimer <= 0) {
          this.state = WatcherState.HIDE;
          this.stateTimer = 1;
        }
        break;

      case WatcherState.MOVE:
        // Move toward player when not being watched
        if (isLooking) {
          // Stop moving, go back to observe
          this.state = WatcherState.OBSERVE;
          this.stateTimer = randomRange(3, 8);
          this.sightCount++;
        } else {
          // Move toward player
          const dirX = playerPos.x - this.position.x;
          const dirZ = playerPos.z - this.position.z;
          const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
          if (len > 0.1) {
            this.position.x += (dirX / len) * this.moveSpeed * dt;
            this.position.z += (dirZ / len) * this.moveSpeed * dt;
            this.group.position.set(this.position.x, 0, this.position.z);
          }
          if (dist < 4) {
            this.state = WatcherState.CHASE;
            this.stateTimer = 4;
            this.audio.playScareSting();
          }
        }
        if (this.stateTimer <= 0) {
          this.state = WatcherState.HIDE;
          this.stateTimer = 1;
        }
        break;

      case WatcherState.CHASE:
        this.group.visible = true;
        // Move toward player quickly
        {
          const dirX = playerPos.x - this.position.x;
          const dirZ = playerPos.z - this.position.z;
          const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
          if (len > 0.1) {
            this.position.x += (dirX / len) * this.chaseSpeed * dt;
            this.position.z += (dirZ / len) * this.chaseSpeed * dt;
            this.group.position.set(this.position.x, 0, this.position.z);
          }
        }
        if (dist < this.disappearDistance) {
          // "Caught" — could trigger game over or just disappear
          this.state = WatcherState.DISAPPEAR;
          this.stateTimer = 0.5;
          this.audio.playScareSting();
        }
        if (this.stateTimer <= 0) {
          this.state = WatcherState.DISAPPEAR;
          this.stateTimer = 1;
        }
        break;

      case WatcherState.HIDE:
        this.group.visible = false;
        if (this.stateTimer <= 0) {
          this.state = WatcherState.IDLE;
          this.stateTimer = randomRange(8, 20);
          this.hasBeenSeen = false;
          this.sightCount = 0;
        }
        break;

      case WatcherState.DISAPPEAR:
        this.group.visible = false;
        if (this.stateTimer <= 0) {
          this.state = WatcherState.IDLE;
          this.stateTimer = randomRange(15, 30);
          this.hasBeenSeen = false;
          this.sightCount = 0;
        }
        break;
    }
  }

  getState() {
    return this.state;
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
}

export { WatcherState };
