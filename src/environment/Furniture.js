/**
 * Furniture — Procedural furniture objects
 */
import * as THREE from 'three';

const WOOD_COLOR = 0x6a5a3e;
const METAL_COLOR = 0x555555;
const SCREEN_OFF = 0x1a1a1a;
const SCREEN_ON = 0x2a4a3a;

export class Furniture {
  /**
   * Create a simple chair
   */
  static createChair(x = 0, y = 0, z = 0) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: WOOD_COLOR, roughness: 0.8 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.45), mat);
    seat.position.y = 0.45;
    group.add(seat);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.04, 0.45, 0.04);
    const positions = [[-0.18, 0.225, -0.18], [0.18, 0.225, -0.18], [-0.18, 0.225, 0.18], [0.18, 0.225, 0.18]];
    for (const p of positions) {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(...p);
      group.add(leg);
    }

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.04), mat);
    back.position.set(0, 0.7, -0.2);
    group.add(back);

    group.position.set(x, y, z);
    return group;
  }

  /**
   * Create a desk/table
   */
  static createDesk(x = 0, y = 0, z = 0) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: WOOD_COLOR, roughness: 0.85 });

    // Top
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), mat);
    top.position.y = 0.75;
    group.add(top);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.05, 0.75, 0.05);
    const positions = [[-0.55, 0.375, -0.25], [0.55, 0.375, -0.25], [-0.55, 0.375, 0.25], [0.55, 0.375, 0.25]];
    for (const p of positions) {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(...p);
      group.add(leg);
    }

    group.position.set(x, y, z);
    return group;
  }

  /**
   * Create a monitor/computer on a desk
   */
  static createComputer(x = 0, y = 0.76, z = 0, screenOn = false) {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: METAL_COLOR, roughness: 0.7 });
    const screenMat = new THREE.MeshStandardMaterial({
      color: screenOn ? SCREEN_ON : SCREEN_OFF,
      emissive: screenOn ? 0x1a3a2a : 0x000000,
      emissiveIntensity: screenOn ? 0.3 : 0,
      roughness: 0.3
    });

    // Monitor frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.03), metalMat);
    frame.position.y = 0.2;
    group.add(frame);

    // Screen
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.29), screenMat);
    screen.position.set(0, 0.2, 0.016);
    group.add(screen);

    // Stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.06), metalMat);
    stand.position.y = 0;
    group.add(stand);

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.15), metalMat);
    base.position.y = -0.04;
    group.add(base);

    group.position.set(x, y, z);
    group.userData.isComputer = true;
    group.userData.screenOn = screenOn;
    return group;
  }

  /**
   * Create a simple pillar
   */
  static createPillar(x = 0, z = 0, height = 3) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xb0a88a, roughness: 0.9 });
    const geo = new THREE.BoxGeometry(0.4, height, 0.4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    return mesh;
  }

  /**
   * Create a cabinet / filing cabinet
   */
  static createCabinet(x = 0, y = 0, z = 0) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.4), mat);
    body.position.y = 0.6;
    group.add(body);

    // Drawer lines
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x3a3a38, roughness: 0.6 });
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.01), lineMat);
      line.position.set(0, 0.3 + i * 0.35, 0.2);
      group.add(line);

      // Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), lineMat);
      handle.position.set(0, 0.3 + i * 0.35 + 0.12, 0.21);
      group.add(handle);
    }

    group.position.set(x, y, z);
    return group;
  }

  /**
   * Create an emergency exit sign
   */
  static createExitSign(x = 0, y = 2.6, z = 0) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00aa44,
      emissive: 0x00aa44,
      emissiveIntensity: 0.4,
      roughness: 0.5
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.05), mat);
    group.add(box);

    group.position.set(x, y, z);
    return group;
  }

  /**
   * Create a ventilation grate
   */
  static createVent(x = 0, y = 2.5, z = 0) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.05), mat);
    mesh.position.set(x, y, z);
    return mesh;
  }

  /**
   * Create an electrical box on wall
   */
  static createElectricalBox(x = 0, y = 1.3, z = 0) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 0.7 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.1), mat);
    group.add(box);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.4, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x4a4a48, roughness: 0.6 })
    );
    door.position.z = 0.06;
    group.add(door);

    group.position.set(x, y, z);
    return group;
  }
}
