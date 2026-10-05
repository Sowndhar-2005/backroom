# HOW TO PLAY — THE LIMINAL

Welcome to **THE LIMINAL**. This guide covers the controls, game mechanics, level progression, and troubleshooting tips to help you navigate through the endless corridors.

---

## Objective

Your primary objective is to **find a way out**. 

You are trapped inside an abandoned, seemingly endless architectural anomaly with no visible windows or daylight. To progress, you must:
1. Explore rooms and hallways carefully.
2. Read handwritten journal logs and maintenance notes for clues.
3. Collect necessary items (keys, security access codes).
4. Notice subtle environmental changes and anomalies that reveal hidden doorways.
5. Evade *The Watcher*, an entity that observes and stalks you in the shadows.

---

## Controls

| Key / Input | Action | Description |
|:---|:---|:---|
| <kbd>W</kbd> | Move Forward | Walk forward at normal exploration speed (4 m/s) |
| <kbd>A</kbd> | Move Left | Strafe to the left |
| <kbd>S</kbd> | Move Backward | Step backward |
| <kbd>D</kbd> | Move Right | Strafe to the right |
| <kbd>SHIFT</kbd> | Run / Sprint | Hold while moving to sprint (7 m/s) |
| <kbd>SPACE</kbd> | Jump | Perform a short vertical jump over small obstacles |
| <kbd>MOUSE</kbd> | Look Around | Controls your first-person view (pitch and yaw) |
| <kbd>E</kbd> | Interact | Read notes, collect keys, and open unlocked doors |
| <kbd>F</kbd> | Flashlight | Toggle your personal flashlight on and off |
| <kbd>ESC</kbd> | Pause | Release mouse lock and open the pause menu |
| <kbd>R</kbd> | Restart Level | Instantly restart the current level from its spawn point |

---

## Starting the Game

1. **Install Dependencies**: Open a terminal in the project directory and run:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Open the Game**: Navigate to [http://localhost:3000/](http://localhost:3000/) in Google Chrome or Microsoft Edge.
4. **Click PLAY**: From the main menu, click the **PLAY** button.
5. **Lock Your Mouse**: When the level loads, click anywhere on the screen to capture the mouse cursor and begin looking around.
6. **Toggle Audio**: Audio begins automatically upon clicking **PLAY**. Ensure your speakers or headphones are turned on to hear audio cues.

---

## Gameplay Tips

- **Explore Deliberately**: Rushing blindly down hallways can leave you disoriented or cornered. Keep track of landmarks like pillars and furniture.
- **Read Notes Carefully**: Scattered journal pages and maintenance logs contain vital information, including door codes and warnings about entity behavior.
- **Inspect Objects with Center Reticle**: Look directly at tables, shelves, and doors with the center crosshair `<+>`. When in range, an interaction prompt will appear on your HUD (`Press E to ...`).
- **Use Your Flashlight (<kbd>F</kbd>)**: Later corridors have damaged, flickering, or non-functional lighting fixtures. Toggle your flashlight on when approaching pitch-black zones.
- **Watch For Anomalies**: Some hallways loop infinitely. Pay attention to small changes—a broken lightbulb, a chair moved out of place, or a newly appeared doorframe. If something feels out of place, investigate it immediately.
- **Dealing With The Watcher**:
  - The entity stalks you when your back is turned.
  - If you hear footsteps or a low sub-bass drone behind you, do not panic and run immediately.
  - Turning around to stare directly at the entity will cause it to freeze in place, buying you time to back away.
  - Do not stare for too long without moving, as prolonged eye contact may provoke it.

---

## Level Guide (Spoiler-Light)

### Level 1 — Arrival
- **Atmosphere**: A large, open room with mono-yellow wallpaper, humming fluorescent lights, and central pillars.
- **Task**: Inspect the desk in the main room to read your first journal entry, then proceed through the northern corridor to locate the exit door.

### Level 2 — The Hallway
- **Atmosphere**: A long, repeating corridor with identical doors lining both walls.
- **Task**: Walking forward will loop you back to the start. Walk the loop several times and observe what changes in the environment on each iteration. Find the anomaly to reveal the exit.

### Level 3 — Empty Office
- **Atmosphere**: A corporate office wing with storage rooms, meeting rooms, and cubicles.
- **Task**: Explore the side rooms. Retrieve the office key from the storage shelves, read the maintenance log in the meeting room to find the 3-digit security code (`742`), and unlock the eastern security door.

### Level 4 — Something Is There
- **Atmosphere**: Dark L-shaped hallways with sparse, flickering lights and long shadows.
- **Task**: The Watcher entity is active in this level. Keep your flashlight ready, move methodically through the corridors, and keep your distance while locating the illuminated exit sign.

### Level 5 — The Exit
- **Atmosphere**: A shifting complex of maintenance and office spaces.
- **Task**: Find and collect all 3 hidden logs/clues scattered across the area while avoiding the stalking entity. Once all 3 clues are discovered, the final glowing exit will unlock.

---

## Pause & Restart

- **Pause Menu (<kbd>ESC</kbd>)**: Pressing <kbd>ESC</kbd> during gameplay pauses the simulation, releases pointer lock, and opens the Pause menu:
  - **RESUME**: Returns to gameplay and re-locks your mouse cursor.
  - **RESTART LEVEL**: Cleans up all objects, entities, and audio states, and restarts the current level from scratch.
  - **MAIN MENU**: Exits to the title screen.
- **Quick Restart (<kbd>R</kbd>)**: Press <kbd>R</kbd> at any time during gameplay to immediately restart the current level.

---

## Troubleshooting & FAQ

### The game is a black screen or does not render
- Ensure your browser supports WebGL 2.0 (Google Chrome or Microsoft Edge recommended).
- Check that hardware acceleration is enabled in your browser settings (`Settings > System > Use graphics acceleration when available`).

### Mouse does not lock or look around
- Click directly on the game screen to request pointer lock.
- If your browser blocked pointer lock, click the browser window again or press <kbd>ESC</kbd> and click **RESUME**.

### No sound or ambient hum
- Web browsers require user interaction before playing audio. Clicking the **PLAY** button automatically initializes the audio context.
- Check your system volume and ensure the browser tab is not muted.

### npm install fails
- If running on Windows PowerShell and encountering an execution policy warning, run:
  ```powershell
  npm.cmd install
  ```
  or run PowerShell as Administrator and execute `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

Enjoy your exploration of **THE LIMINAL**.
