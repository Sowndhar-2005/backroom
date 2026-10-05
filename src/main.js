/**
 * THE LIMINAL — Main Game Entry Point
 * Initializes systems, handles game loop, levels, pointer lock, interactions.
 */
import * as THREE from 'three';
import { GameState, States } from './core/GameState.js';
import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { Player } from './player/Player.js';
import { InteractionSystem } from './interaction/InteractionSystem.js';
import { HorrorEventManager } from './horror/HorrorEventManager.js';
import { UIManager } from './ui/UIManager.js';

// Level imports
import { Level1 } from './world/Level1.js';
import { Level2 } from './world/Level2.js';
import { Level3 } from './world/Level3.js';
import { Level4 } from './world/Level4.js';
import { Level5 } from './world/Level5.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      console.error('Canvas element #game-canvas not found!');
      return;
    }

    // 1. Core State & Audio
    this.gameState = new GameState();
    this.audio = new AudioManager();
    this.audio.init();

    // 2. Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a08, 0.02);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;

    // 3. Physics & Controls
    this.physics = new PhysicsWorld();
    this.physics.createPlayerBody(0, 0, 0.4);

    this.input = new InputManager();
    this.player = new Player(this.scene, this.physics);
    this.interaction = new InteractionSystem(this.player.camera, this.scene);
    this.horror = new HorrorEventManager(this.audio);
    this.ui = new UIManager(this.gameState);

    // 4. Levels
    this.levels = [Level1, Level2, Level3, Level4, Level5];
    this.levelTitles = [
      'LEVEL 1\nARRIVAL',
      'LEVEL 2\nTHE HALLWAY',
      'LEVEL 3\nEMPTY OFFICE',
      'LEVEL 4\nSOMETHING IS THERE',
      'LEVEL 5\nTHE EXIT'
    ];
    this.currentLevelIndex = 0;
    this.currentLevel = null;

    // Time tracking
    this.lastTime = performance.now();
    this.isPointerLocked = false;
    this.pendingNoteDismiss = false;

    // Setup event listeners
    this._setupEvents();

    // Expose Matter on window if needed by any legacy check
    window.MatterModule = this.physics;

    // Start loop
    requestAnimationFrame(this._loop.bind(this));
  }

  _setupEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h);
      this.player.resize(w, h);
    });

    // Pointer Lock Listeners
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
      if (!this.isPointerLocked) {
        if (this.gameState.is(States.PLAYING) && !this.ui.isNoteVisible()) {
          this.gameState.set(States.PAUSED);
          this.ui.showPause();
        }
      } else {
        if (this.gameState.is(States.PAUSED)) {
          this.gameState.set(States.PLAYING);
          this.ui.hidePause();
        }
      }
    });

    // Click canvas to resume pointer lock
    this.canvas.addEventListener('click', () => {
      if (this.gameState.is(States.PLAYING) && !this.isPointerLocked && !this.ui.isNoteVisible()) {
        this.requestLock();
      }
    });

    // UI callbacks
    this.ui.onPlay = () => {
      this.audio.resume();
      this.startNewGame();
    };

    this.ui.onResume = () => {
      this.audio.resume();
      this.ui.hidePause();
      this.gameState.set(States.PLAYING);
      this.requestLock();
    };

    this.ui.onRestart = () => {
      this.audio.resume();
      this.ui.hidePause();
      this.ui.hideEnding();
      this.restartCurrentLevel();
    };

    this.ui.onMainMenu = () => {
      this.returnToMainMenu();
    };

    // Global Key Listener for Pause & Interact
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.ui.isNoteVisible()) {
          this.ui.hideNote();
          this.requestLock();
          return;
        }
        if (this.gameState.is(States.PLAYING)) {
          document.exitPointerLock?.();
          this.gameState.set(States.PAUSED);
          this.ui.showPause();
        } else if (this.gameState.is(States.PAUSED)) {
          this.ui.onResume();
        }
      }

      if (e.code === 'KeyR' && this.gameState.is(States.PLAYING)) {
        this.restartCurrentLevel();
      }

      if (e.code === 'KeyE') {
        this._handleInteraction();
      }
    });
  }

  requestLock() {
    try {
      this.canvas.requestPointerLock();
    } catch (e) {
      console.warn('Pointer lock request failed', e);
    }
  }

  startNewGame() {
    this.currentLevelIndex = 0;
    this.loadLevel(this.currentLevelIndex);
  }

  restartCurrentLevel() {
    this.loadLevel(this.currentLevelIndex);
  }

  returnToMainMenu() {
    document.exitPointerLock?.();
    if (this.currentLevel) {
      this.currentLevel.cleanup();
      this.currentLevel = null;
    }
    this._clearLevelVisuals();
    this.audio.stopAmbient();
    this.gameState.set(States.MENU);
    this.ui.showMainMenu();
  }

  async loadLevel(index) {
    if (this.isLoadingLevel) return;
    this.isLoadingLevel = true;
    try {
      this.gameState.set(States.LOADING);
      this.currentLevelIndex = index;

      // Stop current level and clear visuals
      if (this.currentLevel) {
        this.currentLevel.cleanup();
        this.currentLevel = null;
      }
      this._clearLevelVisuals();

      // Reset physics
      this.physics.clear();
      this.physics.createPlayerBody(0, 0, 0.4);

      // Show Level transition text
      const title = this.levelTitles[index] || `LEVEL ${index + 1}`;
      await this.ui.showLevelTransition(title, 1800);

      // Instantiate new level
      const LevelClass = this.levels[index];
      this.currentLevel = new LevelClass(this);

      // Spawn player
      const spawn = this.currentLevel.getSpawnPosition();
      this.player.reset(spawn.x, spawn.z);

      // Build the level
      this.currentLevel.build();

      // Switch to playing
      this.gameState.set(States.PLAYING);
      this.ui.showHUD();
      this.requestLock();
    } finally {
      this.isLoadingLevel = false;
    }
  }

  _clearLevelVisuals() {
    const toRemove = [];
    this.scene.children.forEach(child => {
      // Preserve player's camera
      if (child !== this.player.camera) {
        toRemove.push(child);
      }
    });

    toRemove.forEach(child => {
      this.scene.remove(child);
      child.traverse && child.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });
    });
  }

  _handleInteraction() {
    if (this.ui.isNoteVisible()) {
      this.ui.hideNote();
      this.requestLock();
      return;
    }

    if (!this.gameState.is(States.PLAYING)) return;

    const target = this.interaction.currentTarget;
    if (!target || !target.userData) return;

    const data = target.userData;

    if (data.type === 'note' || data.type === 'clue') {
      this.audio.playInteract();
      document.exitPointerLock?.();
      this.ui.showNote(data.noteText);

      if (data.type === 'clue' && this.currentLevel?.onClueFound && !data.collected) {
        data.collected = true;
        this.currentLevel.onClueFound();
      }
    } else if (data.type === 'key') {
      this.audio.playInteract();
      if (this.currentLevel) {
        this.currentLevel.addToInventory(data.keyId);
        this.ui.setObjective(`Picked up ${data.keyId.replace('_', ' ')}.`);
      }
      this.interaction.removeInteractable(target);
      target.visible = false;
    } else if (data.type === 'door' && data.doorRef) {
      const door = data.doorRef;
      const res = door.tryOpen(this.currentLevel ? this.currentLevel.inventory : new Set(), this.physics, this.audio);

      if (res === 'CODE_REQUIRED') {
        document.exitPointerLock?.();
        this.ui.showCodeInput((enteredCode) => {
          if (enteredCode === door.requiredCode) {
            door.open(this.physics, this.audio);
            this.ui.setObjective('The door unlocked.');
          } else {
            this.ui.setObjective('Incorrect code.');
          }
          this.requestLock();
        });
      } else if (res) {
        this.ui.setObjective(res);
      }
    }
  }

  onLevelComplete() {
    this.currentLevelIndex++;
    if (this.currentLevelIndex < this.levels.length) {
      this.loadLevel(this.currentLevelIndex);
    } else {
      this.showEnding();
    }
  }

  showEnding() {
    this.gameState.set(States.ENDING);
    document.exitPointerLock?.();
    this.audio.stopAmbient();
    this.ui.hideScreen('hud');
    this.ui.showEnding();
  }

  _loop(time) {
    requestAnimationFrame(this._loop.bind(this));

    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (this.gameState.is(States.PLAYING)) {
      this.physics.update(dt);
      this.player.update(dt, this.input, this.audio);
      this.interaction.update();

      if (this.currentLevel && this.currentLevel.update) {
        this.currentLevel.update(dt);
      }
    }

    // Always render so world is visible during notes and pauses
    if (this.player && this.player.camera) {
      this.renderer.render(this.scene, this.player.camera);
    }

    this.input.update();
  }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
  window.__game = new Game();
});
