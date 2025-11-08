// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ DSRT Engine Core File                                                     ║
// ║ Module: Vector3                                                           ║
// ║ Identity: dsrt.vector3.core                                              ║
// ║ Contracts: Dirty flag, subclass safety, observer hook, audit identity    ║
// ║ Notes: All mutators emit dirty flag and optional onChange callback       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

import { clamp } from './MathUtils.js';
import { Quaternion } from './Quaternion.js';
import { generateId } from '../core/identity.js'; // DSRT identity utility

class Vector3 {
  /**
   * Constructs a new DSRT Vector3 instance.
   * Supports audit identity, dirty tracking, and subclass safety.
   * 
   * @param {number} [x=0] - Initial x component
   * @param {number} [y=0] - Initial y component
   * @param {number} [z=0] - Initial z component
   */
  constructor(x = 0, y = 0, z = 0) {
    // ─── DSRT Identity & Lifecycle ─────────────────────────────────────────────
    this.__dsrt_id = generateId('Vector3');   // Unique runtime ID
    this.__dsrt_origin = 'dsrt.vector3.core'; // Audit origin tag
    this.isDirty = false;                     // Dirty flag for mutation tracking
    this.onChange = null;                     // Optional observer callback

    // ─── Component Values ──────────────────────────────────────────────────────
    this.x = x;
    this.y = y;
    this.z = z;

    // ─── Type Tag ──────────────────────────────────────────────────────────────
    this.isVector3 = true; // For runtime type checks
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
 * Sets all components at once. If z is omitted, preserves current z.
 * Marks dirty and emits change.
 */
set(x, y, z = this.z) {
  this.x = x;
  this.y = y;
  this.z = z;
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
 * Sets component by index: 0 → x, 1 → y, 2 → z.
 */
setComponent(index, value) {
  switch (index) {
    case 0: this.x = value; break;
    case 1: this.y = value; break;
    case 2: this.z = value; break;
    default: throw new Error(`Vector3.setComponent: index ${index} out of range`);
  }
  this.#markDirty();
  return this;
}

/**
 * Gets component by index: 0 → x, 1 → y, 2 → z.
 */
getComponent(index) {
  switch (index) {
    case 0: return this.x;
    case 1: return this.y;
    case 2: return this.z;
    default: throw new Error(`Vector3.getComponent: index ${index} out of range`);
  }
}

/**
 * Returns a new Vector3 clone with same components.
 */
clone() {
  return new this.constructor(this.x, this.y, this.z);
}

/**
 * Copies components from another vector.
 */
copy(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
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
  this.#markDirty();
  return this;
}

/**
 * Multiplies two vectors component-wise and stores result here.
 */
multiplyVectors(a, b) {
  this.x = a.x * b.x;
  this.y = a.y * b.y;
  this.z = a.z * b.z;
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
  this.#markDirty();
  return this;
}

/**
 * Divides all components by a scalar.
 */
divideScalar(scalar) {
  return this.multiplyScalar(1 / scalar);
}
// ─── Transformations ─────────────────────────────────────────────────────────

/**
 * Applies a Quaternion rotation to this vector.
 * Assumes unit quaternion. Mutates in place.
 */
applyQuaternion(q) {
  const vx = this.x, vy = this.y, vz = this.z;
  const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);

  this.x = vx + qw * tx + qy * tz - qz * ty;
  this.y = vy + qw * ty + qz * tx - qx * tz;
  this.z = vz + qw * tz + qx * ty - qy * tx;

  this.#markDirty();
  return this;
}

/**
 * Applies Euler rotation via intermediate Quaternion.
 */
applyEuler(euler) {
  return this.applyQuaternion(_quaternion.setFromEuler(euler));
}

/**
 * Applies axis-angle rotation via intermediate Quaternion.
 */
applyAxisAngle(axis, angle) {
  return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
}

/**
 * Applies a 3x3 matrix transform.
 */
applyMatrix3(m) {
  const x = this.x, y = this.y, z = this.z;
  const e = m.elements;

  this.x = e[0] * x + e[3] * y + e[6] * z;
  this.y = e[1] * x + e[4] * y + e[7] * z;
  this.z = e[2] * x + e[5] * y + e[8] * z;

  this.#markDirty();
  return this;
}

/**
 * Applies a normal matrix and normalizes result.
 */
applyNormalMatrix(m) {
  return this.applyMatrix3(m).normalize();
}

/**
 * Applies a 4x4 matrix transform with perspective divide.
 */
applyMatrix4(m) {
  const x = this.x, y = this.y, z = this.z;
  const e = m.elements;

  const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

  this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
  this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
  this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

  this.#markDirty();
  return this;
}

/**
 * Transforms this vector as a direction using upper-left 3x3 of matrix.
 * Result is normalized.
 */
transformDirection(m) {
  const x = this.x, y = this.y, z = this.z;
  const e = m.elements;

  this.x = e[0] * x + e[4] * y + e[8] * z;
  this.y = e[1] * x + e[5] * y + e[9] * z;
  this.z = e[2] * x + e[6] * y + e[10] * z;

  return this.normalize();
}
// ─── Projection & Camera Space ───────────────────────────────────────────────

/**
 * Projects this vector into normalized device coordinates (NDC) using the given camera.
 * Applies view and projection matrices in sequence.
 */
project(camera) {
  return this
    .applyMatrix4(camera.matrixWorldInverse)
    .applyMatrix4(camera.projectionMatrix);
}

/**
 * Unprojects this vector from NDC back into world space using the given camera.
 * Applies inverse projection and world matrices.
 */
unproject(camera) {
  return this
    .applyMatrix4(camera.projectionMatrixInverse)
    .applyMatrix4(camera.matrixWorld);
}
// ─── Length & Normalization ──────────────────────────────────────────────────

/**
 * Returns squared Euclidean length of this vector.
 * Faster than .length() for comparisons.
 */
lengthSq() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
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
  return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
}

/**
 * Normalizes this vector to unit length.
 * If length is zero, sets to (0,0,0).
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
  this.#markDirty();
  return this;
}

// ─── Negation ────────────────────────────────────────────────────────────────

/**
 * Inverts each component: x → -x, y → -y, z → -z.
 */
negate() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z;
  this.#markDirty();
  return this;
}
// ─── Dot & Cross Products ────────────────────────────────────────────────────

/**
 * Returns dot product with another vector.
 * Measures directional similarity.
 */
dot(v) {
  return this.x * v.x + this.y * v.y + this.z * v.z;
}

/**
 * Sets this vector to the cross product of itself and another.
 * Mutates in place.
 */
cross(v) {
  return this.crossVectors(this, v);
}

/**
 * Sets this vector to the cross product of two vectors.
 */
crossVectors(a, b) {
  const ax = a.x, ay = a.y, az = a.z;
  const bx = b.x, by = b.y, bz = b.z;

  this.x = ay * bz - az * by;
  this.y = az * bx - ax * bz;
  this.z = ax * by - ay * bx;

  this.#markDirty();
  return this;
}

// ─── Angle & Distance ────────────────────────────────────────────────────────

/**
 * Returns angle to another vector in radians.
 * Uses clamped dot product over magnitudes.
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
  const dz = this.z - v.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Returns Manhattan distance to another vector.
 */
manhattanDistanceTo(v) {
  return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
}
// ─── Projection & Reflection ─────────────────────────────────────────────────

/**
 * Projects this vector onto another vector.
 * Result is parallel to target vector.
 */
projectOnVector(v) {
  const denom = v.lengthSq();
  if (denom === 0) return this.set(0, 0, 0);

  const scalar = this.dot(v) / denom;
  return this.copy(v).multiplyScalar(scalar);
}

/**
 * Projects this vector onto a plane orthogonal to the given normal.
 * Result lies in the plane.
 */
projectOnPlane(planeNormal) {
  _vector.copy(this).projectOnVector(planeNormal);
  return this.sub(_vector).#markDirty();
}

/**
 * Reflects this vector off a plane orthogonal to the given normal.
 * Result is mirrored across the plane.
 */
reflect(normal) {
  const scale = 2 * this.dot(normal);
  return this.sub(_vector.copy(normal).multiplyScalar(scale)).#markDirty();
}
// ─── Coordinate Conversions ──────────────────────────────────────────────────

/**
 * Sets components from spherical coordinates.
 */
setFromSpherical(s) {
  return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
}

/**
 * Sets components from spherical radius, phi, theta.
 */
setFromSphericalCoords(radius, phi, theta) {
  const sinPhiRadius = Math.sin(phi) * radius;
  this.x = sinPhiRadius * Math.sin(theta);
  this.y = Math.cos(phi) * radius;
  this.z = sinPhiRadius * Math.cos(theta);
  this.#markDirty();
  return this;
}

/**
 * Sets components from cylindrical coordinates.
 */
setFromCylindrical(c) {
  return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
}

/**
 * Sets components from cylindrical radius, theta, y.
 */
setFromCylindricalCoords(radius, theta, y) {
  this.x = radius * Math.sin(theta);
  this.y = y;
  this.z = radius * Math.cos(theta);
  this.#markDirty();
  return this;
}

/**
 * Sets components from matrix position (column 4).
 */
setFromMatrixPosition(m) {
  const e = m.elements;
  this.x = e[12];
  this.y = e[13];
  this.z = e[14];
  this.#markDirty();
  return this;
}

/**
 * Sets components from matrix scale (length of columns).
 */
setFromMatrixScale(m) {
  this.x = this.setFromMatrixColumn(m, 0).length();
  this.y = this.setFromMatrixColumn(m, 1).length();
  this.z = this.setFromMatrixColumn(m, 2).length();
  this.#markDirty();
  return this;
}

/**
 * Sets components from a column of a 4x4 matrix.
 */
setFromMatrixColumn(m, index) {
  return this.fromArray(m.elements, index * 4);
}

/**
 * Sets components from a column of a 3x3 matrix.
 */
setFromMatrix3Column(m, index) {
  return this.fromArray(m.elements, index * 3);
}

/**
 * Sets components from Euler angles.
 */
setFromEuler(e) {
  this.x = e._x;
  this.y = e._y;
  this.z = e._z;
  this.#markDirty();
  return this;
}

/**
 * Sets components from RGB color.
 */
setFromColor(c) {
  this.x = c.r;
  this.y = c.g;
  this.z = c.b;
  this.#markDirty();
  return this;
}

// ─── Equality & Serialization ────────────────────────────────────────────────

/**
 * Returns true if all components match another vector.
 */
equals(v) {
  return v.x === this.x && v.y === this.y && v.z === this.z;
}

/**
 * Sets components from array at offset.
 */
fromArray(array, offset = 0) {
  this.x = array[offset];
  this.y = array[offset + 1];
  this.z = array[offset + 2];
  this.#markDirty();
  return this;
}

/**
 * Writes components to array at offset.
 */
toArray(array = [], offset = 0) {
  array[offset] = this.x;
  array[offset + 1] = this.y;
  array[offset + 2] = this.z;
  return array;
}

/**
 * Sets components from buffer attribute at index.
 */
fromBufferAttribute(attribute, index) {
  this.x = attribute.getX(index);
  this.y = attribute.getY(index);
  this.z = attribute.getZ(index);
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
  this.#markDirty();
  return this;
}

/**
 * Sets to random unit vector on sphere.
 */
randomDirection() {
  const theta = Math.random() * Math.PI * 2;
  const u = Math.random() * 2 - 1;
  const c = Math.sqrt(1 - u * u);

  this.x = c * Math.cos(theta);
  this.y = u;
  this.z = c * Math.sin(theta);
  this.#markDirty();
  return this;
}

// ─── Iterator ────────────────────────────────────────────────────────────────

*[Symbol.iterator]() {
  yield this.x;
  yield this.y;
  yield this.z;
}
export const createVector3 = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
export { Vector3 };

