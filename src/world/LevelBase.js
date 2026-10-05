/**
 * LevelBase — Base class for all levels
 */
export class LevelBase {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.physics = game.physics;
    this.audio = game.audio;
    this.interaction = game.interaction;
    this.horror = game.horror;
    this.ui = game.ui;
    this.lights = [];
    this.doors = [];
    this.inventory = new Set();
    this.objectives = [];
    this.currentObjective = 0;
    this.completed = false;
    this.timeouts = new Set();
  }

  scheduleTimeout(fn, delayMs) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, delayMs);
    this.timeouts.add(id);
    return id;
  }

  clearTimeouts() {
    for (const id of this.timeouts) {
      clearTimeout(id);
    }
    this.timeouts.clear();
  }

  /** Override in subclass */
  build() {}

  /** Override in subclass */
  getSpawnPosition() { return { x: 0, z: 0 }; }

  /** Override in subclass */
  update(dt) {
    // Update lights
    for (const light of this.lights) {
      if (light.update) light.update(dt);
    }
  }

  setObjective(text) {
    this.ui.setObjective(text);
  }

  addToInventory(item) {
    this.inventory.add(item);
  }

  hasItem(item) {
    return this.inventory.has(item);
  }

  completeLevel() {
    this.completed = true;
    if (this.game.onLevelComplete) {
      this.game.onLevelComplete();
    }
  }

  cleanup() {
    this.clearTimeouts();
    this.interaction.clearInteractables();
    this.horror.clear();

    for (const door of this.doors) {
      if (door.dispose) door.dispose();
    }

    this.lights = [];
    this.doors = [];
    this.inventory.clear();
  }
}
