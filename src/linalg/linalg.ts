/**
 * Linear algebra functions for Num.js
 * Provides comprehensive linear algebra operations for matrices and ndarray
 */

import type { NumericArray, NumericMatrix } from '../types/common.js';
import { Matrix } from '../matrix/Matrix.js';
import { NDArray } from '../ndarray/ndarray.js';
import { fromArray } from '../ndarray/factory.js';
import { 
  DimensionError, 
  InvalidParameterError, 
  SingularMatrixError,
  NonSquareMatrixError,
  MathematicalError 
} from '../types/errors.js';
import { 
  validateNumericMatrix, 
  validateFiniteNumber, 
  validatePositiveInteger,
  validateMatrixIndices,
  validateSameDimensions,
  validateMatrixMultiplication,
  validateSquareMatrix 
} from '../types/validation.js';

// ============================================================================
// Matrix Determinant
// ============================================================================

/**
 * Calculate matrix determinant (square matrices only)
 * @param matrix - Input matrix (Matrix or NDArray)
 * @returns Determinant value
 * 
 * @example
 * const m = new Matrix([[1, 2], [3, 4]]);
 * det(m) // -2
 */
export function det(matrix: Matrix | NDArray): number {
  if (matrix instanceof Matrix) {
    return matrix.determinant();
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Determinant requires 2D array',
        [2],
        [matrix.ndim],
        'det'
      );
    }
    
    if (matrix.shape[0] !== matrix.shape[1]) {
      throw new NonSquareMatrixError(matrix.shape, 'det');
    }
    
    // Convert NDArray to Matrix for determinant calculation
    const matrixData: NumericMatrix = [];
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        row.push(matrix.get(i, j));
      }
      matrixData.push(row);
    }
    
    const tempMatrix = new Matrix(matrixData);
    return tempMatrix.determinant();
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

// ============================================================================
// Matrix Inverse
// ============================================================================

/**
 * Calculate matrix inverse (square matrices only)
 * @param matrix - Input matrix (Matrix or NDArray)
 * @returns Inverse matrix
 * 
 * @example
 * const m = new Matrix([[1, 2], [3, 4]]);
 * const inv = inverse(m);
 */
export function inv(matrix: Matrix | NDArray): Matrix | NDArray {
  if (matrix instanceof Matrix) {
    return matrix.inverse();
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Inverse requires 2D array',
        [2],
        [matrix.ndim],
        'inv'
      );
    }
    
    if (matrix.shape[0] !== matrix.shape[1]) {
      throw new NonSquareMatrixError(matrix.shape, 'inv');
    }
    
    // Convert NDArray to Matrix for inverse calculation
    const matrixData: NumericMatrix = [];
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        row.push(matrix.get(i, j));
      }
      matrixData.push(row);
    }
    
    const tempMatrix = new Matrix(matrixData);
    const inverseMatrix = tempMatrix.inverse();
    
    // Convert back to NDArray
    return fromArray(inverseMatrix.data);
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

// Alias for inverse
export const inverse = inv;

// ============================================================================
// Matrix Rank
// ============================================================================

/**
 * Calculate matrix rank
 * @param matrix - Input matrix (Matrix or NDArray)
 * @returns Matrix rank
 * 
 * @example
 * const m = new Matrix([[1, 2], [2, 4]]);
 * rank(m) // 1 (rank deficient)
 */
export function rank(matrix: Matrix | NDArray): number {
  if (matrix instanceof Matrix) {
    return matrix.rank();
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Rank requires 2D array',
        [2],
        [matrix.ndim],
        'rank'
      );
    }
    
    // Convert NDArray to Matrix for rank calculation
    const matrixData: NumericMatrix = [];
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        row.push(matrix.get(i, j));
      }
      matrixData.push(row);
    }
    
    const tempMatrix = new Matrix(matrixData);
    return tempMatrix.rank();
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

// ============================================================================
// Matrix Trace
// ============================================================================

/**
 * Calculate matrix trace (sum of diagonal elements)
 * @param matrix - Input matrix (Matrix or NDArray)
 * @returns Trace value
 * 
 * @example
 * const m = new Matrix([[1, 2], [3, 4]]);
 * trace(m) // 5 (1 + 4)
 */
export function trace(matrix: Matrix | NDArray): number {
  if (matrix instanceof Matrix) {
    return matrix.trace();
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Trace requires 2D array',
        [2],
        [matrix.ndim],
        'trace'
      );
    }
    
    if (matrix.shape[0] !== matrix.shape[1]) {
      throw new NonSquareMatrixError(matrix.shape, 'trace');
    }
    
    let traceValue = 0;
    const size = matrix.shape[0]!;
    for (let i = 0; i < size; i++) {
      traceValue += matrix.get(i, i);
    }
    
    return traceValue;
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

// ============================================================================
// Matrix Norm
// ============================================================================

/**
 * Calculate matrix norm
 * @param matrix - Input matrix (Matrix or NDArray)
 * @param ord - Norm order ('fro' for Frobenius, 1, 2, etc.)
 * @returns Norm value
 * 
 * @example
 * const m = new Matrix([[1, 2], [3, 4]]);
 * norm(m, 'fro') // Frobenius norm
 */
export function norm(matrix: Matrix | NDArray, ord: 'fro' | number = 'fro'): number {
  if (matrix instanceof Matrix) {
    return matrix.norm(ord);
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Norm requires 2D array',
        [2],
        [matrix.ndim],
        'norm'
      );
    }
    
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    
    if (ord === 'fro') {
      // Frobenius norm
      let sum = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const element = matrix.get(i, j);
          sum += element ** 2;
        }
      }
      return Math.sqrt(sum);
    }
    
    if (ord === 1) {
      // Maximum column sum
      let max = 0;
      for (let j = 0; j < cols; j++) {
        let sum = 0;
        for (let i = 0; i < rows; i++) {
          sum += Math.abs(matrix.get(i, j));
        }
        max = Math.max(max, sum);
      }
      return max;
    }
    
    if (ord === Infinity) {
      // Maximum row sum
      let max = 0;
      for (let i = 0; i < rows; i++) {
        let sum = 0;
        for (let j = 0; j < cols; j++) {
          sum += Math.abs(matrix.get(i, j));
        }
        max = Math.max(max, sum);
      }
      return max;
    }
    
    throw new InvalidParameterError('ord', 'supported norm type', ord);
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

// ============================================================================
// Linear System Solver
// ============================================================================

/**
 * Solve linear system Ax = b
 * @param A - Coefficient matrix (Matrix or NDArray)
 * @param b - Right-hand side vector
 * @returns Solution vector x
 * 
 * @example
 * const A = new Matrix([[2, 1], [1, 1]]);
 * const b = [3, 2];
 * const x = solve(A, b); // [1, 1]
 */
export function solve(A: Matrix | NDArray, b: NumericArray): NumericArray {
  if (A instanceof Matrix) {
    return A.solve(b);
  }
  
  if (A instanceof NDArray) {
    if (A.ndim !== 2) {
      throw new DimensionError(
        'Solve requires 2D array for coefficient matrix',
        [2],
        [A.ndim],
        'solve'
      );
    }
    
    if (A.shape[0] !== A.shape[1]) {
      throw new NonSquareMatrixError(A.shape, 'solve');
    }
    
    const rows = A.shape[0]!;
    if (b.length !== rows) {
      throw new DimensionError(
        'Vector b must have same length as matrix rows',
        [rows],
        [b.length],
        'solve'
      );
    }
    
    // Convert NDArray to Matrix for solve operation
    const matrixData: NumericMatrix = [];
    const cols = A.shape[1]!;
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        row.push(A.get(i, j));
      }
      matrixData.push(row);
    }
    
    const tempMatrix = new Matrix(matrixData);
    return tempMatrix.solve(b);
  }
  
  throw new InvalidParameterError('A', 'Matrix or NDArray', A);
}

// ============================================================================
// Matrix Properties
// ============================================================================

/**
 * Check if matrix is positive definite
 * @param matrix - Input matrix (Matrix or NDArray)
 * @returns True if matrix is positive definite
 * 
 * @example
 * const m = new Matrix([[2, -1], [-1, 2]]);
 * isPositiveDefinite(m) // true
 */
export function isPositiveDefinite(matrix: Matrix | NDArray): boolean {
  if (matrix instanceof Matrix) {
    return matrix.isPositiveDefinite();
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Positive definite check requires 2D array',
        [2],
        [matrix.ndim],
        'isPositiveDefinite'
      );
    }
    
    if (matrix.shape[0] !== matrix.shape[1]) {
      return false; // Non-square matrices cannot be positive definite
    }
    
    // Convert NDArray to Matrix for positive definite check
    const matrixData: NumericMatrix = [];
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    for (let i = 0; i < rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < cols; j++) {
        row.push(matrix.get(i, j));
      }
      matrixData.push(row);
    }
    
    const tempMatrix = new Matrix(matrixData);
    return tempMatrix.isPositiveDefinite();
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}

/**
 * Check if matrix is symmetric
 * @param matrix - Input matrix (Matrix or NDArray)
 * @param tolerance - Numerical tolerance for comparison
 * @returns True if matrix is symmetric
 * 
 * @example
 * const m = new Matrix([[1, 2], [2, 1]]);
 * isSymmetric(m) // true
 */
export function isSymmetric(matrix: Matrix | NDArray, tolerance: number = Number.EPSILON): boolean {
  if (matrix instanceof Matrix) {
    return matrix.isSymmetric(tolerance);
  }
  
  if (matrix instanceof NDArray) {
    if (matrix.ndim !== 2) {
      throw new DimensionError(
        'Symmetric check requires 2D array',
        [2],
        [matrix.ndim],
        'isSymmetric'
      );
    }
    
    if (matrix.shape[0] !== matrix.shape[1]) {
      return false; // Non-square matrices cannot be symmetric
    }
    
    const rows = matrix.shape[0]!;
    const cols = matrix.shape[1]!;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const element1 = matrix.get(i, j);
        const element2 = matrix.get(j, i);
        if (Math.abs(element1 - element2) > tolerance) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  throw new InvalidParameterError('matrix', 'Matrix or NDArray', matrix);
}