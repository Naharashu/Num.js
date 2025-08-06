/**
 * Universal Functions (ufuncs) for Num.js
 * Provides element-wise operations that work on both scalars and NDArrays
 */

import type { NumericArray, DType } from '../types/common.js';
import { NDArray } from '../ndarray/ndarray.js';
import { 
  InvalidParameterError, 
  MathematicalError,
  DivisionByZeroError 
} from '../types/errors.js';
import { 
  validateFiniteNumber,
  validateNumericArray 
} from '../types/validation.js';

// ============================================================================
// Universal Function Types
// ============================================================================

/** Function that operates on a single number */
export type UnaryScalarFunction = (x: number) => number;

/** Function that operates on two numbers */
export type BinaryScalarFunction = (x: number, y: number) => number;

/** Universal function that can operate on scalars or NDArrays with type preservation */
export type UniversalFunction<T extends UnaryScalarFunction | BinaryScalarFunction> = 
  T extends UnaryScalarFunction 
    ? ((x: number) => number) & (<U extends DType>(x: NDArray<U>) => NDArray<U>)
    : T extends BinaryScalarFunction
    ? ((x: number, y: number) => number) & 
      (<U extends DType>(x: NDArray<U>, y: number) => NDArray<U>) & 
      (<U extends DType>(x: number, y: NDArray<U>) => NDArray<U>) & 
      (<U extends DType, V extends DType>(x: NDArray<U>, y: NDArray<V>) => NDArray<U>)
    : never;

// ============================================================================
// Universal Function Creators
// ============================================================================

/**
 * Create a universal function from a unary scalar function
 * @param scalarFn - Function that operates on a single number
 * @param name - Name of the function for error messages
 * @returns Universal function that works on scalars and NDArrays
 */
export function createUnaryUfunc(
  scalarFn: UnaryScalarFunction,
  name: string
): UniversalFunction<UnaryScalarFunction> {
  function ufunc(x: number | NDArray): number | NDArray {
    if (typeof x === 'number') {
      validateFiniteNumber(x, 'x');
      try {
        return scalarFn(x);
      } catch (error) {
        throw new MathematicalError(`${name} failed: ${error}`, name);
      }
    }
    
    if (x instanceof NDArray) {
      // Use optimized kernel for element-wise operations
      return applyUnaryKernel(x, scalarFn, name);
    }
    
    throw new InvalidParameterError('x', 'number or NDArray', typeof x);
  }
  
  return ufunc as UniversalFunction<UnaryScalarFunction>;
}

/**
 * Optimized kernel for unary operations on NDArrays
 * Uses stride-based iteration for maximum performance
 */
function applyUnaryKernel<T extends DType>(arr: NDArray<T>, fn: UnaryScalarFunction, name: string): NDArray<T> {
  const size = arr.size;
  const resultData = new (arr.data.constructor as any)(size);
  const sourceData = arr.data;
  const offset = arr.offset;
  
  // Optimized loop - JIT compiler can optimize simple for loops better
  for (let i = 0; i < size; i++) {
    const value = sourceData[offset + i]!;
    try {
      resultData[i] = fn(value);
    } catch (error) {
      throw new MathematicalError(`${name} failed at index ${i}: ${error}`, name);
    }
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, arr.shape, arr.dtype);
}

/**
 * Create a universal function from a binary scalar function
 * @param scalarFn - Function that operates on two numbers
 * @param name - Name of the function for error messages
 * @returns Universal function that works on scalars and NDArrays with broadcasting
 */
export function createBinaryUfunc(
  scalarFn: BinaryScalarFunction,
  name: string
): UniversalFunction<BinaryScalarFunction> {
  function ufunc(x: number | NDArray, y: number | NDArray): number | NDArray {
    // Both scalars
    if (typeof x === 'number' && typeof y === 'number') {
      validateFiniteNumber(x, 'x');
      validateFiniteNumber(y, 'y');
      try {
        return scalarFn(x, y);
      } catch (error) {
        throw new MathematicalError(`${name} failed: ${error}`, name);
      }
    }
    
    // x is NDArray, y is scalar - use optimized scalar kernel
    if (x instanceof NDArray && typeof y === 'number') {
      validateFiniteNumber(y, 'y');
      return applyBinaryScalarKernel(x, y, scalarFn, name);
    }
    
    // x is scalar, y is NDArray - use optimized scalar kernel (reversed)
    if (typeof x === 'number' && y instanceof NDArray) {
      validateFiniteNumber(x, 'x');
      return applyBinaryScalarKernel(y, x, (a, b) => scalarFn(b, a), name);
    }
    
    // Both are NDArrays - use broadcasting
    if (x instanceof NDArray && y instanceof NDArray) {
      return x._broadcastBinaryOp(y, scalarFn, name);
    }
    
    throw new InvalidParameterError('x or y', 'number or NDArray', `x: ${typeof x}, y: ${typeof y}`);
  }
  
  return ufunc as UniversalFunction<BinaryScalarFunction>;
}

/**
 * Optimized kernel for binary operations between NDArray and scalar
 * Avoids creating temporary arrays and uses direct iteration
 */
function applyBinaryScalarKernel<T extends DType>(
  arr: NDArray<T>, 
  scalar: number, 
  fn: BinaryScalarFunction, 
  name: string
): NDArray<T> {
  const size = arr.size;
  const resultData = new (arr.data.constructor as any)(size);
  const sourceData = arr.data;
  const offset = arr.offset;
  
  // Optimized loop for scalar operations
  for (let i = 0; i < size; i++) {
    const value = sourceData[offset + i]!;
    try {
      resultData[i] = fn(value, scalar);
    } catch (error) {
      throw new MathematicalError(`${name} failed at index ${i}: ${error}`, name);
    }
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, arr.shape, arr.dtype);
}

// ============================================================================
// Mathematical Universal Functions
// ============================================================================

/** Absolute value */
export const abs = createUnaryUfunc(Math.abs, 'abs');

/** Square root */
export const sqrt = createUnaryUfunc((x: number) => {
  if (x < 0) {
    throw new Error('Square root of negative number');
  }
  return Math.sqrt(x);
}, 'sqrt');

/** Cube root */
export const cbrt = createUnaryUfunc(Math.cbrt, 'cbrt');

/** Natural exponential (e^x) */
export const exp = createUnaryUfunc(Math.exp, 'exp');

/** Exponential base 2 (2^x) */
export const exp2 = createUnaryUfunc((x: number) => Math.pow(2, x), 'exp2');

/** Exponential minus 1 (e^x - 1) */
export const expm1 = createUnaryUfunc(Math.expm1, 'expm1');

/** Natural logarithm */
export const log = createUnaryUfunc((x: number) => {
  if (x <= 0) {
    throw new Error('Logarithm of non-positive number');
  }
  return Math.log(x);
}, 'log');

/** Base 2 logarithm */
export const log2 = createUnaryUfunc((x: number) => {
  if (x <= 0) {
    throw new Error('Logarithm of non-positive number');
  }
  return Math.log2(x);
}, 'log2');

/** Base 10 logarithm */
export const log10 = createUnaryUfunc((x: number) => {
  if (x <= 0) {
    throw new Error('Logarithm of non-positive number');
  }
  return Math.log10(x);
}, 'log10');

/** Natural logarithm of (1 + x) */
export const log1p = createUnaryUfunc(Math.log1p, 'log1p');

/** Sign function (-1, 0, or 1) */
export const sign = createUnaryUfunc(Math.sign, 'sign');

/** Ceiling function */
export const ceil = createUnaryUfunc(Math.ceil, 'ceil');

/** Floor function */
export const floor = createUnaryUfunc(Math.floor, 'floor');

/** Round to nearest integer */
export const round = createUnaryUfunc(Math.round, 'round');

/** Truncate towards zero */
export const trunc = createUnaryUfunc(Math.trunc, 'trunc');

// ============================================================================
// Trigonometric Universal Functions
// ============================================================================

/** Sine */
export const sin = createUnaryUfunc(Math.sin, 'sin');

/** Cosine */
export const cos = createUnaryUfunc(Math.cos, 'cos');

/** Tangent */
export const tan = createUnaryUfunc(Math.tan, 'tan');

/** Arcsine */
export const asin = createUnaryUfunc((x: number) => {
  if (x < -1 || x > 1) {
    throw new Error('Arcsine input must be between -1 and 1');
  }
  return Math.asin(x);
}, 'asin');

/** Arccosine */
export const acos = createUnaryUfunc((x: number) => {
  if (x < -1 || x > 1) {
    throw new Error('Arccosine input must be between -1 and 1');
  }
  return Math.acos(x);
}, 'acos');

/** Arctangent */
export const atan = createUnaryUfunc(Math.atan, 'atan');

/** Two-argument arctangent */
export const atan2 = createBinaryUfunc(Math.atan2, 'atan2');

// ============================================================================
// Hyperbolic Universal Functions
// ============================================================================

/** Hyperbolic sine */
export const sinh = createUnaryUfunc(Math.sinh, 'sinh');

/** Hyperbolic cosine */
export const cosh = createUnaryUfunc(Math.cosh, 'cosh');

/** Hyperbolic tangent */
export const tanh = createUnaryUfunc(Math.tanh, 'tanh');

/** Inverse hyperbolic sine */
export const asinh = createUnaryUfunc(Math.asinh, 'asinh');

/** Inverse hyperbolic cosine */
export const acosh = createUnaryUfunc((x: number) => {
  if (x < 1) {
    throw new Error('Inverse hyperbolic cosine input must be >= 1');
  }
  return Math.acosh(x);
}, 'acosh');

/** Inverse hyperbolic tangent */
export const atanh = createUnaryUfunc((x: number) => {
  if (x <= -1 || x >= 1) {
    throw new Error('Inverse hyperbolic tangent input must be between -1 and 1');
  }
  return Math.atanh(x);
}, 'atanh');

// ============================================================================
// Binary Arithmetic Universal Functions
// ============================================================================

/** Addition */
export const add = createBinaryUfunc((x: number, y: number) => x + y, 'add');

/** Subtraction */
export const subtract = createBinaryUfunc((x: number, y: number) => x - y, 'subtract');

/** Multiplication */
export const multiply = createBinaryUfunc((x: number, y: number) => x * y, 'multiply');

/** Division */
export const divide = createBinaryUfunc((x: number, y: number) => {
  if (y === 0) {
    throw new Error('Division by zero');
  }
  return x / y;
}, 'divide');

/** Floor division */
export const floorDivide = createBinaryUfunc((x: number, y: number) => {
  if (y === 0) {
    throw new Error('Division by zero');
  }
  return Math.floor(x / y);
}, 'floorDivide');

/** Modulo */
export const mod = createBinaryUfunc((x: number, y: number) => {
  if (y === 0) {
    throw new Error('Modulo by zero');
  }
  return x % y;
}, 'mod');

/** Power */
export const power = createBinaryUfunc(Math.pow, 'power');

/** Minimum of two values */
export const minimum = createBinaryUfunc(Math.min, 'minimum');

/** Maximum of two values */
export const maximum = createBinaryUfunc(Math.max, 'maximum');

// ============================================================================
// Activation Function Universal Functions
// ============================================================================

/** Sigmoid activation function */
export const sigmoid = createUnaryUfunc((x: number) => {
  // Prevent overflow for very large negative values
  if (x < -500) return 0;
  if (x > 500) return 1;
  return 1 / (1 + Math.exp(-x));
}, 'sigmoid');

/** ReLU activation function */
export const relu = createUnaryUfunc((x: number) => Math.max(0, x), 'relu');

/** Leaky ReLU activation function with default alpha=0.01 */
export const leakyRelu = createBinaryUfunc((x: number, alpha: number) => {
  return x > 0 ? x : alpha * x;
}, 'leakyRelu');

/** Softplus activation function */
export const softplus = createUnaryUfunc((x: number) => {
  // Prevent overflow for large positive values
  if (x > 500) return x;
  return Math.log(1 + Math.exp(x));
}, 'softplus');

/** Softsign activation function */
export const softsign = createUnaryUfunc((x: number) => {
  return x / (1 + Math.abs(x));
}, 'softsign');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Apply a custom unary function element-wise to an NDArray
 * @param arr - Input NDArray
 * @param fn - Function to apply
 * @param name - Name for error messages
 * @returns New NDArray with function applied
 */
export function applyUnary(arr: NDArray, fn: UnaryScalarFunction, name: string = 'custom'): NDArray {
  const ufunc = createUnaryUfunc(fn, name);
  return ufunc(arr) as NDArray;
}

/**
 * Apply a custom binary function element-wise with broadcasting
 * @param x - First input (NDArray or scalar)
 * @param y - Second input (NDArray or scalar)
 * @param fn - Function to apply
 * @param name - Name for error messages
 * @returns New NDArray with function applied
 */
export function applyBinary(
  x: NDArray | number, 
  y: NDArray | number, 
  fn: BinaryScalarFunction, 
  name: string = 'custom'
): NDArray | number {
  const ufunc = createBinaryUfunc(fn, name);
  return (ufunc as any)(x, y);
}

/**
 * Check if a value is a universal function
 * @param fn - Function to check
 * @returns True if the function is a ufunc
 */
export function isUfunc(fn: unknown): fn is UniversalFunction<any> {
  return typeof fn === 'function' && 
         fn.hasOwnProperty('_isUfunc') && 
         (fn as any)._isUfunc === true;
}

// ============================================================================
// Comparison Universal Functions
// ============================================================================

/** Element-wise equality comparison */
export const equal = createBinaryUfunc((x: number, y: number) => x === y ? 1 : 0, 'equal');

/** Element-wise inequality comparison */
export const notEqual = createBinaryUfunc((x: number, y: number) => x !== y ? 1 : 0, 'notEqual');

/** Element-wise less than comparison */
export const less = createBinaryUfunc((x: number, y: number) => x < y ? 1 : 0, 'less');

/** Element-wise less than or equal comparison */
export const lessEqual = createBinaryUfunc((x: number, y: number) => x <= y ? 1 : 0, 'lessEqual');

/** Element-wise greater than comparison */
export const greater = createBinaryUfunc((x: number, y: number) => x > y ? 1 : 0, 'greater');

/** Element-wise greater than or equal comparison */
export const greaterEqual = createBinaryUfunc((x: number, y: number) => x >= y ? 1 : 0, 'greaterEqual');

// ============================================================================
// Logical Universal Functions
// ============================================================================

/** Logical NOT (element-wise) */
export const logicalNot = createUnaryUfunc((x: number) => x === 0 ? 1 : 0, 'logicalNot');

/** Logical AND (element-wise) */
export const logicalAnd = createBinaryUfunc((x: number, y: number) => (x !== 0 && y !== 0) ? 1 : 0, 'logicalAnd');

/** Logical OR (element-wise) */
export const logicalOr = createBinaryUfunc((x: number, y: number) => (x !== 0 || y !== 0) ? 1 : 0, 'logicalOr');

/** Logical XOR (element-wise) */
export const logicalXor = createBinaryUfunc((x: number, y: number) => {
  const xBool = x !== 0;
  const yBool = y !== 0;
  return (xBool !== yBool) ? 1 : 0;
}, 'logicalXor');

// ============================================================================
// Boolean Array Reduction Functions
// ============================================================================

/**
 * Test whether any array element is true (non-zero)
 * @param arr - Input NDArray
 * @param axis - Axis along which to perform the operation (optional)
 * @returns Boolean result or NDArray of boolean results
 */
export function any(arr: NDArray, axis?: number): boolean | NDArray {
  if (axis === undefined) {
    // Reduce entire array to single boolean
    for (let i = 0; i < arr.size; i++) {
      const value = (arr as any)._data[(arr as any)._offset + i];
      if (value !== 0) {
        return true;
      }
    }
    return false;
  }
  
  // Axis-wise reduction - for now, throw error as this requires more complex implementation
  throw new InvalidParameterError('axis', 'number or undefined', axis, 'axis-wise reduction not yet implemented');
}

/**
 * Test whether all array elements are true (non-zero)
 * @param arr - Input NDArray
 * @param axis - Axis along which to perform the operation (optional)
 * @returns Boolean result or NDArray of boolean results
 */
export function all(arr: NDArray, axis?: number): boolean | NDArray {
  if (axis === undefined) {
    // Reduce entire array to single boolean
    for (let i = 0; i < arr.size; i++) {
      const value = (arr as any)._data[(arr as any)._offset + i];
      if (value === 0) {
        return false;
      }
    }
    return true;
  }
  
  // Axis-wise reduction - for now, throw error as this requires more complex implementation
  throw new InvalidParameterError('axis', 'number or undefined', axis, 'axis-wise reduction not yet implemented');
}

// ============================================================================
// Utility Functions for Boolean Operations
// ============================================================================

/**
 * Create a boolean NDArray from comparison results
 * @param arr - Input NDArray with numeric values (0 = false, non-zero = true)
 * @returns New NDArray with boolean interpretation
 */
export function toBooleanArray<T extends DType>(arr: NDArray<T>): NDArray<T> {
  const resultData = new (arr.data.constructor as any)(arr.size);
  
  for (let i = 0; i < arr.size; i++) {
    const value = arr.data[arr.offset + i]!;
    resultData[i] = value !== 0 ? 1 : 0;
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < arr.size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, arr.shape, arr.dtype);
}

/**
 * Count the number of true (non-zero) elements in an array
 * @param arr - Input NDArray
 * @returns Number of non-zero elements
 */
export function countNonzero(arr: NDArray): number {
  let count = 0;
  for (let i = 0; i < arr.size; i++) {
    const value = (arr as any)._data[(arr as any)._offset + i];
    if (value !== 0) {
      count++;
    }
  }
  return count;
}

/**
 * Return indices where array elements are non-zero
 * @param arr - Input NDArray
 * @returns Array of indices where elements are non-zero
 */
export function nonzero(arr: NDArray): number[][] {
  const indices: number[][] = [];
  
  for (let i = 0; i < arr.size; i++) {
    const value = (arr as any)._data[(arr as any)._offset + i];
    if (value !== 0) {
      // Convert flat index to multi-dimensional indices
      const multiIndices = (arr as any)._flatIndexToIndices(i, arr.shape, (arr as any)._strides);
      indices.push(multiIndices);
    }
  }
  
  return indices;
}

/**
 * Element-wise conditional selection
 * @param condition - NDArray of conditions (0 = false, non-zero = true)
 * @param x - Values to select when condition is true
 * @param y - Values to select when condition is false
 * @returns NDArray with selected values
 */
export function where<T extends DType>(condition: NDArray<T>, x: NDArray<T> | number, y: NDArray<T> | number): NDArray<T> {
  // For simplicity, implement basic case where condition determines the shape
  const resultData = new (condition.data.constructor as any)(condition.size);
  
  for (let i = 0; i < condition.size; i++) {
    const condValue = condition.data[condition.offset + i]!;
    
    let xValue: number;
    let yValue: number;
    
    if (typeof x === 'number') {
      xValue = x;
    } else {
      // For simplicity, assume same shape - in full implementation would need broadcasting
      xValue = x.data[x.offset + i]!;
    }
    
    if (typeof y === 'number') {
      yValue = y;
    } else {
      // For simplicity, assume same shape - in full implementation would need broadcasting
      yValue = y.data[y.offset + i]!;
    }
    
    resultData[i] = condValue !== 0 ? xValue : yValue;
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < condition.size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, condition.shape, condition.dtype);
}

// Mark all exported ufuncs
Object.defineProperty(abs, '_isUfunc', { value: true, writable: false });
Object.defineProperty(sqrt, '_isUfunc', { value: true, writable: false });
Object.defineProperty(exp, '_isUfunc', { value: true, writable: false });
Object.defineProperty(log, '_isUfunc', { value: true, writable: false });
Object.defineProperty(sin, '_isUfunc', { value: true, writable: false });
Object.defineProperty(cos, '_isUfunc', { value: true, writable: false });
Object.defineProperty(add, '_isUfunc', { value: true, writable: false });
Object.defineProperty(multiply, '_isUfunc', { value: true, writable: false });
Object.defineProperty(sigmoid, '_isUfunc', { value: true, writable: false });
Object.defineProperty(relu, '_isUfunc', { value: true, writable: false });
Object.defineProperty(equal, '_isUfunc', { value: true, writable: false });
Object.defineProperty(greater, '_isUfunc', { value: true, writable: false });
Object.defineProperty(logicalAnd, '_isUfunc', { value: true, writable: false });
Object.defineProperty(logicalOr, '_isUfunc', { value: true, writable: false });
// ============================================================================
// Optimized Arithmetic Kernels
// ============================================================================

/**
 * Optimized addition kernel for NDArrays
 * Uses direct TypedArray access for maximum performance
 */
export function addKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => x + y, 'add');
  }
  
  // For array-array operations, delegate to broadcasting
  return a._broadcastBinaryOp(b, (x, y) => x + y, 'add');
}

/**
 * Optimized subtraction kernel for NDArrays
 */
export function subtractKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => x - y, 'subtract');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => x - y, 'subtract');
}

/**
 * Optimized multiplication kernel for NDArrays
 */
export function multiplyKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => x * y, 'multiply');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => x * y, 'multiply');
}

/**
 * Optimized division kernel for NDArrays
 */
export function divideKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    if (b === 0) {
      throw new DivisionByZeroError('Cannot divide by zero');
    }
    return applyBinaryScalarKernel(a, b, (x, y) => x / y, 'divide');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => {
    if (y === 0) {
      throw new DivisionByZeroError('Cannot divide by zero');
    }
    return x / y;
  }, 'divide');
}

/**
 * Optimized power kernel for NDArrays
 */
export function powerKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => Math.pow(x, y), 'power');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => Math.pow(x, y), 'power');
}

/**
 * Optimized element-wise maximum kernel
 */
export function maximumKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => Math.max(x, y), 'maximum');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => Math.max(x, y), 'maximum');
}

/**
 * Optimized element-wise minimum kernel
 */
export function minimumKernel(a: NDArray, b: NDArray | number): NDArray {
  if (typeof b === 'number') {
    return applyBinaryScalarKernel(a, b, (x, y) => Math.min(x, y), 'minimum');
  }
  
  return a._broadcastBinaryOp(b, (x, y) => Math.min(x, y), 'minimum');
}

// ============================================================================
// Fused Operation Kernels (for future loop fusion optimization)
// ============================================================================

/**
 * Fused multiply-add kernel: (a * b) + c
 * Avoids creating intermediate array for a * b
 */
export function multiplyAddKernel<T extends DType>(a: NDArray<T>, b: NDArray<T> | number, c: NDArray<T> | number): NDArray<T> {
  const size = a.size;
  const resultData = new (a.data.constructor as any)(size);
  const aData = a.data;
  const aOffset = a.offset;
  
  if (typeof b === 'number' && typeof c === 'number') {
    // Optimized case: a * scalar + scalar
    for (let i = 0; i < size; i++) {
      resultData[i] = aData[aOffset + i]! * b + c;
    }
  } else {
    // For more complex cases, fall back to separate operations
    // This is where future loop fusion optimization would go
    const temp = multiply(a, b as any) as NDArray<T>;
    return add(temp, c as any) as NDArray<T>;
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, a.shape, a.dtype);
}

/**
 * Fused add-multiply kernel: (a + b) * c
 * Avoids creating intermediate array for a + b
 */
export function addMultiplyKernel<T extends DType>(a: NDArray<T>, b: NDArray<T> | number, c: NDArray<T> | number): NDArray<T> {
  const size = a.size;
  const resultData = new (a.data.constructor as any)(size);
  const aData = a.data;
  const aOffset = a.offset;
  
  if (typeof b === 'number' && typeof c === 'number') {
    // Optimized case: (a + scalar) * scalar
    for (let i = 0; i < size; i++) {
      resultData[i] = (aData[aOffset + i]! + b) * c;
    }
  } else {
    // For more complex cases, fall back to separate operations
    const temp = add(a, b as any) as NDArray<T>;
    return multiply(temp, c as any) as NDArray<T>;
  }
  
  // Convert TypedArray to regular array for NDArray constructor
  const resultArray: number[] = [];
  for (let i = 0; i < size; i++) {
    resultArray[i] = resultData[i];
  }
  return new NDArray<T>(resultArray, a.shape, a.dtype);
}