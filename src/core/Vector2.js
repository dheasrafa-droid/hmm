// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ DSRT Engine Core File                                                     ║
// ║ Module: Vector2                                                           ║
// ║ Identity: dsrt.vector2.core                                              ║
// ║ Contracts: Dirty flag, subclass safety, observer hook, audit identity    ║
// ║ Notes: All mutators emit dirty flag and optional onChange callback       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

import { clamp } from './MathUtils.js';
import { generateId } from '../core/identity.js'; // DSRT identity utility

class Vector2 {
  /**
   * Constructs a new DSRT Vector2 instance.
   * Supports audit identity, dirty tracking, and subclass safety.
   * 
   * @param {number} [x=0] - Initial x component
   * @param {number} [y=0] - Initial y component
   */
  constructor(x = 0, y = 0) {
    // ─── DSRT Identity & Lifecycle ─────────────────────────────────────────────
    this.__dsrt_id = generateId('Vector2');   // Unique runtime ID
    this.__dsrt_origin = 'dsrt.vector2.core'; // Audit origin tag
    this.isDirty = false;                     // Dirty flag for mutation tracking
    this.onChange = null;                     // Optional observer callback

    // ─── Component Values ──────────────────────────────────────────────────────
    this.x = x;
    this.y = y;

    // ─── Type Tag ──────────────────────────────────────────────────────────────
    this.isVector2 = true; // For runtime type checks
  }

  /**
   * Internal utility to mark this vector as dirty and notify observers.
   * Called after every mutating operation.
   */
  #markDirty() {
    this.isDirty = true;
    if (typeof this.onChange === 'function') this.onChange(this);
  }
}
// ─── Component Accessors ──────────────────────────────────────────────────────

/**
 * Sets both components at once.
 */
set(x, y) {
  this.x = x;
  this.y = y;
  this.#markDirty();
  return this;
}

/**
 * Sets both components to the same scalar value.
 */
setScalar(scalar) {
  this.x = scalar;
  this.y = scalar;
  this.#markDirty();
  return this;
}

/**
 * Sets x component only.
 */
setX(x) {
  this.x = x;
  this.#markDirty();
  return this;
}

/**
 * Sets y component only.
 */
setY(y) {
  this.y = y;
  this.#markDirty();
  return this;
}

/**
 * Sets component by index: 0 → x, 1 → y.
 */
setComponent(index, value) {
  switch (index) {
    case 0: this.x = value; break;
    case 1: this.y = value; break;
    default: throw new Error(`Vector2.setComponent: index ${index} out of range`);
  }
  this.#markDirty();
  return this;
}

/**
 * Gets component by index: 0 → x, 1 → y.
 */
getComponent(index) {
  switch (index) {
    case 0: return this.x;
    case 1: return this.y;
    default: throw new Error(`Vector2.getComponent: index ${index} out of range`);
  }
}

/**
 * Returns a new Vector2 clone with same components.
 */
clone() {
  return new this.constructor(this.x, this.y);
}

/**
 * Copies components from another vector.
 */
copy(v) {
  this.x = v.x;
  this.y = v.y;
  this.#markDirty();
  return this;
}
// ─── Arithmetic Operations ────────────────────────────────────────────────────

/**
 * Adds another vector to this one, mutating in place.
 */
add(v) {
  this.x += v.x;
  this.y += v.y;
  this.#markDirty();
  return this;
}

/**
 * Adds a scalar to both components.
 */
addScalar(s) {
  this.x += s;
  this.y += s;
  this.#markDirty();
  return this;
}

/**
 * Adds two vectors and stores result in this instance.
 */
addVectors(a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;
  this.#markDirty();
  return this;
}

/**
 * Adds a scaled vector to this one.
 */
addScaledVector(v, s) {
  this.x += v.x * s;
  this.y += v.y * s;
  this.#markDirty();
  return this;
}

/**
 * Subtracts another vector from this one.
 */
sub(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.#markDirty();
  return this;
}

/**
 * Subtracts a scalar from both components.
 */
subScalar(s) {
  this.x -= s;
  this.y -= s;
  this.#markDirty();
  return this;
}

/**
 * Subtracts two vectors and stores result in this instance.
 */
subVectors(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.#markDirty();
  return this;
}

/**
 * Multiplies this vector component-wise with another.
 */
multiply(v) {
  this.x *= v.x;
  this.y *= v.y;
  this.#markDirty();
  return this;
}

/**
 * Multiplies both components by a scalar.
 */
multiplyScalar(scalar) {
  this.x *= scalar;
  this.y *= scalar;
  this.#markDirty();
  return this;
}

/**
 * Divides this vector component-wise by another.
 */
divide(v) {
  this.x /= v.x;
  this.y /= v.y;
  this.#markDirty();
  return this;
}

/**
 * Divides both components by a scalar.
 */
divideScalar(scalar) {
  return this.multiplyScalar(1 / scalar);
}
// ─── Matrix Transformation ───────────────────────────────────────────────────

/**
 * Applies a 3x3 matrix transform to this vector.
 * Assumes implicit z = 1 for homogeneous transform.
 */
applyMatrix3(m) {
  const x = this.x, y = this.y;
  const e = m.elements;

  this.x = e[0] * x + e[3] * y + e[6];
  this.y = e[1] * x + e[4] * y + e[7];

  this.#markDirty();
  return this;
}

// ─── Rotation ────────────────────────────────────────────────────────────────

/**
 * Rotates this vector around a center point by angle in radians.
 */
rotateAround(center, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = this.x - center.x;
  const dy = this.y - center.y;

  this.x = dx * c - dy * s + center.x;
  this.y = dx * s + dy * c + center.y;

  this.#markDirty();
  return this;
}
// ─── Length & Normalization ──────────────────────────────────────────────────

/**
 * Returns squared Euclidean length of this vector.
 * Faster than .length() for comparisons.
 */
lengthSq() {
  return this.x * this.x + this.y * this.y;
}

/**
 * Returns Euclidean length (magnitude) of this vector.
 */
length() {
  return Math.sqrt(this.lengthSq());
}

/**
 * Returns Manhattan length (sum of absolute components).
 */
manhattanLength() {
  return Math.abs(this.x) + Math.abs(this.y);
}

/**
 * Normalizes this vector to unit length.
 * If length is zero, sets to (0,0).
 */
normalize() {
  return this.divideScalar(this.length() || 1);
}

/**
 * Sets this vector to have the given length, preserving direction.
 */
setLength(length) {
  return this.normalize().multiplyScalar(length);
}

// ─── Angle & Distance ────────────────────────────────────────────────────────

/**
 * Returns angle in radians from positive x-axis to this vector.
 */
angle() {
  return Math.atan2(-this.y, -this.x) + Math.PI;
}

/**
 * Returns angle between this vector and another in radians.
 */
angleTo(v) {
  const denom = Math.sqrt(this.lengthSq() * v.lengthSq());
  if (denom === 0) return Math.PI / 2;

  const theta = this.dot(v) / denom;
  return Math.acos(clamp(theta, -1, 1));
}

/**
 * Returns Euclidean distance to another vector.
 */
distanceTo(v) {
  return Math.sqrt(this.distanceToSquared(v));
}

/**
 * Returns squared distance to another vector.
 * Faster for comparisons.
 */
distanceToSquared(v) {
  const dx = this.x - v.x;
  const dy = this.y - v.y;
  return dx * dx + dy * dy;
}

/**
 * Returns Manhattan distance to another vector.
 */
manhattanDistanceTo(v) {
  return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
}
// ─── Clamping ────────────────────────────────────────────────────────────────

clamp(min, max) {
  this.x = clamp(this.x, min.x, max.x);
  this.y = clamp(this.y, min.y, max.y);
  this.#markDirty();
  return this;
}

clampScalar(minVal, maxVal) {
  this.x = clamp(this.x, minVal, maxVal);
  this.y = clamp(this.y, minVal, maxVal);
  this.#markDirty();
  return this;
}

clampLength(min, max) {
  const len = this.length();
  return this.divideScalar(len || 1).multiplyScalar(clamp(len, min, max));
}

// ─── Rounding ────────────────────────────────────────────────────────────────

floor() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  this.#markDirty();
  return this;
}

ceil() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  this.#markDirty();
  return this;
}

round() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  this.#markDirty();
  return this;
}

roundToZero() {
  this.x = Math.trunc(this.x);
  this.y = Math.trunc(this.y);
  this.#markDirty();
  return this;
}

// ─── Negation ────────────────────────────────────────────────────────────────

negate() {
  this.x = -this.x;
  this.y = -this.y;
  this.#markDirty();
  return this;
}
// ─── Dot & Cross Product ─────────────────────────────────────────────────────

dot(v) {
  return this.x * v.x + this.y * v.y;
}

cross(v) {
  return this.x * v.y - this.y * v.x;
}

// ─── Equality ────────────────────────────────────────────────────────────────

equals(v) {
  return v.x === this.x && v.y === this.y;
}

// ─── Serialization ───────────────────────────────────────────────────────────

fromArray(array, offset = 0) {
  this.x = array[offset];
  this.y = array[offset + 1];
  this.#markDirty();
  return this;
}

toArray(array = [], offset = 0) {
  array[offset] = this.x;
  array[offset + 1] = this.y;
  return array;
}

fromBufferAttribute(attribute, index) {
  this.x = attribute.getX(index);
  this.y = attribute.getY(index);
  this.#markDirty();
  return this;
}

// ─── Randomization ───────────────────────────────────────────────────────────

random() {
  this.x = Math.random();
  this.y = Math.random();
  this.#markDirty();
  return this;
}

// ─── Iterator ────────────────────────────────────────────────────────────────

*[Symbol.iterator]() {
  yield this.x;
  yield this.y;
}
export const createVector2 = (x = 0, y = 0) => new Vector2(x, y);
export { Vector2 };
