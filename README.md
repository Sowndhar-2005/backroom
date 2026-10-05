# THE LIMINAL

> *"Somewhere between here and nowhere."*

A browser-based 3D first-person psychological horror exploration game inspired by the eerie aesthetic of liminal spaces, endless abandoned corridors, and unidentifiable architecture.

---

## Overview

**THE LIMINAL** is an original 3D psychological horror game running natively in the browser. Players awaken in an eerie, fluorescent-lit labyrinth of endless beige rooms, decaying carpet, and looping hallways. Rather than relying on traditional jump scares, **THE LIMINAL** builds psychological dread through quiet emptiness, architectural repetition, subtle environmental anomalies, procedural atmospheric audio, and a stalking presence known only as *The Watcher*.

---

## Features

- **Immersive First-Person Exploration**: Smooth FPS camera controller with pitch/yaw clamping, walking, running, realistic head bob, dynamic camera shake, and jump physics.
- **Atmospheric 3D Rendering (Three.js)**: Physically balanced fluorescent lighting with randomized flickers, exponential depth fog, and ACES Filmic tone mapping.
- **2D/3D Hybrid Collision Physics (Matter.js)**: Top-down physics world ensuring consistent movement speeds, zero wall tunneling, and reliable doorway/obstacle collision.
- **Procedural Canvas Textures**: 100% self-contained textures (mono-yellow wallpaper, acoustic ceiling tiles, moist diamond-pattern carpet, weathered concrete, and wooden office doors) generated at runtime with canvas caching.
- **100% Procedural Audio (Web Audio API)**: Zero external audio file dependencies. Real-time synthesized 120Hz fluorescent hum, sub-bass drones, footstep bursts (walking & sprint pacing), door creaks, metallic clicks, and scare stings.
- **Stalking Entity AI (The Watcher)**: State-machine AI (`IDLE`, `OBSERVE`, `MOVE`, `HIDE`, `CHASE`, `DISAPPEAR`) with field-of-view sightline detection that stalks the player when they look away.
- **Interactive Narrative Elements**: Raycasting crosshair interaction system targeting typewriter lore notes, keys, access code locks, and doors with contextual HUD prompts.
- **Surreal Looping Mechanics**: Corridor geometries that seamlessly loop and spawn progressive environmental anomalies with each iteration.
- **Polished UI System (Anime.js)**: CRT scanline aesthetic, retro keycaps, smooth screen transitions, typewriter note overlay, and interactive pause menu.

---

## Technology Stack

- **Three.js** (v0.160+) — 3D scene graphs, lighting, cameras, procedural geometry, WebGL rendering.
- **Matter.js** (v0.19+) — Fixed 60Hz top-down 2D physics engine for player movement and collision.
- **Anime.js** (v3.2+) — Smooth UI animations, screen fades, and narrative text transitions.
- **Web Audio API** — Real-time synthesized procedural sound effects and multi-layered ambient soundscapes.
- **Vite** (v5.0+) — Ultra-fast ES Module development server and Rollup production bundler.
- **Playwright** — Headless automated browser testing verifying rendering, input, and game states.

---

## Game Controls

| Key / Control | Action |
|:---|:---|
| <kbd>W</kbd> | Move Forward |
| <kbd>A</kbd> | Move Left (Strafe) |
| <kbd>S</kbd> | Move Backward |
| <kbd>D</kbd> | Move Right (Strafe) |
| <kbd>SHIFT</kbd> | Sprint / Run |
| <kbd>SPACE</kbd> | Jump |
| <kbd>MOUSE</kbd> | Look Around (First-Person Camera) |
| <kbd>E</kbd> | Interact (Read Notes, Take Keys, Open Doors) |
| <kbd>F</kbd> | Toggle Flashlight |
| <kbd>ESC</kbd> | Pause Menu / Resume |
| <kbd>R</kbd> | Restart Current Level |

---

## Story

You regain consciousness in an unfamiliar, fluorescent expanse. There are no signs of exterior windows, natural sunlight, or human life. The hum of the ceiling ballasts vibrates through the floorboards. You do not recall how you arrived.

Scattered maintenance logs and handwritten journal entries reveal that you are not the first to wander these halls. Time and space have begun to distort: corridors loop endlessly, computers illuminate with no power sources, and a silent silhouette watches from the periphery. To escape, you must search for anomalous clues and find the exit—if one truly exists.

---

## Levels

1. **Level 1 — Arrival**: Awakening in a vast mono-yellow room with structural pillars. Explore the perimeter, discover your first journal log, and locate the corridor leading north.
2. **Level 2 — The Hallway**: An endless repeating hallway. Walking forward brings you back to the start, but with each loop, subtle surreal anomalies appear in the environment until an exit door manifests.
3. **Level 3 — Empty Office**: An abandoned corporate office floor consisting of storage rooms, meeting halls, and workstations. Locate the brass office key, recover maintenance logs detailing the emergency code (`742`), and unlock the security exit.
4. **Level 4 — Something Is There**: Dim, flickering L-shaped corridors with minimal lighting. Introduces *The Watcher*, an entity that observes you from the dark and draws nearer whenever you turn your back.
5. **Level 5 — The Exit**: The culmination of all environments. Shifting rooms where you must uncover 3 hidden clues while surviving entity encounters, ultimately unlocking the final glowing exit and triggering the psychological ending sequence.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone <repository-url>
cd backroom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000/`** in your browser.

---

## Build & Preview

### Build for Production
```bash
npm run build
```
Creates an optimized, minified production bundle in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## Automated Testing

The game includes an automated end-to-end test suite built with Playwright:
```bash
npm test
# or
node tests/test-game.js
```
The test suite validates:
- Main menu loading and button states
- Zero console errors and clean network requests
- Controls screen transitions
- 3D WebGL scene rendering & Level 1 instantiation
- Player movement physics (accurate human speed, no tunneling)
- Flashlight toggling and HUD indicator updates
- Raycast targeting, note opening, and dismissal
- Pause menu open, resume, and level restart
- Level transitions across all 5 levels
- Watcher entity activation and AI states
- Final ending sequence rendering

---

## Browser Requirements

For the best experience (pointer lock, Web Audio, and WebGL 2.0), use a modern desktop browser:
- **Google Chrome** (Recommended)
- **Microsoft Edge**
- **Mozilla Firefox**
- **Brave / Chromium-based browsers**

*Note: Mobile browsers will display a desktop recommendation banner.*

---

## Project Structure

```
backroom/
├── public/
│   ├── favicon.svg          # Vector liminal door icon
│   └── favicon.ico          # Fallback icon
├── src/
│   ├── core/
│   │   ├── AudioManager.js  # Procedural Web Audio API sound synthesizer
│   │   ├── GameState.js     # Global state machine (MENU, PLAYING, PAUSED, etc.)
│   │   └── InputManager.js  # Keyboard, mouse look, and blur event handler
│   ├── entity/
│   │   └── Watcher.js       # Watcher stalker AI state machine
│   ├── environment/
│   │   ├── Corridor.js      # Procedural corridor generator
│   │   ├── Door.js          # Interactive door with collider & key/code checks
│   │   ├── Furniture.js     # Desks, chairs, CRT computers, cabinets, signs
│   │   ├── Lights.js        # Fluorescent fixtures with dynamic flickering
│   │   ├── Room.js          # Modular room mesh & opening builder
│   │   └── TextureGenerator.js # Procedural canvas textures with runtime cache
│   ├── horror/
│   │   └── HorrorEventManager.js # Timed & proximity atmospheric scare triggers
│   ├── interaction/
│   │   └── InteractionSystem.js  # Camera raycaster with contextual prompts
│   ├── physics/
│   │   └── PhysicsWorld.js  # Matter.js fixed 60Hz 2D collision system
│   ├── player/
│   │   ├── Flashlight.js    # Spotlight with falloff and flicker
│   │   └── Player.js        # FPS controller, camera bob, footsteps, shake
│   ├── ui/
│   │   └── UIManager.js     # HUD, menus, note panel, anime.js transitions
│   ├── utils/
│   │   └── MathUtils.js     # Math helpers (clamp, lerp, distance)
│   ├── world/
│   │   ├── LevelBase.js     # Base level class with safe timeout cleanup
│   │   ├── Level1.js        # Level 1 — Arrival
│   │   ├── Level2.js        # Level 2 — The Hallway (Looping anomalies)
│   │   ├── Level3.js        # Level 3 — Empty Office (Key & code puzzle)
│   │   ├── Level4.js        # Level 4 — Something Is There (Watcher level)
│   │   └── Level5.js        # Level 5 — The Exit (Clues & final ending)
│   ├── main.js              # Game loop orchestrator & level manager
│   └── styles.css           # Liminal horror aesthetics, CRT scanlines
├── tests/
│   └── test-game.js         # Automated Playwright test suite (16 tests)
├── HOW_TO_PLAY.md           # Player guide and walkthrough
├── README.md                # Project documentation
├── index.html               # Main entry HTML document
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite dev server and build configuration
```

---

## Development Notes

- **Three.js**: Manages 3D rendering, materials, point lights, spotlights, camera matrices, and distance fog.
- **Matter.js**: Manages top-down 2D collision geometry on the XZ plane. Y-axis gravity and jumping are computed in 3D to ensure responsive and glitch-free vertical movement.
- **Anime.js**: Powers smooth opacity and scale transitions for UI overlays, level transition banners, and the ending sequence.
- **Memory & Resource Cleanup**: Every level implements `cleanup()` which disposes Three.js geometries and materials, clears Matter.js collision bodies, cancels all scheduled timers, and resets interaction states to ensure zero memory leaks across multiple level restarts.

---

## Academic & Technical Purpose

This project demonstrates core game architecture and browser technologies:
- **3D Graphics & Shaders**: Procedural texture synthesis, realistic lighting attenuation, exponential fog.
- **Physics Integration**: Decoupled physics stepping (fixed 60Hz) synchronized with variable frame-rate rendering.
- **State Machine AI**: Field-of-view sight calculations and behavior trees without heavy external engines.
- **Procedural Audio**: Frequency modulation, noise buffers, and bandpass filtering without downloading audio assets.
- **Automated QA**: Automated browser test suites verifying physics speed, raycast interactions, and UI integrity.

---

## Future Improvements

- Additional non-Euclidean environmental puzzle spaces.
- Audio spatialization using Web Audio `PannerNode` for 3D positional entity audio.
- Footstep surface differentiation (carpet dampening vs. hollow concrete footsteps).
- Expanded branching narrative lore logs and multiple endings.

---

## License

This project is licensed under the MIT License.
