/**
 * Matrix and Array type definitions for Num.js TypeScript migration
 * Provides comprehensive type safety for matrix and multi-dimensional array operations
 */

import type { 
  NumericArray, 
  NumericMatrix, 
  Numeric3D, 
  Shape, 
  ComplexNumber,
  MatrixNorm,
  VectorNorm 
} from './common.js';

// ============================================================================
// Core Matrix Interfaces
// ============================================================================

/**
 * Generic matrix-like interface that can hold any type
 */
export interface MatrixLike<T = number> {
  /** Number of rows */
  readonly rows: number;
  /** Number of columns */
  readonly cols: number;
  /** Matrix data as 2D array */
  readonly data: readonly (readonly T[])[];
}

/**
 * Specific interface for numeric matrices
 */
export interface NumericMatrixLike extends MatrixLike<number> {
  readonly data: NumericMatrix;
}

/**
 * Interface for complex number matrices
 */
export interface ComplexMatrixLike extends MatrixLike<ComplexNumber> {
  readonly data: readonly (readonly ComplexNumber[])[];
}

// ============================================================================
// Matrix Operations Interface
// ============================================================================

/**
 * Interface defining all matrix operations with proper type safety
 */
export interface MatrixOperations<T = number> {
  /**
   * Add two matrices element-wise
   */
  add(other: MatrixLike<T>): MatrixLike<T>;
  
  /**
   * Subtract two matrices element-wise
   */
  subtract(other: MatrixLike<T>): MatrixLike<T>;
  
  /**
   * Multiply two matrices element-wise (Hadamard product)
   */
  multiply(other: MatrixLike<T>): MatrixLike<T>;
  
  /**
   * Matrix multiplication (dot product)
   */
  dot(other: MatrixLike<T>): MatrixLike<T>;
  
  /**
   * Transpose the matrix
   */
  transpose(): MatrixLike<T>;
  
  /**
   * Apply a function to each element
   */
  map<U>(callback: (value: T, row: number, col: number) => U): MatrixLike<U>;
  
  /**
   * Check if two matrices are equal
   */
  equals(other: MatrixLike<T>): boolean;
  
  /**
   * Get a specific element
   */
  get(row: number, col: number): T;
  
  /**
   * Set a specific element (if mutable)
   */
  set?(row: number, col: number, value: T): void;
  
  /**
   * Get a row as an array
   */
  getRow(row: number): readonly T[];
  
  /**
   * Get a column as an array
   */
  getColumn(col: number): readonly T[];
  
  /**
   * Create a copy of the matrix
   */
  clone(): MatrixLike<T>;
}

// ============================================================================
// Advanced Matrix Operations
// ============================================================================

/**
 * Interface for advanced matrix operations (linear algebra)
 */
export interface AdvancedMatrixOperations {
  /**
   * Calculate matrix determinant (square matrices only)
   */
  determinant(): number;
  
  /**
   * Calculate matrix inverse (square matrices only)
   */
  inverse(): NumericMatrixLike;
  
  /**
   * Calculate matrix rank
   */
  rank(): number;
  
  /**
   * Calculate matrix trace (sum of diagonal elements)
   */
  trace(): number;
  
  /**
   * Calculate matrix norm
   */
  norm(ord?: MatrixNorm): number;
  
  /**
   * Check if matrix is square
   */
  isSquare(): boolean;
  
  /**
   * Check if matrix is symmetric
   */
  isSymmetric(tolerance?: number): boolean;
  
  /**
   * Check if matrix is positive definite
   */
  isPositiveDefinite(): boolean;
  
  /**
   * Solve linear system Ax = b
   */
  solve(b: NumericArray): NumericArray;
}

// ============================================================================
// 3D Array Interface
// ============================================================================

/**
 * Generic 3D array interface
 */
export interface Array3dLike<T = number> {
  /** Size in X dimension */
  readonly x: number;
  /** Size in Y dimension */
  readonly y: number;
  /** Size in Z dimension */
  readonly z: number;
  /** 3D array data */
  readonly data: readonly (readonly (readonly T[])[])[];
}

/**
 * Specific interface for numeric 3D arrays
 */
export interface NumericArray3dLike extends Array3dLike<number> {
  readonly data: Numeric3D;
}

/**
 * Interface for 3D array operations
 */
export interface Array3dOperations<T = number> {
  /**
   * Add two 3D arrays element-wise
   */
  add(other: Array3dLike<T>): Array3dLike<T>;
  
  /**
   * Subtract two 3D arrays element-wise
   */
  subtract(other: Array3dLike<T>): Array3dLike<T>;
  
  /**
   * Multiply two 3D arrays element-wise
   */
  multiply(other: Array3dLike<T>): Array3dLike<T>;
  
  /**
   * Divide two 3D arrays element-wise
   */
  divide(other: Array3dLike<T>): Array3dLike<T>;
  
  /**
   * Check if two 3D arrays are equal
   */
  equals(other: Array3dLike<T>): boolean;
  
  /**
   * Get a specific element
   */
  get(x: number, y: number, z: number): T;
  
  /**
   * Set a specific element (if mutable)
   */
  set?(x: number, y: number, z: number, value: T): void;
  
  /**
   * Apply a function to each element
   */
  map<U>(callback: (value: T, x: number, y: number, z: number) => U): Array3dLike<U>;
  
  /**
   * Create a copy of the 3D array
   */
  clone(): Array3dLike<T>;
}

// ============================================================================
// Matrix Factory Interface
// ============================================================================

/**
 * Interface for matrix creation and factory methods
 */
export interface MatrixFactory {
  /**
   * Create a matrix filled with a specific value
   */
  create(rows: number, cols: number, fill?: number): NumericMatrixLike;
  
  /**
   * Create a matrix from 2D array data
   */
  fromArray(data: NumericMatrix): NumericMatrixLike;
  
  /**
   * Create an identity matrix
   */
  identity(size: number): NumericMatrixLike;
  
  /**
   * Create a matrix filled with zeros
   */
  zeros(rows: number, cols: number): NumericMatrixLike;
  
  /**
   * Create a matrix filled with ones
   */
  ones(rows: number, cols: number): NumericMatrixLike;
  
  /**
   * Create a diagonal matrix from an array
   */
  diagonal(values: NumericArray): NumericMatrixLike;
  
  /**
   * Create a random matrix
   */
  random(rows: number, cols: number, min?: number, max?: number): NumericMatrixLike;
}

/**
 * Interface for 3D array creation and factory methods
 */
export interface Array3dFactory {
  /**
   * Create a 3D array filled with a specific value
   */
  create(x: number, y: number, z: number, fill?: number): NumericArray3dLike;
  
  /**
   * Create a 3D array from 3D array data
   */
  fromArray(data: Numeric3D): NumericArray3dLike;
  
  /**
   * Create a 3D array filled with zeros
   */
  zeros(x: number, y: number, z: number): NumericArray3dLike;
  
  /**
   * Create a 3D array filled with ones
   */
  ones(x: number, y: number, z: number): NumericArray3dLike;
  
  /**
   * Create a random 3D array
   */
  random(x: number, y: number, z: number, min?: number, max?: number): NumericArray3dLike;
}

// ============================================================================
// Matrix Decomposition Result Types
// ============================================================================

/**
 * Result of QR decomposition
 */
export interface QRDecompositionResult {
  /** Orthogonal matrix Q */
  readonly Q: NumericMatrixLike;
  /** Upper triangular matrix R */
  readonly R: NumericMatrixLike;
}

/**
 * Result of SVD decomposition
 */
export interface SVDDecompositionResult {
  /** Left singular vectors U */
  readonly U: NumericMatrixLike;
  /** Singular values (diagonal of S) */
  readonly S: NumericArray;
  /** Right singular vectors V^T */
  readonly Vt: NumericMatrixLike;
}

/**
 * Result of eigenvalue decomposition
 */
export interface EigenDecompositionResult {
  /** Eigenvalues */
  readonly eigenvalues: NumericArray;
  /** Eigenvectors (columns are eigenvectors) */
  readonly eigenvectors: NumericMatrixLike;
}

/**
 * Result of LU decomposition
 */
export interface LUDecompositionResult {
  /** Lower triangular matrix L */
  readonly L: NumericMatrixLike;
  /** Upper triangular matrix U */
  readonly U: NumericMatrixLike;
  /** Permutation matrix P (as array of row indices) */
  readonly P: NumericArray;
}

/**
 * Result of Cholesky decomposition
 */
export interface CholeskyDecompositionResult {
  /** Lower triangular matrix L such that A = L * L^T */
  readonly L: NumericMatrixLike;
}

// ============================================================================
// Utility Types for Matrix Operations
// ============================================================================

/**
 * Options for matrix operations
 */
export interface MatrixOperationOptions {
  /** Tolerance for numerical comparisons */
  readonly tolerance?: number;
  /** Whether to check for numerical stability */
  readonly checkStability?: boolean;
  /** Maximum number of iterations for iterative methods */
  readonly maxIterations?: number;
}

/**
 * Options for matrix decomposition
 */
export interface DecompositionOptions extends MatrixOperationOptions {
  /** Whether to compute full matrices or economy-size */
  readonly full?: boolean;
  /** Whether to compute left/right vectors */
  readonly computeVectors?: boolean;
}

/**
 * Matrix slice specification
 */
export interface MatrixSlice {
  /** Row range [start, end) */
  readonly rows?: [number, number];
  /** Column range [start, end) */
  readonly cols?: [number, number];
}

// ============================================================================
// Type Guards and Validation Functions
// ============================================================================

/**
 * Type guard for matrix-like objects
 */
export function isMatrixLike<T>(value: unknown): value is MatrixLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'rows' in value &&
    'cols' in value &&
    'data' in value &&
    typeof (value as any).rows === 'number' &&
    typeof (value as any).cols === 'number' &&
    Array.isArray((value as any).data)
  );
}

/**
 * Type guard for numeric matrix-like objects
 */
export function isNumericMatrixLike(value: unknown): value is NumericMatrixLike {
  if (!isMatrixLike<number>(value)) return false;
  
  const matrix = value as MatrixLike<number>;
  return matrix.data.every(row => 
    Array.isArray(row) && 
    row.length === matrix.cols &&
    row.every(val => typeof val === 'number' && Number.isFinite(val))
  );
}

/**
 * Type guard for 3D array-like objects
 */
export function isArray3dLike<T>(value: unknown): value is Array3dLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'z' in value &&
    'data' in value &&
    typeof (value as any).x === 'number' &&
    typeof (value as any).y === 'number' &&
    typeof (value as any).z === 'number' &&
    Array.isArray((value as any).data)
  );
}

/**
 * Validate matrix dimensions for operations
 */
export function validateMatrixDimensions(
  a: MatrixLike<any>, 
  b: MatrixLike<any>, 
  operation: string
): void {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error(
      `Matrix dimensions incompatible for ${operation}: ` +
      `[${a.rows}, ${a.cols}] vs [${b.rows}, ${b.cols}]`
    );
  }
}

/**
 * Validate matrix multiplication dimensions
 */
export function validateMatrixMultiplication(
  a: MatrixLike<any>, 
  b: MatrixLike<any>
): void {
  if (a.cols !== b.rows) {
    throw new Error(
      `Matrix multiplication dimensions incompatible: ` +
      `[${a.rows}, ${a.cols}] × [${b.rows}, ${b.cols}]`
    );
  }
}

/**
 * Check if matrix is square
 */
export function isSquareMatrix(matrix: MatrixLike<any>): boolean {
  return matrix.rows === matrix.cols;
}

/**
 * Get matrix shape as tuple
 */
export function getMatrixShape(matrix: MatrixLike<any>): [number, number] {
  return [matrix.rows, matrix.cols];
}

/**
 * Get 3D array shape as tuple
 */
export function getArray3dShape(array: Array3dLike<any>): [number, number, number] {
  return [array.x, array.y, array.z];
}

// All types are already exported above with their definitions