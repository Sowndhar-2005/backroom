/**
 * GameState — Manages global game state transitions
 */
export const States = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  NOTE_VIEW: 'NOTE_VIEW',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  ENDING: 'ENDING',
  LOADING: 'LOADING'
};

export class GameState {
  constructor() {
    this.current = States.MENU;
    this.previous = null;
    this.listeners = [];
  }

  get() {
    return this.current;
  }

  is(state) {
    return this.current === state;
  }

  set(newState) {
    if (this.current === newState) return;
    this.previous = this.current;
    this.current = newState;
    this.listeners.forEach(fn => fn(this.current, this.previous));
  }

  onChange(fn) {
    this.listeners.push(fn);
  }
}
