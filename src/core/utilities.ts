/**
 * Utility functions for Num.js TypeScript migration
 * Provides shape detection, broadcasting, and array manipulation utilities
 */

import type { 
  NumericArray, 
  NumericMatrix, 
  Numeric3D, 
  Shape,
  Dimensions 
} from '../types/common.js';
import type { MatrixLike, Array3dLike } from '../types/matrix.js';
import { 
  InvalidParameterError, 
  DimensionError 
} from '../types/errors.js';
import { 
  validateNumericArray,
  validateNumericMatrix,
  validateNumeric3DArray 
} from '../types/validation.js';

// ============================================================================
// Shape Detection and Analysis
// ============================================================================

/**
 * Get the shape of a numeric array (1D, 2D, or 3D)
 * @param arr - The array to analyze
 * @returns Shape tuple representing dimensions
 * 
 * @example
 * getShape([1, 2, 3]) // [3]
 * getShape([[1, 2], [3, 4]]) // [2, 2]
 * getShape([[[1, 2]], [[3, 4]]]) // [2, 1, 2]
 */
export function getShape(arr: NumericArray | NumericMatrix | Numeric3D): Shape {
  if (!Array.isArray(arr)) {
    throw new InvalidParameterError('arr', 'array', arr);
  }
  
  if (arr.length === 0) {
    return [0];
  }
  
  // Check if it's a 1D array
  if (typeof arr[0] === 'number') {
    return [arr.length];
  }
  
  // Check if it's a 2D array
  if (Array.isArray(arr[0]) && typeof arr[0]?.[0] === 'number') {
    const matrix = arr as NumericMatrix;
    validateNumericMatrix(matrix, 'arr');
    return [matrix.length, matrix[0]!.length];
  }
  
  // Check if it's a 3D array
  if (Array.isArray(arr[0]) && Array.isArray(arr[0]?.[0]) && typeof arr[0]?.[0]?.[0] === 'number') {
    const array3d = arr as Numeric3D;
    validateNumeric3DArray(array3d, 'arr');
    return [array3d.length, array3d[0]!.length, array3d[0]![0]!.length];
  }
  
  throw new InvalidParameterError('arr', 'numeric array (1D, 2D, or 3D)', arr);
}

/**
 * Get comprehensive dimension information for an array
 * @param arr - The array to analyze
 * @returns Dimensions object with shape, ndim, and size
 * 
 * @example
 * getDimensions([[1, 2, 3], [4, 5, 6]]) 
 * // { shape: [2, 3], ndim: 2, size: 6 }
 */
export function getDimensions(arr: NumericArray | NumericMatrix | Numeric3D): Dimensions {
  const shape = getShape(arr);
  const ndim = shape.length;
  const size = shape.reduce((total, dim) => total * dim, 1);
  
  return {
    shape,
    ndim,
    size
  };
}

/**
 * Check if two arrays have the same shape
 * @param a - First array
 * @param b - Second array
 * @returns True if shapes are identical
 * 
 * @example
 * hasSameShape([1, 2, 3], [4, 5, 6]) // true
 * hasSameShape([[1, 2]], [[3, 4]]) // true
 * hasSameShape([1, 2], [[1, 2]]) // false
 */
export function hasSameShape(
  a: NumericArray | NumericMatrix | Numeric3D,
  b: NumericArray | NumericMatrix | Numeric3D
): boolean {
  const shapeA = getShape(a);
  const shapeB = getShape(b);
  
  if (shapeA.length !== shapeB.length) {
    return false;
  }
  
  return shapeA.every((dim, i) => dim === shapeB[i]);
}

/**
 * Check if an array is a valid shape for broadcasting with another array
 * @param shape1 - First array shape
 * @param shape2 - Second array shape
 * @returns True if shapes are broadcastable
 * 
 * @example
 * isBroadcastable([3, 4], [4]) // true
 * isBroadcastable([3, 4], [3, 1]) // true
 * isBroadcastable([3, 4], [2, 4]) // false
 */
export function isBroadcastable(shape1: Shape, shape2: Shape): boolean {
  const maxLen = Math.max(shape1.length, shape2.length);
  
  // Pad shapes with 1s on the left to make them the same length
  const padded1 = [...Array(maxLen - shape1.length).fill(1), ...shape1];
  const padded2 = [...Array(maxLen - shape2.length).fill(1), ...shape2];
  
  // Check if each dimension is compatible
  for (let i = 0; i < maxLen; i++) {
    const dim1 = padded1[i];
    const dim2 = padded2[i];
    
    // Dimensions are compatible if they're equal or one of them is 1
    if (dim1 !== dim2 && dim1 !== 1 && dim2 !== 1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate the resulting shape after broadcasting two arrays
 * @param shape1 - First array shape
 * @param shape2 - Second array shape
 * @returns Resulting broadcast shape
 * 
 * @example
 * getBroadcastShape([3, 4], [4]) // [3, 4]
 * getBroadcastShape([3, 1], [1, 4]) // [3, 4]
 */
export function getBroadcastShape(shape1: Shape, shape2: Shape): Shape {
  if (!isBroadcastable(shape1, shape2)) {
    throw new DimensionError(
      'Arrays are not broadcastable',
      shape1,
      shape2,
      'broadcasting'
    );
  }
  
  const maxLen = Math.max(shape1.length, shape2.length);
  const padded1 = [...Array(maxLen - shape1.length).fill(1), ...shape1];
  const padded2 = [...Array(maxLen - shape2.length).fill(1), ...shape2];
  
  const result: number[] = [];
  for (let i = 0; i < maxLen; i++) {
    result.push(Math.max(padded1[i], padded2[i]));
  }
  
  return result;
}

// ============================================================================
// Array Reshaping and Manipulation
// ============================================================================

/**
 * Flatten a multi-dimensional array to 1D
 * @param arr - Array to flatten
 * @returns Flattened 1D array
 * 
 * @example
 * flatten([[1, 2], [3, 4]]) // [1, 2, 3, 4]
 * flatten([[[1, 2]], [[3, 4]]]) // [1, 2, 3, 4]
 */
export function flatten(arr: NumericArray | NumericMatrix | Numeric3D): NumericArray {
  const result: NumericArray = [];
  
  function flattenRecursive(item: any): void {
    if (typeof item === 'number') {
      result.push(item);
    } else if (Array.isArray(item)) {
      for (const subItem of item) {
        flattenRecursive(subItem);
      }
    }
  }
  
  flattenRecursive(arr);
  return result;
}

/**
 * Reshape a 1D array into a multi-dimensional array
 * @param arr - 1D array to reshape
 * @param shape - Target shape
 * @returns Reshaped array
 * 
 * @example
 * reshape([1, 2, 3, 4], [2, 2]) // [[1, 2], [3, 4]]
 * reshape([1, 2, 3, 4, 5, 6], [2, 3]) // [[1, 2, 3], [4, 5, 6]]
 */
export function reshape(arr: NumericArray, shape: Shape): NumericArray | NumericMatrix | Numeric3D {
  validateNumericArray(arr, 'arr');
  
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new InvalidParameterError('shape', 'non-empty array of positive integers', shape);
  }
  
  // Validate shape dimensions
  for (let i = 0; i < shape.length; i++) {
    if (!Number.isInteger(shape[i]) || shape[i] <= 0) {
      throw new InvalidParameterError(
        `shape[${i}]`, 
        'positive integer', 
        shape[i]
      );
    }
  }
  
  const totalElements = shape.reduce((total, dim) => total * dim, 1);
  
  if (totalElements !== arr.length) {
    throw new DimensionError(
      `Cannot reshape array of size ${arr.length} into shape [${shape.join(', ')}]`,
      [arr.length],
      shape,
      'reshape'
    );
  }
  
  if (shape.length === 1) {
    return [...arr]; // Return copy of 1D array
  }
  
  if (shape.length === 2) {
    const [rows, cols] = shape;
    const result: NumericMatrix = [];
    
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        const value = arr[index];
        if (value === undefined) {
          throw new InvalidParameterError('arr', 'array with sufficient elements', arr);
        }
        row.push(value);
      }
      result.push(row);
    }
    
    return result;
  }
  
  if (shape.length === 3) {
    const [x, y, z] = shape;
    const result: Numeric3D = [];
    
    for (let i = 0; i < x; i++) {
      const plane: NumericMatrix = [];
      for (let j = 0; j < y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < z; k++) {
          const index = i * y * z + j * z + k;
          const value = arr[index];
          if (value === undefined) {
            throw new InvalidParameterError('arr', 'array with sufficient elements', arr);
          }
          row.push(value);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return result;
  }
  
  throw new InvalidParameterError(
    'shape', 
    'array with 1-3 dimensions', 
    shape,
    'Only 1D, 2D, and 3D reshaping is supported'
  );
}

/**
 * Transpose a 2D array (swap rows and columns)
 * @param matrix - 2D array to transpose
 * @returns Transposed matrix
 * 
 * @example
 * transpose([[1, 2, 3], [4, 5, 6]]) // [[1, 4], [2, 5], [3, 6]]
 */
export function transpose(matrix: NumericMatrix): NumericMatrix {
  validateNumericMatrix(matrix, 'matrix');
  
  const rows = matrix.length;
  const cols = matrix[0]!.length;
  const result: NumericMatrix = [];
  
  for (let j = 0; j < cols; j++) {
    const newRow: NumericArray = [];
    for (let i = 0; i < rows; i++) {
      const value = matrix[i]?.[j];
      if (value === undefined) {
        throw new InvalidParameterError('matrix', 'valid matrix with consistent dimensions', matrix);
      }
      newRow.push(value);
    }
    result.push(newRow);
  }
  
  return result;
}

// ============================================================================
// Array Generation Utilities
// ============================================================================

/**
 * Create an array filled with zeros
 * @param shape - Shape of the array to create
 * @returns Array filled with zeros
 * 
 * @example
 * zeros([3]) // [0, 0, 0]
 * zeros([2, 3]) // [[0, 0, 0], [0, 0, 0]]
 */
export function zeros(shape: Shape): NumericArray | NumericMatrix | Numeric3D {
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new InvalidParameterError('shape', 'non-empty array', shape);
  }
  
  if (shape.length === 1) {
    return Array(shape[0]).fill(0);
  }
  
  if (shape.length === 2) {
    const [rows, cols] = shape;
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  }
  
  if (shape.length === 3) {
    const [x, y, z] = shape;
    return Array.from({ length: x }, () =>
      Array.from({ length: y }, () => Array(z).fill(0))
    );
  }
  
  throw new InvalidParameterError(
    'shape', 
    'array with 1-3 dimensions', 
    shape
  );
}

/**
 * Create an array filled with ones
 * @param shape - Shape of the array to create
 * @returns Array filled with ones
 * 
 * @example
 * ones([3]) // [1, 1, 1]
 * ones([2, 2]) // [[1, 1], [1, 1]]
 */
export function ones(shape: Shape): NumericArray | NumericMatrix | Numeric3D {
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new InvalidParameterError('shape', 'non-empty array', shape);
  }
  
  if (shape.length === 1) {
    return Array(shape[0]).fill(1);
  }
  
  if (shape.length === 2) {
    const [rows, cols] = shape;
    return Array.from({ length: rows }, () => Array(cols).fill(1));
  }
  
  if (shape.length === 3) {
    const [x, y, z] = shape;
    return Array.from({ length: x }, () =>
      Array.from({ length: y }, () => Array(z).fill(1))
    );
  }
  
  throw new InvalidParameterError(
    'shape', 
    'array with 1-3 dimensions', 
    shape
  );
}

/**
 * Create an array filled with a specific value
 * @param shape - Shape of the array to create
 * @param value - Value to fill the array with
 * @returns Array filled with the specified value
 * 
 * @example
 * full([3], 5) // [5, 5, 5]
 * full([2, 2], 3.14) // [[3.14, 3.14], [3.14, 3.14]]
 */
export function full(
  shape: Shape, 
  value: number
): NumericArray | NumericMatrix | Numeric3D {
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new InvalidParameterError('shape', 'non-empty array', shape);
  }
  
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidParameterError('value', 'finite number', value);
  }
  
  if (shape.length === 1) {
    return Array(shape[0]).fill(value);
  }
  
  if (shape.length === 2) {
    const [rows, cols] = shape;
    return Array.from({ length: rows }, () => Array(cols).fill(value));
  }
  
  if (shape.length === 3) {
    const [x, y, z] = shape;
    return Array.from({ length: x }, () =>
      Array.from({ length: y }, () => Array(z).fill(value))
    );
  }
  
  throw new InvalidParameterError(
    'shape', 
    'array with 1-3 dimensions', 
    shape
  );
}

/**
 * Create an identity matrix
 * @param n - Size of the identity matrix (n x n)
 * @returns Identity matrix
 * 
 * @example
 * eye(3) // [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
 */
export function eye(n: number): NumericMatrix {
  if (!Number.isInteger(n) || n <= 0) {
    throw new InvalidParameterError('n', 'positive integer', n);
  }
  
  const result: NumericMatrix = [];
  
  for (let i = 0; i < n; i++) {
    const row: NumericArray = Array(n).fill(0);
    row[i] = 1;
    result.push(row);
  }
  
  return result;
}

// ============================================================================
// Array Comparison and Analysis
// ============================================================================

/**
 * Check if all elements in an array are equal within a tolerance
 * @param arr - Array to check
 * @param tolerance - Tolerance for floating point comparison
 * @returns True if all elements are approximately equal
 * 
 * @example
 * allEqual([1, 1, 1]) // true
 * allEqual([1, 1.0001, 1], 0.001) // true
 * allEqual([1, 2, 3]) // false
 */
export function allEqual(arr: NumericArray, tolerance: number = Number.EPSILON): boolean {
  if (!Array.isArray(arr)) {
    throw new InvalidParameterError('arr', 'array', arr);
  }
  
  // Empty arrays are considered "all equal" (vacuous truth)
  if (arr.length === 0) return true;
  
  // Validate that all elements are finite numbers
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number' || !Number.isFinite(arr[i])) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', arr[i]);
    }
  }
  
  if (arr.length === 1) return true;
  
  const first = arr[0]!;
  return arr.every(value => Math.abs(value - first) <= tolerance);
}

/**
 * Find unique elements in an array
 * @param arr - Array to analyze
 * @returns Array of unique elements (sorted)
 * 
 * @example
 * unique([1, 2, 2, 3, 1]) // [1, 2, 3]
 * unique([3.14, 2.71, 3.14]) // [2.71, 3.14]
 */
export function unique(arr: NumericArray): NumericArray {
  if (!Array.isArray(arr)) {
    throw new InvalidParameterError('arr', 'array', arr);
  }
  
  if (arr.length === 0) {
    return [];
  }
  
  // Validate that all elements are finite numbers
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number' || !Number.isFinite(arr[i])) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', arr[i]);
    }
  }
  
  const uniqueSet = new Set(arr);
  return Array.from(uniqueSet).sort((a, b) => a - b);
}

/**
 * Count occurrences of each unique element
 * @param arr - Array to analyze
 * @returns Map of element to count
 * 
 * @example
 * countUnique([1, 2, 2, 3, 1]) // Map { 1 => 2, 2 => 2, 3 => 1 }
 */
export function countUnique(arr: NumericArray): Map<number, number> {
  if (!Array.isArray(arr)) {
    throw new InvalidParameterError('arr', 'array', arr);
  }
  
  // Validate that all elements are finite numbers
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number' || !Number.isFinite(arr[i])) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', arr[i]);
    }
  }
  
  const counts = new Map<number, number>();
  
  for (const value of arr) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  
  return counts;
}

// ============================================================================
// Type Guard Functions (Re-exported from common.ts for convenience)
// ============================================================================

// Re-export type guards from common.ts for backward compatibility
export { 
  isFiniteNumber,
  isNumericArray,
  isNumericMatrix,
  isComplexNumber
} from '../types/common.js';

// Additional type guards specific to utilities
export function isShape(value: unknown): value is Shape {
  return Array.isArray(value) && 
         value.length > 0 && 
         value.every(dim => Number.isInteger(dim) && dim > 0);
}

export function isMatrixLike(value: unknown): value is MatrixLike<number> {
  return typeof value === 'object' && 
         value !== null && 
         'rows' in value && 
         'cols' in value && 
         'data' in value &&
         typeof (value as any).rows === 'number' &&
         typeof (value as any).cols === 'number' &&
         Array.isArray((value as any).data);
}

export function isArray3dLike(value: unknown): value is Array3dLike<number> {
  return typeof value === 'object' && 
         value !== null && 
         'x' in value && 
         'y' in value && 
         'z' in value &&
         'data' in value &&
         typeof (value as any).x === 'number' &&
         typeof (value as any).y === 'number' &&
         typeof (value as any).z === 'number' &&
         Array.isArray((value as any).data);
}