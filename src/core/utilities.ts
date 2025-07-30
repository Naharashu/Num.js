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

import { 
  InvalidParameterError, 
} from '../types/errors.js';
import { 
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