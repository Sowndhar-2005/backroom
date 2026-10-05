/**
 * InputManager — Handles keyboard & mouse input
 */
export class InputManager {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.mouseSensitivity = 0.002;
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundBlur = this.resetKeys.bind(this);
    this._init();
  }

  _init() {
    document.addEventListener('keydown', this._boundKeyDown);
    document.addEventListener('keyup', this._boundKeyUp);
    document.addEventListener('mousemove', this._boundMouseMove);
    window.addEventListener('blur', this._boundBlur);
  }

  _onKeyDown(e) {
    const key = e.code;
    if (!this.keys[key]) {
      this.keysJustPressed[key] = true;
    }
    this.keys[key] = true;
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
  }

  _onMouseMove(e) {
    this.mouseMovement.x += e.movementX || 0;
    this.mouseMovement.y += e.movementY || 0;
  }

  isDown(code) {
    return !!this.keys[code];
  }

  justPressed(code) {
    return !!this.keysJustPressed[code];
  }

  getMouseDelta() {
    const dx = this.mouseMovement.x * this.mouseSensitivity;
    const dy = this.mouseMovement.y * this.mouseSensitivity;
    return { x: dx, y: dy };
  }

  resetKeys() {
    this.keys = {};
    this.keysJustPressed = {};
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
  }

  /** Call at end of each frame */
  update() {
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
    this.keysJustPressed = {};
  }

  dispose() {
    document.removeEventListener('keydown', this._boundKeyDown);
    document.removeEventListener('keyup', this._boundKeyUp);
    document.removeEventListener('mousemove', this._boundMouseMove);
    window.removeEventListener('blur', this._boundBlur);
  }
}
