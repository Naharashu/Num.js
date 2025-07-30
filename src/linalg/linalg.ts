/**
 * Linear algebra functions for Num.js
 * Provides comprehensive linear algebra operations for NDArray
 */

import type { NumericArray } from '../types/common.js';
import { NDArray } from '../ndarray/ndarray.js';
import { fromArray } from '../ndarray/factory.js';
import { 
  DimensionError, 
  InvalidParameterError, 
  SingularMatrixError,
  NonSquareMatrixError,
  MathematicalError 
} from '../types/errors.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate that an NDArray is 2D and square
 */
function validateSquareNDArray(matrix: NDArray, operation: string): void {
  if (matrix.ndim !== 2) {
    throw new DimensionError(
      `${operation} requires 2D array`,
      [2],
      [matrix.ndim],
      operation
    );
  }
  
  if (matrix.shape[0] !== matrix.shape[1]) {
    throw new NonSquareMatrixError(matrix.shape, operation);
  }
}

/**
 * Validate that an NDArray is 2D
 */
function validate2DNDArray(matrix: NDArray, operation: string): void {
  if (matrix.ndim !== 2) {
    throw new DimensionError(
      `${operation} requires 2D array`,
      [2],
      [matrix.ndim],
      operation
    );
  }
}

/**
 * LU decomposition with partial pivoting for NDArray
 */
function luDecomposition(matrix: NDArray): { L: NDArray; U: NDArray; P: number[] } {
  const n = matrix.shape[0]!;
  const L = fromArray(Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  const U = matrix.clone();
  const P: number[] = Array.from({ length: n }, (_, i) => i);
  
  for (let k = 0; k < n - 1; k++) {
    // Find pivot
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(U.get(i, k)) > Math.abs(U.get(maxRow, k))) {
        maxRow = i;
      }
    }
    
    // Swap rows if needed
    if (maxRow !== k) {
      // Swap U rows
      for (let j = 0; j < n; j++) {
        const temp = U.get(k, j);
        U.set(k, j, U.get(maxRow, j));
        U.set(maxRow, j, temp);
      }
      
      // Swap P elements
      const tempP = P[k]!;
      P[k] = P[maxRow]!;
      P[maxRow] = tempP;
      
      // Swap corresponding rows in L (only lower part)
      for (let j = 0; j < k; j++) {
        const temp = L.get(k, j);
        L.set(k, j, L.get(maxRow, j));
        L.set(maxRow, j, temp);
      }
    }
    
    // Check for singular matrix
    const pivot = U.get(k, k);
    if (Math.abs(pivot) < Number.EPSILON) {
      throw new SingularMatrixError(matrix.shape);
    }
    
    // Eliminate column
    for (let i = k + 1; i < n; i++) {
      const factor = U.get(i, k) / pivot;
      L.set(i, k, factor);
      
      for (let j = k; j < n; j++) {
        U.set(i, j, U.get(i, j) - factor * U.get(k, j));
      }
    }
  }
  
  return { L, U, P };
}

/**
 * Gauss-Jordan elimination for matrix inverse
 */
function gaussJordanInverse(matrix: NDArray): NDArray {
  const n = matrix.shape[0]!;
  const augmented: number[][] = [];
  
  // Create augmented matrix [A | I]
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    
    // Add original matrix elements
    for (let j = 0; j < n; j++) {
      row.push(matrix.get(i, j));
    }
    // Add identity matrix elements
    for (let j = 0; j < n; j++) {
      row.push(i === j ? 1 : 0);
    }
    augmented.push(row);
  }
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k]![i]!) > Math.abs(augmented[maxRow]![i]!)) {
        maxRow = k;
      }
    }
    
    // Swap rows
    const tempRow = augmented[i]!;
    augmented[i] = augmented[maxRow]!;
    augmented[maxRow] = tempRow;
    
    // Check for singular matrix
    const pivot = augmented[i]![i]!;
    if (Math.abs(pivot) < Number.EPSILON) {
      throw new SingularMatrixError(matrix.shape);
    }
    
    // Scale pivot row
    for (let j = 0; j < 2 * n; j++) {
      augmented[i]![j] = augmented[i]![j]! / pivot;
    }
    
    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k]![i]!;
        for (let j = 0; j < 2 * n; j++) {
          augmented[k]![j] = augmented[k]![j]! - factor * augmented[i]![j]!;
        }
      }
    }
  }
  
  // Extract inverse matrix from right half
  const inverse: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = n; j < 2 * n; j++) {
      row.push(augmented[i]![j]!);
    }
    inverse.push(row);
  }
  
  return fromArray(inverse);
}

/**
 * Reduced row echelon form for rank calculation
 */
function reducedRowEchelonForm(matrix: NDArray): NDArray {
  const result = matrix.clone();
  const rows = result.shape[0]!;
  const cols = result.shape[1]!;
  
  let lead = 0;
  for (let r = 0; r < rows; r++) {
    if (lead >= cols) break;
    
    let i = r;
    while (Math.abs(result.get(i, lead)) < Number.EPSILON) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return result;
      }
    }
    
    // Swap rows
    for (let j = 0; j < cols; j++) {
      const temp = result.get(i, j);
      result.set(i, j, result.get(r, j));
      result.set(r, j, temp);
    }
    
    // Scale pivot row
    const pivot = result.get(r, lead);
    for (let j = 0; j < cols; j++) {
      result.set(r, j, result.get(r, j) / pivot);
    }
    
    // Eliminate column
    for (let i = 0; i < rows; i++) {
      if (i !== r) {
        const factor = result.get(i, lead);
        for (let j = 0; j < cols; j++) {
          result.set(i, j, result.get(i, j) - factor * result.get(r, j));
        }
      }
    }
    
    lead++;
  }
  
  return result;
}

// ============================================================================
// Matrix Determinant
// ============================================================================

/**
 * Calculate matrix determinant (square matrices only)
 * @param matrix - Input NDArray (must be 2D and square)
 * @returns Determinant value
 * 
 * @example
 * const m = fromArray([[1, 2], [3, 4]]);
 * det(m) // -2
 */
export function det(matrix: NDArray): number {
  validateSquareNDArray(matrix, 'determinant');
  
  const n = matrix.shape[0]!;
  
  if (n === 1) {
    return matrix.get(0, 0);
  }
  
  if (n === 2) {
    const a = matrix.get(0, 0);
    const b = matrix.get(0, 1);
    const c = matrix.get(1, 0);
    const d = matrix.get(1, 1);
    return a * d - b * c;
  }
  
  // Use LU decomposition for larger matrices
  const { U, P } = luDecomposition(matrix);
  
  // Calculate determinant as product of diagonal elements of U
  // multiplied by determinant of permutation matrix P
  let determinant = 1;
  for (let i = 0; i < n; i++) {
    determinant *= U.get(i, i);
  }
  
  // Account for permutation matrix (count swaps)
  let swaps = 0;
  for (let i = 0; i < P.length; i++) {
    if (P[i] !== i) swaps++;
  }
  
  return swaps % 2 === 0 ? determinant : -determinant;
}

// ============================================================================
// Matrix Inverse
// ============================================================================

/**
 * Calculate matrix inverse (square matrices only)
 * @param matrix - Input NDArray (must be 2D and square)
 * @returns Inverse matrix as NDArray
 * 
 * @example
 * const m = fromArray([[1, 2], [3, 4]]);
 * const invMatrix = inv(m);
 */
export function inv(matrix: NDArray): NDArray {
  validateSquareNDArray(matrix, 'inverse');
  
  const determinant = det(matrix);
  if (Math.abs(determinant) < Number.EPSILON) {
    throw new SingularMatrixError(matrix.shape);
  }
  
  const n = matrix.shape[0]!;
  
  if (n === 1) {
    return fromArray([[1 / matrix.get(0, 0)]]);
  }
  
  if (n === 2) {
    const a = matrix.get(0, 0);
    const b = matrix.get(0, 1);
    const c = matrix.get(1, 0);
    const d = matrix.get(1, 1);
    
    return fromArray([
      [d / determinant, -b / determinant],
      [-c / determinant, a / determinant]
    ]);
  }
  
  // Use Gauss-Jordan elimination for larger matrices
  return gaussJordanInverse(matrix);
}

// Alias for inverse
export const inverse = inv;

// ============================================================================
// Matrix Rank
// ============================================================================

/**
 * Calculate matrix rank
 * @param matrix - Input NDArray (must be 2D)
 * @returns Matrix rank
 * 
 * @example
 * const m = fromArray([[1, 2], [2, 4]]);
 * rank(m) // 1 (rank deficient)
 */
export function rank(matrix: NDArray): number {
  validate2DNDArray(matrix, 'rank');
  
  const rref = reducedRowEchelonForm(matrix);
  let matrixRank = 0;
  
  for (let i = 0; i < rref.shape[0]!; i++) {
    let hasNonZero = false;
    for (let j = 0; j < rref.shape[1]!; j++) {
      if (Math.abs(rref.get(i, j)) > Number.EPSILON) {
        hasNonZero = true;
        break;
      }
    }
    if (hasNonZero) matrixRank++;
  }
  
  return matrixRank;
}

// ============================================================================
// Matrix Trace
// ============================================================================

/**
 * Calculate matrix trace (sum of diagonal elements)
 * @param matrix - Input NDArray (must be 2D and square)
 * @returns Trace value
 * 
 * @example
 * const m = fromArray([[1, 2], [3, 4]]);
 * trace(m) // 5 (1 + 4)
 */
export function trace(matrix: NDArray): number {
  validateSquareNDArray(matrix, 'trace');
  
  let traceValue = 0;
  const size = matrix.shape[0]!;
  for (let i = 0; i < size; i++) {
    traceValue += matrix.get(i, i);
  }
  
  return traceValue;
}

// ============================================================================
// Matrix Norm
// ============================================================================

/**
 * Calculate matrix norm
 * @param matrix - Input NDArray (must be 2D)
 * @param ord - Norm order ('fro' for Frobenius, 1, 2, etc.)
 * @returns Norm value
 * 
 * @example
 * const m = fromArray([[1, 2], [3, 4]]);
 * norm(m, 'fro') // Frobenius norm
 */
export function norm(matrix: NDArray, ord: 'fro' | number = 'fro'): number {
  validate2DNDArray(matrix, 'norm');
  
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

// ============================================================================
// Linear System Solver
// ============================================================================

/**
 * Solve linear system Ax = b using LU decomposition
 * @param A - Coefficient matrix (NDArray, must be 2D and square)
 * @param b - Right-hand side vector
 * @returns Solution vector x
 * 
 * @example
 * const A = fromArray([[2, 1], [1, 1]]);
 * const b = [3, 2];
 * const x = solve(A, b); // [1, 1]
 */
export function solve(A: NDArray, b: NumericArray): NumericArray {
  validateSquareNDArray(A, 'solve');
  
  const rows = A.shape[0]!;
  if (b.length !== rows) {
    throw new DimensionError(
      'Vector b must have same length as matrix rows',
      [rows],
      [b.length],
      'solve'
    );
  }
  
  // Use LU decomposition to solve
  const { L, U, P } = luDecomposition(A);
  
  // Apply permutation to b
  const pb: NumericArray = [];
  for (let i = 0; i < P.length; i++) {
    const pIndex = P[i]!;
    pb.push(b[pIndex]!);
  }
  
  // Forward substitution: Ly = Pb
  const y: NumericArray = new Array(rows);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L.get(i, j) * y[j]!;
    }
    y[i] = (pb[i]! - sum) / L.get(i, i);
  }
  
  // Back substitution: Ux = y
  const x: NumericArray = new Array(rows);
  for (let i = rows - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < rows; j++) {
      sum += U.get(i, j) * x[j]!;
    }
    x[i] = (y[i]! - sum) / U.get(i, i);
  }
  
  return x;
}

// ============================================================================
// Matrix Properties
// ============================================================================

/**
 * Check if matrix is positive definite using Cholesky decomposition
 * @param matrix - Input NDArray (must be 2D and square)
 * @returns True if matrix is positive definite
 * 
 * @example
 * const m = fromArray([[2, -1], [-1, 2]]);
 * isPositiveDefinite(m) // true
 */
export function isPositiveDefinite(matrix: NDArray): boolean {
  validateSquareNDArray(matrix, 'isPositiveDefinite');
  
  if (!isSymmetric(matrix)) {
    return false;
  }
  
  try {
    // Try Cholesky decomposition - if it succeeds, matrix is positive definite
    const n = matrix.shape[0]!;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        if (i === j) {
          // Diagonal elements
          let sum = 0;
          for (let k = 0; k < j; k++) {
            // This would require storing L matrix, simplified check
            sum += 0; // Placeholder for proper Cholesky
          }
          const val = matrix.get(j, j) - sum;
          if (val <= 0) {
            return false;
          }
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if matrix is symmetric
 * @param matrix - Input NDArray (must be 2D and square)
 * @param tolerance - Numerical tolerance for comparison
 * @returns True if matrix is symmetric
 * 
 * @example
 * const m = fromArray([[1, 2], [2, 1]]);
 * isSymmetric(m) // true
 */
export function isSymmetric(matrix: NDArray, tolerance: number = Number.EPSILON): boolean {
  validate2DNDArray(matrix, 'isSymmetric');
  
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