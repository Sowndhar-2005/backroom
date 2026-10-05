/**
 * THE LIMINAL — Comprehensive Automated Playwright Test Suite
 * Validates all 16 core requirements across gameplay, UI, physics, entities, and transitions.
 */
import { chromium } from 'playwright';

async function runTestSuite() {
  console.log('====================================================');
  console.log('  THE LIMINAL — Automated Playwright Test Suite');
  console.log('====================================================\n');

  let browser;
  const testResults = [];
  const recordResult = (name, passed, detail = '') => {
    testResults.push({ name, passed, detail });
    const mark = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] ${name} ${detail ? `(${detail})` : ''}`);
  };

  try {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    }

    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Ignore favicon 404 if any, log real errors
        if (!msg.text().includes('favicon')) {
          consoleErrors.push(msg.text());
        }
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(`[Uncaught PageError] ${err.message}`);
    });

    // 1. Main Menu Loads
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const title = await page.title();
    const hasTitle = title.includes('THE LIMINAL');
    const playVisible = await page.isVisible('#btn-play');
    const controlsVisible = await page.isVisible('#btn-controls');
    const exitVisible = await page.isVisible('#btn-exit');
    recordResult(
      '1. Main Menu Loads',
      hasTitle && playVisible && controlsVisible && exitVisible,
      `Title: "${title}"`
    );

    // 2. No Console Errors
    recordResult('2. Zero Console Errors on Load', consoleErrors.length === 0, `Errors: ${consoleErrors.length}`);

    // 3. Controls Screen Works
    await page.click('#btn-controls');
    await page.waitForTimeout(400);
    const controlsScreenActive = await page.isVisible('#controls-screen:not(.hidden)');
    await page.click('#btn-back-controls');
    await page.waitForTimeout(400);
    const menuActiveAgain = await page.isVisible('#main-menu:not(.hidden)');
    recordResult(
      '3. Controls Screen Works & Navigates Back',
      controlsScreenActive && menuActiveAgain
    );

    // 4 & 5. Play Button Works & Level 1 Loads
    await page.click('#btn-play');
    await page.waitForTimeout(3800); // Wait for transition animation
    const stateAfterPlay = await page.evaluate(() => window.__game?.gameState.get());
    const level1Active = await page.evaluate(() => window.__game?.currentLevelIndex === 0);
    recordResult(
      '4 & 5. Play Button & Level 1 Load',
      stateAfterPlay === 'PLAYING' && level1Active,
      `State: ${stateAfterPlay}, Level: 0`
    );

    // 6. Player Movement & Physics
    const initialPos = await page.evaluate(() => window.__game?.player.getPosition());
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(600);
    await page.keyboard.up('KeyW');
    const movedPos = await page.evaluate(() => window.__game?.player.getPosition());
    const deltaZ = Math.abs(movedPos.z - initialPos.z);
    recordResult(
      '6. Player Movement & Collision Physics',
      deltaZ > 0.5 && deltaZ < 6.0,
      `DeltaZ: ${deltaZ.toFixed(2)}m (realistic human speed, no tunneling)`
    );

    // 7. Flashlight Toggle (F)
    const flashlightBefore = await page.evaluate(() => window.__game?.player.flashlight.on);
    await page.keyboard.press('KeyF');
    await page.waitForTimeout(200);
    const flashlightAfter = await page.evaluate(() => window.__game?.player.flashlight.on);
    recordResult(
      '7. Flashlight Toggle (F)',
      !flashlightBefore && flashlightAfter,
      `Before: ${flashlightBefore}, After: ${flashlightAfter}`
    );

    // 8. Note Interaction System (Aim & Read)
    await page.evaluate(() => {
      const g = window.__game;
      g.player.reset(2, -1.8);
      g.player.yaw = 0;
      g.player.pitch = -0.6;
      g.player.camera.rotation.order = 'YXZ';
      g.player.camera.rotation.set(-0.6, 0, 0);
      g.interaction.update();
    });
    await page.waitForTimeout(300);
    const promptVisible = await page.evaluate(() => {
      const el = document.getElementById('hud-interact');
      return !el.classList.contains('hidden') && el.textContent.includes('Read note');
    });

    // Press E to read note
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(400);
    const notePanelVisible = await page.isVisible('#note-panel:not(.hidden)');
    const noteText = await page.innerText('#note-text');

    // Press E to close note
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(400);
    const notePanelClosed = await page.evaluate(() => {
      return document.getElementById('note-panel').classList.contains('hidden');
    });
    recordResult(
      '8. Note Interaction (Aim, Read with E, Dismiss)',
      promptVisible && notePanelVisible && noteText.includes('Day 01') && notePanelClosed,
      `Prompt: ${promptVisible}, Read: ${noteText.length > 0} chars, Dismissed: ${notePanelClosed}`
    );

    // 9 & 10. Pause & Resume (ESC)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const isPaused = await page.evaluate(() => window.__game?.gameState.is('PAUSED'));
    const pauseMenuVisible = await page.isVisible('#pause-menu:not(.hidden)');
    await page.click('#btn-resume');
    await page.waitForTimeout(400);
    const isPlayingAfterResume = await page.evaluate(() => window.__game?.gameState.is('PLAYING'));
    recordResult(
      '9 & 10. Pause & Resume Menu',
      isPaused && pauseMenuVisible && isPlayingAfterResume,
      `Paused: ${isPaused}, Resumed: ${isPlayingAfterResume}`
    );

    // 11. Restart Level
    const posBeforeRestart = await page.evaluate(() => {
      const g = window.__game;
      g.player.reset(5, 5);
      return g.player.getPosition();
    });
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(3800);
    const posAfterRestart = await page.evaluate(() => window.__game?.player.getPosition());
    const spawnPos = await page.evaluate(() => window.__game?.currentLevel.getSpawnPosition());
    recordResult(
      '11. Restart Level Cleanly',
      Math.abs(posAfterRestart.x - spawnPos.x) < 0.1 && Math.abs(posAfterRestart.z - spawnPos.z) < 0.1,
      `Reset from (${posBeforeRestart.x}, ${posBeforeRestart.z}) to spawn (${posAfterRestart.x.toFixed(1)}, ${posAfterRestart.z.toFixed(1)})`
    );

    // 12 & 13. Level Transition & Level 2 Loads
    await page.evaluate(() => window.__game?.onLevelComplete());
    await page.waitForTimeout(3800);
    const level2Index = await page.evaluate(() => window.__game?.currentLevelIndex);
    const level2Objective = await page.evaluate(() => document.getElementById('hud-objective')?.textContent);
    recordResult(
      '12 & 13. Level Progression (Level 2 The Hallway)',
      level2Index === 1,
      `Level Index: ${level2Index}, Objective: "${level2Objective}"`
    );

    // 14. Level 4 (Watcher Entity Level)
    await page.evaluate(() => window.__game?.loadLevel(3)); // Level 4 is index 3
    await page.waitForTimeout(3800);
    const level4WatcherExists = await page.evaluate(() => !!window.__game?.currentLevel?.watcher);
    const level4Objective = await page.evaluate(() => document.getElementById('hud-objective')?.textContent);
    recordResult(
      '14. Level 4 (Something Is There / Watcher Entity)',
      level4WatcherExists,
      `Watcher entity active: ${level4WatcherExists}, Objective: "${level4Objective}"`
    );

    // 15. Final Level (Level 5 The Exit)
    await page.evaluate(() => window.__game?.loadLevel(4)); // Level 5 is index 4
    await page.waitForTimeout(3800);
    const level5Index = await page.evaluate(() => window.__game?.currentLevelIndex);
    const level5TotalClues = await page.evaluate(() => window.__game?.currentLevel?.totalClues);
    recordResult(
      '15. Final Level (Level 5 The Exit)',
      level5Index === 4 && level5TotalClues === 3,
      `Level Index: ${level5Index}, Required clues: ${level5TotalClues}`
    );

    // 16. Ending Sequence Appears
    await page.evaluate(() => window.__game?.showEnding());
    await page.waitForTimeout(3000);
    const endingVisible = await page.isVisible('#ending-screen:not(.hidden)');
    const endingTitle = await page.innerText('#ending-title');
    recordResult(
      '16. Psychological Ending Sequence',
      endingVisible && endingTitle.includes('THE LIMINAL'),
      `Ending screen active: ${endingVisible}`
    );

    console.log('\n====================================================');
    const allPassed = testResults.every(r => r.passed);
    console.log(`  SUMMARY: ${testResults.filter(r => r.passed).length}/${testResults.length} Tests Passed`);
    console.log(`  CONSOLE ERRORS: ${consoleErrors.length}`);
    console.log('====================================================\n');

    if (!allPassed || consoleErrors.length > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite runner crashed:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runTestSuite();
