// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ DSRT Engine Core File                                                     ║
// ║ Module: Vector4                                                           ║
// ║ Identity: dsrt.vector4.core                                              ║
// ║ Contracts: Dirty flag, subclass safety, observer hook, audit identity    ║
// ║ Notes: All mutators emit dirty flag and optional onChange callback       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

import { clamp } from './MathUtils.js';
import { generateId } from '../core/identity.js'; // DSRT identity utility

class Vector4 {
  /**
   * Constructs a new DSRT Vector4 instance.
   * Supports audit identity, dirty tracking, and subclass safety.
   * 
   * @param {number} [x=0] - Initial x component
   * @param {number} [y=0] - Initial y component
   * @param {number} [z=0] - Initial z component
   * @param {number} [w=1] - Initial w component
   */
  constructor(x = 0, y = 0, z = 0, w = 1) {
    // ─── DSRT Identity & Lifecycle ─────────────────────────────────────────────
    this.__dsrt_id = generateId('Vector4');   // Unique runtime ID
    this.__dsrt_origin = 'dsrt.vector4.core'; // Audit origin tag
    this.isDirty = false;                     // Dirty flag for mutation tracking
    this.onChange = null;                     // Optional observer callback

    // ─── Component Values ──────────────────────────────────────────────────────
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    // ─── Type Tag ──────────────────────────────────────────────────────────────
    this.isVector4 = true; // For runtime type checks
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
 * Sets all components at once.
 */
set(x, y, z, w) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
  this.#markDirty();
  return this;
}

/**
 * Sets all components to the same scalar value.
 */
setScalar(scalar) {
  this.x = scalar;
  this.y = scalar;
  this.z = scalar;
  this.w = scalar;
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
 * Sets z component only.
 */
setZ(z) {
  this.z = z;
  this.#markDirty();
  return this;
}

/**
 * Sets w component only.
 */
setW(w) {
  this.w = w;
  this.#markDirty();
  return this;
}

/**
 * Sets component by index: 0 → x, 1 → y, 2 → z, 3 → w.
 */
setComponent(index, value) {
  switch (index) {
    case 0: this.x = value; break;
    case 1: this.y = value; break;
    case 2: this.z = value; break;
    case 3: this.w = value; break;
    default: throw new Error(`Vector4.setComponent: index ${index} out of range`);
  }
  this.#markDirty();
  return this;
}

/**
 * Gets component by index: 0 → x, 1 → y, 2 → z, 3 → w.
 */
getComponent(index) {
  switch (index) {
    case 0: return this.x;
    case 1: return this.y;
    case 2: return this.z;
    case 3: return this.w;
    default: throw new Error(`Vector4.getComponent: index ${index} out of range`);
  }
}

/**
 * Returns a new Vector4 clone with same components.
 */
clone() {
  return new this.constructor(this.x, this.y, this.z, this.w);
}

/**
 * Copies components from another vector.
 */
copy(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  this.w = v.w !== undefined ? v.w : 1;
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
  this.z += v.z;
  this.w += v.w;
  this.#markDirty();
  return this;
}

/**
 * Adds a scalar to all components.
 */
addScalar(s) {
  this.x += s;
  this.y += s;
  this.z += s;
  this.w += s;
  this.#markDirty();
  return this;
}

/**
 * Adds two vectors and stores result in this instance.
 */
addVectors(a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;
  this.z = a.z + b.z;
  this.w = a.w + b.w;
  this.#markDirty();
  return this;
}

/**
 * Adds a scaled vector to this one.
 */
addScaledVector(v, s) {
  this.x += v.x * s;
  this.y += v.y * s;
  this.z += v.z * s;
  this.w += v.w * s;
  this.#markDirty();
  return this;
}

/**
 * Subtracts another vector from this one.
 */
sub(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  this.w -= v.w;
  this.#markDirty();
  return this;
}

/**
 * Subtracts a scalar from all components.
 */
subScalar(s) {
  this.x -= s;
  this.y -= s;
  this.z -= s;
  this.w -= s;
  this.#markDirty();
  return this;
}

/**
 * Subtracts two vectors and stores result in this instance.
 */
subVectors(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  this.w = a.w - b.w;
  this.#markDirty();
  return this;
}

/**
 * Multiplies this vector component-wise with another.
 */
multiply(v) {
  this.x *= v.x;
  this.y *= v.y;
  this.z *= v.z;
  this.w *= v.w;
  this.#markDirty();
  return this;
}

/**
 * Multiplies all components by a scalar.
 */
multiplyScalar(scalar) {
  this.x *= scalar;
  this.y *= scalar;
  this.z *= scalar;
  this.w *= scalar;
  this.#markDirty();
  return this;
}

/**
 * Divides this vector component-wise by another.
 */
divide(v) {
  this.x /= v.x;
  this.y /= v.y;
  this.z /= v.z;
  this.w /= v.w;
  this.#markDirty();
  return this;
}

/**
 * Divides all components by a scalar.
 */
divideScalar(scalar) {
  return this.multiplyScalar(1 / scalar);
}
// ─── Matrix Transformation ───────────────────────────────────────────────────

/**
 * Applies a 4x4 matrix transform to this vector.
 * Includes full homogeneous multiplication.
 */
applyMatrix4(m) {
  const x = this.x, y = this.y, z = this.z, w = this.w;
  const e = m.elements;

  this.x = e[0] * x + e[4] * y + e[8]  * z + e[12] * w;
  this.y = e[1] * x + e[5] * y + e[9]  * z + e[13] * w;
  this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
  this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

  this.#markDirty();
  return this;
}

// ─── Axis-Angle Conversion ───────────────────────────────────────────────────

/**
 * Sets this vector to axis-angle representation from a normalized quaternion.
 * x,y,z = axis; w = angle in radians.
 */
setAxisAngleFromQuaternion(q) {
  this.w = 2 * Math.acos(q.w);
  const s = Math.sqrt(1 - q.w * q.w);

  if (s < 0.0001) {
    this.x = 1;
    this.y = 0;
    this.z = 0;
  } else {
    this.x = q.x / s;
    this.y = q.y / s;
    this.z = q.z / s;
  }

  this.#markDirty();
  return this;
}

/**
 * Sets this vector to axis-angle representation from a pure rotation matrix.
 * x,y,z = axis; w = angle in radians.
 */
setAxisAngleFromRotationMatrix(m) {
  const te = m.elements;
  const m11 = te[0], m12 = te[4], m13 = te[8];
  const m21 = te[1], m22 = te[5], m23 = te[9];
  const m31 = te[2], m32 = te[6], m33 = te[10];

  const epsilon = 0.01, epsilon2 = 0.1;

  if (
    Math.abs(m12 - m21) < epsilon &&
    Math.abs(m13 - m31) < epsilon &&
    Math.abs(m23 - m32) < epsilon
  ) {
    if (
      Math.abs(m12 + m21) < epsilon2 &&
      Math.abs(m13 + m31) < epsilon2 &&
      Math.abs(m23 + m32) < epsilon2 &&
      Math.abs(m11 + m22 + m33 - 3) < epsilon2
    ) {
      this.set(1, 0, 0, 0);
      this.#markDirty();
      return this;
    }

    const angle = Math.PI;
    const xx = (m11 + 1) / 2;
    const yy = (m22 + 1) / 2;
    const zz = (m33 + 1) / 2;
    const xy = (m12 + m21) / 4;
    const xz = (m13 + m31) / 4;
    const yz = (m23 + m32) / 4;

    let x, y, z;
    if (xx > yy && xx > zz) {
      x = Math.sqrt(xx);
      y = xy / x;
      z = xz / x;
    } else if (yy > zz) {
      y = Math.sqrt(yy);
      x = xy / y;
      z = yz / y;
    } else {
      z = Math.sqrt(zz);
      x = xz / z;
      y = yz / z;
    }

    this.set(x, y, z, angle);
    this.#markDirty();
    return this;
  }

  let s = Math.sqrt(
    (m32 - m23) ** 2 +
    (m13 - m31) ** 2 +
    (m21 - m12) ** 2
  );

  if (Math.abs(s) < 0.001) s = 1;

  this.x = (m32 - m23) / s;
  this.y = (m13 - m31) / s;
  this.z = (m21 - m12) / s;
  this.w = Math.acos((m11 + m22 + m33 - 1) / 2);

  this.#markDirty();
  return this;
}
// ─── Length & Normalization ──────────────────────────────────────────────────

/**
 * Returns squared Euclidean length of this vector.
 * Faster than .length() for comparisons.
 */
lengthSq() {
  return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
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
  return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
}

/**
 * Normalizes this vector to unit length.
 * If length is zero, sets to (0,0,0,0).
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

// ─── Interpolation ───────────────────────────────────────────────────────────

/**
 * Linearly interpolates toward another vector by alpha.
 * Alpha = 0 → this vector, Alpha = 1 → target vector.
 */
lerp(v, alpha) {
  this.x += (v.x - this.x) * alpha;
  this.y += (v.y - this.y) * alpha;
  this.z += (v.z - this.z) * alpha;
  this.w += (v.w - this.w) * alpha;
  this.#markDirty();
  return this;
}

/**
 * Linearly interpolates between two vectors and stores result here.
 */
lerpVectors(v1, v2, alpha) {
  this.x = v1.x + (v2.x - v1.x) * alpha;
  this.y = v1.y + (v2.y - v1.y) * alpha;
  this.z = v1.z + (v2.z - v1.z) * alpha;
  this.w = v1.w + (v2.w - v1.w) * alpha;
  this.#markDirty();
  return this;
}
// ─── Clamping ────────────────────────────────────────────────────────────────

/**
 * Clamps each component between corresponding min and max vectors.
 */
clamp(min, max) {
  this.x = clamp(this.x, min.x, max.x);
  this.y = clamp(this.y, min.y, max.y);
  this.z = clamp(this.z, min.z, max.z);
  this.w = clamp(this.w, min.w, max.w);
  this.#markDirty();
  return this;
}

/**
 * Clamps each component between scalar min and max.
 */
clampScalar(minVal, maxVal) {
  this.x = clamp(this.x, minVal, maxVal);
  this.y = clamp(this.y, minVal, maxVal);
  this.z = clamp(this.z, minVal, maxVal);
  this.w = clamp(this.w, minVal, maxVal);
  this.#markDirty();
  return this;
}

/**
 * Clamps vector length between min and max, preserving direction.
 */
clampLength(min, max) {
  const len = this.length();
  return this.divideScalar(len || 1).multiplyScalar(clamp(len, min, max));
}

// ─── Rounding ────────────────────────────────────────────────────────────────

/**
 * Rounds each component down to nearest integer.
 */
floor() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  this.z = Math.floor(this.z);
  this.w = Math.floor(this.w);
  this.#markDirty();
  return this;
}

/**
 * Rounds each component up to nearest integer.
 */
ceil() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  this.z = Math.ceil(this.z);
  this.w = Math.ceil(this.w);
  this.#markDirty();
  return this;
}

/**
 * Rounds each component to nearest integer.
 */
round() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  this.z = Math.round(this.z);
  this.w = Math.round(this.w);
  this.#markDirty();
  return this;
}

/**
 * Rounds each component toward zero.
 */
roundToZero() {
  this.x = Math.trunc(this.x);
  this.y = Math.trunc(this.y);
  this.z = Math.trunc(this.z);
  this.w = Math.trunc(this.w);
  this.#markDirty();
  return this;
}

// ─── Negation ────────────────────────────────────────────────────────────────

/**
 * Inverts each component: x → -x, y → -y, z → -z, w → -w.
 */
negate() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z;
  this.w = -this.w;
  this.#markDirty();
  return this;
}
// ─── Dot Product & Equality ──────────────────────────────────────────────────

/**
 * Returns dot product with another vector.
 * Measures directional similarity.
 */
dot(v) {
  return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
}

/**
 * Returns true if all components match another vector.
 */
equals(v) {
  return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
}

// ─── Serialization ───────────────────────────────────────────────────────────

/**
 * Sets components from array at offset.
 */
fromArray(array, offset = 0) {
  this.x = array[offset];
  this.y = array[offset + 1];
  this.z = array[offset + 2];
  this.w = array[offset + 3];
  this.#markDirty();
  return this;
}

/**
 * Writes components to array at offset.
 */
toArray(array = [], offset = 0) {
  array[offset]     = this.x;
  array[offset + 1] = this.y;
  array[offset + 2] = this.z;
  array[offset + 3] = this.w;
  return array;
}

/**
 * Sets components from buffer attribute at index.
 */
fromBufferAttribute(attribute, index) {
  this.x = attribute.getX(index);
  this.y = attribute.getY(index);
  this.z = attribute.getZ(index);
  this.w = attribute.getW(index);
  this.#markDirty();
  return this;
}

// ─── Randomization ───────────────────────────────────────────────────────────

/**
 * Sets each component to random float in [0, 1).
 */
random() {
  this.x = Math.random();
  this.y = Math.random();
  this.z = Math.random();
  this.w = Math.random();
  this.#markDirty();
  return this;
}

// ─── Iterator ────────────────────────────────────────────────────────────────

*[Symbol.iterator]() {
  yield this.x;
  yield this.y;
  yield this.z;
  yield this.w;
}
export const createVector4 = (x = 0, y = 0, z = 0, w = 1) => new Vector4(x, y, z, w);
export { Vector4 };
