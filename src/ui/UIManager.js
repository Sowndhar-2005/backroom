/**
 * UIManager — Handles all UI screens and transitions
 */
import anime from 'animejs';

export class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.elements = {
      mainMenu: document.getElementById('main-menu'),
      controlsScreen: document.getElementById('controls-screen'),
      hud: document.getElementById('hud'),
      notePanel: document.getElementById('note-panel'),
      noteText: document.getElementById('note-text'),
      pauseMenu: document.getElementById('pause-menu'),
      levelTransition: document.getElementById('level-transition'),
      transitionText: document.getElementById('transition-text'),
      endingScreen: document.getElementById('ending-screen'),
      loadingScreen: document.getElementById('loading-screen'),
      objective: document.getElementById('hud-objective'),
      flashlightStatus: document.getElementById('hud-flashlight'),
    };

    this._setupButtons();
    this.onPlay = null;
    this.onResume = null;
    this.onRestart = null;
    this.onMainMenu = null;
  }

  _setupButtons() {
    const el = (id) => document.getElementById(id);

    el('btn-play')?.addEventListener('click', () => {
      if (this.onPlay) this.onPlay();
    });

    el('btn-controls')?.addEventListener('click', () => {
      this.showScreen('controlsScreen');
      this.hideScreen('mainMenu');
    });

    el('btn-exit')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to leave the liminal?')) {
        window.close();
        alert('Close this tab to leave.');
      }
    });

    el('btn-back-controls')?.addEventListener('click', () => {
      this.hideScreen('controlsScreen');
      this.showScreen('mainMenu');
    });

    el('btn-resume')?.addEventListener('click', () => {
      if (this.onResume) this.onResume();
    });

    el('btn-restart')?.addEventListener('click', () => {
      if (this.onRestart) this.onRestart();
    });

    el('btn-main-menu')?.addEventListener('click', () => {
      if (this.onMainMenu) this.onMainMenu();
    });

    el('btn-ending-restart')?.addEventListener('click', () => {
      if (this.onRestart) this.onRestart();
    });

    el('btn-ending-menu')?.addEventListener('click', () => {
      if (this.onMainMenu) this.onMainMenu();
    });

    // Close note panel on click
    this.elements.notePanel?.addEventListener('click', () => {
      this.hideNote();
    });
  }

  showScreen(name) {
    const el = this.elements[name];
    if (el) {
      el.classList.remove('hidden');
      anime({
        targets: el,
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad'
      });
    }
  }

  hideScreen(name) {
    const el = this.elements[name];
    if (el) {
      anime({
        targets: el,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => el.classList.add('hidden')
      });
    }
  }

  showMainMenu() {
    this.hideScreen('hud');
    this.hideScreen('pauseMenu');
    this.hideScreen('endingScreen');
    this.showScreen('mainMenu');
  }

  showHUD() {
    this.hideScreen('mainMenu');
    this.hideScreen('pauseMenu');
    this.hideScreen('controlsScreen');
    this.elements.hud?.classList.remove('hidden');
  }

  showPause() {
    this.showScreen('pauseMenu');
  }

  hidePause() {
    this.hideScreen('pauseMenu');
  }

  setObjective(text) {
    if (this.elements.objective) {
      this.elements.objective.textContent = text;
      anime({
        targets: this.elements.objective,
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad'
      });
    }
  }

  showNote(text) {
    if (this.elements.noteText) {
      this.elements.noteText.textContent = text;
    }
    this.showScreen('notePanel');
    return new Promise(resolve => {
      this._noteResolve = resolve;
    });
  }

  hideNote() {
    this.hideScreen('notePanel');
    if (this._noteResolve) {
      this._noteResolve();
      this._noteResolve = null;
    }
  }

  isNoteVisible() {
    return this.elements.notePanel && !this.elements.notePanel.classList.contains('hidden');
  }

  /**
   * Show level transition screen
   */
  async showLevelTransition(text, duration = 2000) {
    if (this.elements.transitionText) {
      this.elements.transitionText.textContent = text;
    }
    this.elements.levelTransition?.classList.remove('hidden');

    await anime({
      targets: this.elements.levelTransition,
      opacity: [0, 1],
      duration: 600,
      easing: 'easeInQuad'
    }).finished;

    await new Promise(r => setTimeout(r, duration));

    await anime({
      targets: this.elements.levelTransition,
      opacity: [1, 0],
      duration: 600,
      easing: 'easeOutQuad'
    }).finished;

    this.elements.levelTransition?.classList.add('hidden');
  }

  /**
   * Show the ending sequence with animated text
   */
  async showEnding() {
    const screen = this.elements.endingScreen;
    screen?.classList.remove('hidden');

    // Animate title
    await anime({
      targets: '#ending-title',
      opacity: [0, 1],
      duration: 2000,
      easing: 'easeOutQuad'
    }).finished;

    await new Promise(r => setTimeout(r, 1000));

    // Line 1
    const l1 = document.getElementById('ending-line1');
    if (l1) l1.textContent = 'YOU FOUND THE EXIT.';
    await anime({
      targets: '#ending-line1',
      opacity: [0, 1],
      duration: 1500,
      easing: 'easeOutQuad'
    }).finished;

    await new Promise(r => setTimeout(r, 2000));

    // Line 2
    const l2 = document.getElementById('ending-line2');
    if (l2) l2.textContent = "BUT YOU DON'T REMEMBER ENTERING.";
    await anime({
      targets: '#ending-line2',
      opacity: [0, 1],
      duration: 1500,
      easing: 'easeOutQuad'
    }).finished;

    await new Promise(r => setTimeout(r, 2000));

    // Line 3
    const l3 = document.getElementById('ending-line3');
    if (l3) l3.textContent = 'END';
    await anime({
      targets: '#ending-line3',
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutQuad'
    }).finished;

    await new Promise(r => setTimeout(r, 1000));

    // Show buttons
    const btns = document.getElementById('ending-buttons');
    if (btns) btns.classList.remove('hidden');
    anime({
      targets: '#ending-buttons',
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutQuad'
    });
  }

  hideEnding() {
    this.hideScreen('endingScreen');
    const btns = document.getElementById('ending-buttons');
    if (btns) btns.classList.add('hidden');
    // Reset opacity
    ['ending-line1', 'ending-line2', 'ending-line3', 'ending-title'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '0';
    });
  }

  showCodeInput(callback) {
    // Simple prompt-based code entry for simplicity
    const code = prompt('Enter the 3-digit code:');
    if (code) callback(code);
  }
}
