/**
 * HorrorEventManager — Triggers atmospheric horror events
 */
import { randomRange, randomChoice } from '../utils/MathUtils.js';

export class HorrorEventManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.events = []; // { type, trigger, data, fired }
    this.activeTimers = [];
    this.globalTimer = 0;
  }

  /**
   * Schedule a timed horror event
   */
  scheduleEvent(type, delaySec, data = {}) {
    this.activeTimers.push({
      type,
      timer: delaySec,
      data,
      fired: false
    });
  }

  /**
   * Add a proximity-triggered event
   */
  addProximityEvent(type, x, z, radius, data = {}) {
    this.events.push({
      type,
      trigger: 'proximity',
      x, z, radius,
      data,
      fired: false
    });
  }

  /**
   * Schedule random ambient scares
   */
  startAmbientScares(intervalMin = 20, intervalMax = 45) {
    const scheduleNext = () => {
      const delay = randomRange(intervalMin, intervalMax);
      this.scheduleEvent('ambient_scare', delay);
    };
    scheduleNext();
    this._ambientScareCallback = scheduleNext;
  }

  update(dt, playerPos, callbacks = {}) {
    this.globalTimer += dt;

    // Process timed events
    for (let i = this.activeTimers.length - 1; i >= 0; i--) {
      const evt = this.activeTimers[i];
      evt.timer -= dt;
      if (evt.timer <= 0 && !evt.fired) {
        evt.fired = true;
        this._fireEvent(evt.type, evt.data, callbacks);
        this.activeTimers.splice(i, 1);
      }
    }

    // Process proximity events
    for (const evt of this.events) {
      if (evt.fired) continue;
      if (evt.trigger === 'proximity') {
        const dx = playerPos.x - evt.x;
        const dz = playerPos.z - evt.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < evt.radius) {
          evt.fired = true;
          this._fireEvent(evt.type, evt.data, callbacks);
        }
      }
    }
  }

  _fireEvent(type, data, callbacks) {
    switch (type) {
      case 'flicker':
        if (callbacks.onFlicker) callbacks.onFlicker(data);
        break;

      case 'distant_sound':
        this.audio.playDistantImpact();
        break;

      case 'door_event':
        if (callbacks.onDoorEvent) callbacks.onDoorEvent(data);
        break;

      case 'entity_appear':
        if (callbacks.onEntityAppear) callbacks.onEntityAppear(data);
        break;

      case 'lights_off':
        if (callbacks.onLightsOff) callbacks.onLightsOff(data);
        break;

      case 'ambient_scare':
        // Pick a random ambient scare
        const scares = ['distant_sound', 'flicker'];
        const scare = randomChoice(scares);
        this._fireEvent(scare, data, callbacks);
        // Reschedule
        if (this._ambientScareCallback) {
          this._ambientScareCallback();
        }
        break;

      case 'sound_stop':
        this.audio.stopAmbient();
        break;

      case 'scare_sting':
        this.audio.playScareSting();
        break;

      default:
        if (callbacks.onCustom) callbacks.onCustom(type, data);
    }
  }

  clear() {
    this.events = [];
    this.activeTimers = [];
    this._ambientScareCallback = null;
  }

  dispose() {
    this.clear();
  }
}
