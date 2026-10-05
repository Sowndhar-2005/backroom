/**
 * PhysicsWorld — Matter.js integration for 2D top-down collision
 * We use Matter.js as a 2D collision system (XZ plane).
 * Y-axis (vertical) is handled separately.
 */
import Matter from 'matter-js';

export class PhysicsWorld {
  constructor() {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 } // We handle gravity ourselves in 3D
    });
    this.world = this.engine.world;
    this.bodies = new Map(); // id -> { body, userData }
    this.playerBody = null;
  }

  /**
   * Create the player physics body
   * @param {number} x - world X
   * @param {number} z - world Z
   * @param {number} radius - collision radius
   */
  createPlayerBody(x, z, radius = 0.4) {
    this.playerBody = Matter.Bodies.circle(x, z, radius, {
      isStatic: false,
      friction: 0.1,
      frictionAir: 0.15,
      restitution: 0,
      label: 'player'
    });
    Matter.Composite.add(this.world, this.playerBody);
    return this.playerBody;
  }

  /**
   * Add a static wall body
   */
  addWall(x, z, width, depth, userData = {}) {
    const body = Matter.Bodies.rectangle(x, z, width, depth, {
      isStatic: true,
      label: 'wall',
      friction: 0
    });
    Matter.Composite.add(this.world, body);
    const id = body.id;
    this.bodies.set(id, { body, userData });
    return body;
  }

  /**
   * Add a door collider (can be removed when opened)
   */
  addDoor(x, z, width, depth, userData = {}) {
    const body = Matter.Bodies.rectangle(x, z, width, depth, {
      isStatic: true,
      label: 'door',
      friction: 0
    });
    Matter.Composite.add(this.world, body);
    const id = body.id;
    this.bodies.set(id, { body, userData });
    return body;
  }

  removeBody(body) {
    Matter.Composite.remove(this.world, body);
    this.bodies.delete(body.id);
  }

  /**
   * Apply force/velocity to player
   */
  setPlayerVelocity(vx, vz) {
    if (this.playerBody) {
      Matter.Body.setVelocity(this.playerBody, { x: vx, y: vz });
    }
  }

  setPlayerPosition(x, z) {
    if (this.playerBody) {
      Matter.Body.setPosition(this.playerBody, { x, y: z });
      Matter.Body.setVelocity(this.playerBody, { x: 0, y: 0 });
    }
  }

  getPlayerPosition() {
    if (!this.playerBody) return { x: 0, z: 0 };
    return { x: this.playerBody.position.x, z: this.playerBody.position.y };
  }

  update(dt) {
    // Matter.js uses ms — use fixed 60hz step for stability
    Matter.Engine.update(this.engine, 1000 / 60);
  }

  clear() {
    Matter.Composite.clear(this.world);
    this.bodies.clear();
    this.playerBody = null;
  }

  dispose() {
    this.clear();
    Matter.Engine.clear(this.engine);
  }
}
