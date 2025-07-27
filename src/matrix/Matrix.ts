/**
 * Type-safe Matrix class for Num.js TypeScript migration
 * Provides comprehensive matrix operations with proper type safety and validation
 */

import type { 
  NumericMatrix, 
  NumericArray,
  Shape 
} from '../types/common.js';
import type { 
  MatrixLike, 
  NumericMatrixLike, 
  MatrixOperations, 
  AdvancedMatrixOperations,
  MatrixFactory 
} from '../types/matrix.js';
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
// Type-safe bounds checking utilities
// ============================================================================

/**
 * Asserts that a matrix row index is valid and narrows the type
 * @param matrix - The matrix data array
 * @param row - Row index to validate
 * @param paramName - Parameter name for error messages
 * @returns The validated row array (type-narrowed)
 */
function assertValidRow<T>(matrix: readonly (readonly T[])[], row: number, paramName: string = 'row'): readonly T[] {
  if (!Number.isInteger(row) || row < 0 || row >= matrix.length) {
    throw new InvalidParameterError(
      paramName, 
      `integer between 0 and ${matrix.length - 1}`, 
      row
    );
  }
  
  const matrixRow = matrix[row];
  if (matrixRow === undefined) {
    // This should never happen after the bounds check, but TypeScript needs this
    throw new InvalidParameterError(paramName, 'valid row index', row);
  }
  
  return matrixRow;
}

/**
 * Asserts that a matrix row index is valid and returns a mutable row reference
 * @param matrix - The mutable matrix data array
 * @param row - Row index to validate
 * @param paramName - Parameter name for error messages
 * @returns The validated mutable row array (type-narrowed)
 */
function assertValidMutableRow<T>(matrix: T[][], row: number, paramName: string = 'row'): T[] {
  if (!Number.isInteger(row) || row < 0 || row >= matrix.length) {
    throw new InvalidParameterError(
      paramName, 
      `integer between 0 and ${matrix.length - 1}`, 
      row
    );
  }
  
  const matrixRow = matrix[row];
  if (matrixRow === undefined) {
    // This should never happen after the bounds check, but TypeScript needs this
    throw new InvalidParameterError(paramName, 'valid row index', row);
  }
  
  return matrixRow;
}

/**
 * Asserts that a matrix element index is valid and returns the element (type-narrowed)
 * @param matrix - The matrix data array
 * @param row - Row index
 * @param col - Column index
 * @returns The validated element (type-narrowed)
 */
function assertValidElement<T>(matrix: readonly (readonly T[])[], row: number, col: number): T {
  const matrixRow = assertValidRow(matrix, row, 'row');
  
  if (!Number.isInteger(col) || col < 0 || col >= matrixRow.length) {
    throw new InvalidParameterError(
      'col', 
      `integer between 0 and ${matrixRow.length - 1}`, 
      col
    );
  }
  
  const element = matrixRow[col];
  if (element === undefined) {
    // This should never happen after the bounds check, but TypeScript needs this
    throw new InvalidParameterError('col', 'valid column index', col);
  }
  
  return element;
}

/**
 * Asserts that an array index is valid and returns the element (type-narrowed)
 * @param array - The array to access
 * @param index - Index to validate
 * @param paramName - Parameter name for error messages
 * @returns The validated element (type-narrowed)
 */
function assertValidArrayElement<T>(array: readonly T[], index: number, paramName: string = 'index'): T {
  if (!Number.isInteger(index) || index < 0 || index >= array.length) {
    throw new InvalidParameterError(
      paramName, 
      `integer between 0 and ${array.length - 1}`, 
      index
    );
  }
  
  const element = array[index];
  if (element === undefined) {
    // This should never happen after the bounds check, but TypeScript needs this
    throw new InvalidParameterError(paramName, 'valid array index', index);
  }
  
  return element;
}

/**
 * Type-safe Matrix class implementing comprehensive matrix operations
 */
export class Matrix implements NumericMatrixLike, MatrixOperations<number>, AdvancedMatrixOperations {
  private readonly _data: NumericMatrix;
  private readonly _rows: number;
  private readonly _cols: number;

  /**
   * Create a new Matrix instance
   * @param data - 2D array of numbers representing the matrix
   */
  constructor(data: NumericMatrix) {
    validateNumericMatrix(data, 'data');
    
    // Deep clone the data to ensure immutability
    this._data = data.map(row => [...row]);
    this._rows = data.length;
    
    // Use type-safe access to get column count
    const firstRow = assertValidRow(data, 0, 'data[0]');
    this._cols = firstRow.length;
  }

  // ============================================================================
  // Properties
  // ============================================================================

  /** Number of rows in the matrix */
  get rows(): number {
    return this._rows;
  }

  /** Number of columns in the matrix */
  get cols(): number {
    return this._cols;
  }

  /** Matrix data as readonly 2D array */
  get data(): NumericMatrix {
    return this._data.map(row => [...row]); // Return a copy to maintain immutability
  }

  /** Get matrix shape as [rows, cols] */
  get shape(): [number, number] {
    return [this._rows, this._cols];
  }

  /** Total number of elements in the matrix */
  get size(): number {
    return this._rows * this._cols;
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a matrix filled with a specific value
   * @param rows - Number of rows
   * @param cols - Number of columns  
   * @param fill - Value to fill the matrix with (default: 0)
   * @returns New Matrix instance
   */
  static create(rows: number, cols: number, fill: number = 0): Matrix {
    validatePositiveInteger(rows, 'rows');
    validatePositiveInteger(cols, 'cols');
    validateFiniteNumber(fill, 'fill');

    const data = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => fill)
    );
    
    return new Matrix(data);
  }

  /**
   * Create a matrix from a 2D array
   * @param data - 2D array of numbers
   * @returns New Matrix instance
   */
  static fromArray(data: NumericMatrix): Matrix {
    return new Matrix(data);
  }

  /**
   * Create an identity matrix
   * @param size - Size of the square identity matrix
   * @returns New identity Matrix instance
   */
  static identity(size: number): Matrix {
    validatePositiveInteger(size, 'size');
    
    const data = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => i === j ? 1 : 0)
    );
    
    return new Matrix(data);
  }

  /**
   * Create a matrix filled with zeros
   * @param rows - Number of rows
   * @param cols - Number of columns
   * @returns New zero Matrix instance
   */
  static zeros(rows: number, cols: number): Matrix {
    return Matrix.create(rows, cols, 0);
  }

  /**
   * Create a matrix filled with ones
   * @param rows - Number of rows
   * @param cols - Number of columns
   * @returns New ones Matrix instance
   */
  static ones(rows: number, cols: number): Matrix {
    return Matrix.create(rows, cols, 1);
  }

  /**
   * Create a diagonal matrix from an array
   * @param values - Array of diagonal values
   * @returns New diagonal Matrix instance
   */
  static diagonal(values: NumericArray): Matrix {
    if (values.length === 0) {
      throw new InvalidParameterError('values', 'non-empty array', values);
    }

    const size = values.length;
    const data = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        if (i === j) {
          return assertValidArrayElement(values, i, `values[${i}]`);
        }
        return 0;
      })
    );
    
    return new Matrix(data);
  }

  /**
   * Create a random matrix
   * @param rows - Number of rows
   * @param cols - Number of columns
   * @param min - Minimum random value (default: 0)
   * @param max - Maximum random value (default: 1)
   * @returns New random Matrix instance
   */
  static random(rows: number, cols: number, min: number = 0, max: number = 1): Matrix {
    validatePositiveInteger(rows, 'rows');
    validatePositiveInteger(cols, 'cols');
    validateFiniteNumber(min, 'min');
    validateFiniteNumber(max, 'max');
    
    if (min >= max) {
      throw new InvalidParameterError('min', 'less than max', min);
    }

    const data = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * (max - min) + min)
    );
    
    return new Matrix(data);
  }

  // ============================================================================
  // Element Access Methods
  // ============================================================================

  /**
   * Get a specific element
   * @param row - Row index (0-based)
   * @param col - Column index (0-based)
   * @returns Element value
   */
  get(row: number, col: number): number {
    return assertValidElement(this._data, row, col);
  }

  /**
   * Get a row as an array
   * @param row - Row index (0-based)
   * @returns Copy of the row as an array
   */
  getRow(row: number): NumericArray {
    const matrixRow = assertValidRow(this._data, row);
    return [...matrixRow];
  }

  /**
   * Get a column as an array
   * @param col - Column index (0-based)
   * @returns Column as an array
   */
  getColumn(col: number): NumericArray {
    // Validate column index against first row
    const firstRow = assertValidRow(this._data, 0);
    if (col < 0 || col >= firstRow.length) {
      throw new InvalidParameterError('col', `integer between 0 and ${firstRow.length - 1}`, col);
    }
    
    const column: NumericArray = [];
    for (let i = 0; i < this._rows; i++) {
      column.push(assertValidElement(this._data, i, col));
    }
    return column;
  }

  // ============================================================================
  // Basic Matrix Operations
  // ============================================================================

  /**
   * Add two matrices element-wise
   * @param other - Matrix to add
   * @returns New Matrix with the result
   */
  add(other: Matrix): Matrix {
    validateSameDimensions(this, other, 'addition');
    
    const result: NumericMatrix = [];
    for (let i = 0; i < this._rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < this._cols; j++) {
        const thisElement = assertValidElement(this._data, i, j);
        const otherElement = assertValidElement(other._data, i, j);
        row.push(thisElement + otherElement);
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Subtract two matrices element-wise
   * @param other - Matrix to subtract
   * @returns New Matrix with the result
   */
  subtract(other: Matrix): Matrix {
    validateSameDimensions(this, other, 'subtraction');
    
    const result: NumericMatrix = [];
    for (let i = 0; i < this._rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < this._cols; j++) {
        const thisElement = assertValidElement(this._data, i, j);
        const otherElement = assertValidElement(other._data, i, j);
        row.push(thisElement - otherElement);
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Multiply two matrices element-wise (Hadamard product)
   * @param other - Matrix to multiply element-wise
   * @returns New Matrix with the result
   */
  multiply(other: Matrix): Matrix {
    validateSameDimensions(this, other, 'element-wise multiplication');
    
    const result: NumericMatrix = [];
    for (let i = 0; i < this._rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < this._cols; j++) {
        const thisElement = assertValidElement(this._data, i, j);
        const otherElement = assertValidElement(other._data, i, j);
        row.push(thisElement * otherElement);
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Multiply matrix by a scalar
   * @param scalar - Scalar value to multiply by
   * @returns New Matrix with the result
   */
  multiplyScalar(scalar: number): Matrix {
    validateFiniteNumber(scalar, 'scalar');
    
    const result: NumericMatrix = [];
    for (let i = 0; i < this._rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < this._cols; j++) {
        const element = assertValidElement(this._data, i, j);
        row.push(element * scalar);
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Matrix multiplication (dot product) - FIXED VERSION
   * @param other - Matrix to multiply with
   * @returns New Matrix with the result
   */
  dot(other: Matrix): Matrix {
    validateMatrixMultiplication(this, other);
    
    const result: NumericMatrix = [];
    for (let i = 0; i < this._rows; i++) {
      const row: NumericArray = [];
      for (let j = 0; j < other._cols; j++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          const thisElement = assertValidElement(this._data, i, k);
          const otherElement = assertValidElement(other._data, k, j);
          sum += thisElement * otherElement;
        }
        row.push(sum);
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Transpose the matrix
   * @returns New transposed Matrix
   */
  transpose(): Matrix {
    const result: NumericMatrix = [];
    for (let j = 0; j < this._cols; j++) {
      const row: NumericArray = [];
      for (let i = 0; i < this._rows; i++) {
        row.push(assertValidElement(this._data, i, j));
      }
      result.push(row);
    }
    
    return new Matrix(result);
  }

  /**
   * Apply a function to each element
   * @param callback - Function to apply to each element
   * @returns New Matrix with transformed elements
   */
  map<U>(callback: (value: number, row: number, col: number) => U): MatrixLike<U> {
    const result: U[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: U[] = [];
      for (let j = 0; j < this._cols; j++) {
        const element = assertValidElement(this._data, i, j);
        row.push(callback(element, i, j));
      }
      result.push(row);
    }
    
    return {
      rows: this._rows,
      cols: this._cols,
      data: result
    };
  }

  /**
   * Check if two matrices are equal
   * @param other - Matrix to compare with
   * @returns True if matrices are equal
   */
  equals(other: Matrix): boolean {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      return false;
    }
    
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        const thisElement = assertValidElement(this._data, i, j);
        const otherElement = assertValidElement(other._data, i, j);
        if (thisElement !== otherElement) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Create a copy of the matrix
   * @returns New Matrix instance with copied data
   */
  clone(): Matrix {
    return new Matrix(this._data);
  }

  // ============================================================================
  // Advanced Matrix Operations
  // ============================================================================

  /**
   * Calculate matrix determinant (square matrices only)
   * @returns Determinant value
   */
  determinant(): number {
    validateSquareMatrix(this, 'determinant');
    
    if (this._rows === 1) {
      return assertValidElement(this._data, 0, 0);
    }
    
    if (this._rows === 2) {
      const a = assertValidElement(this._data, 0, 0);
      const b = assertValidElement(this._data, 0, 1);
      const c = assertValidElement(this._data, 1, 0);
      const d = assertValidElement(this._data, 1, 1);
      return a * d - b * c;
    }
    
    // Use LU decomposition for larger matrices
    const { L, U, P } = this._luDecomposition();
    
    // Calculate determinant as product of diagonal elements of U
    // multiplied by determinant of permutation matrix P
    let det = 1;
    for (let i = 0; i < this._rows; i++) {
      det *= assertValidElement(U._data, i, i);
    }
    
    // Account for permutation matrix (count swaps)
    let swaps = 0;
    for (let i = 0; i < P.length; i++) {
      const pElement = assertValidArrayElement(P, i, `P[${i}]`);
      if (pElement !== i) swaps++;
    }
    
    return swaps % 2 === 0 ? det : -det;
  }

  /**
   * Calculate matrix inverse (square matrices only)
   * @returns Inverse Matrix
   */
  inverse(): Matrix {
    validateSquareMatrix(this, 'inverse');
    
    const det = this.determinant();
    if (Math.abs(det) < Number.EPSILON) {
      throw new SingularMatrixError(this.shape);
    }
    
    if (this._rows === 1) {
      const element = assertValidElement(this._data, 0, 0);
      return new Matrix([[1 / element]]);
    }
    
    if (this._rows === 2) {
      const a = assertValidElement(this._data, 0, 0);
      const b = assertValidElement(this._data, 0, 1);
      const c = assertValidElement(this._data, 1, 0);
      const d = assertValidElement(this._data, 1, 1);
      
      return new Matrix([
        [d / det, -b / det],
        [-c / det, a / det]
      ]);
    }
    
    // Use Gauss-Jordan elimination for larger matrices
    return this._gaussJordanInverse();
  }

  /**
   * Calculate matrix rank
   * @returns Matrix rank
   */
  rank(): number {
    const rref = this._reducedRowEchelonForm();
    let rank = 0;
    
    for (let i = 0; i < rref._rows; i++) {
      let hasNonZero = false;
      for (let j = 0; j < rref._cols; j++) {
        const element = assertValidElement(rref._data, i, j);
        if (Math.abs(element) > Number.EPSILON) {
          hasNonZero = true;
          break;
        }
      }
      if (hasNonZero) rank++;
    }
    
    return rank;
  }

  /**
   * Calculate matrix trace (sum of diagonal elements)
   * @returns Trace value
   */
  trace(): number {
    validateSquareMatrix(this, 'trace');
    
    let trace = 0;
    for (let i = 0; i < this._rows; i++) {
      trace += assertValidElement(this._data, i, i);
    }
    
    return trace;
  }

  /**
   * Calculate matrix norm
   * @param ord - Norm order ('fro' for Frobenius, 1, 2, etc.)
   * @returns Norm value
   */
  norm(ord: 'fro' | number = 'fro'): number {
    if (ord === 'fro') {
      // Frobenius norm
      let sum = 0;
      for (let i = 0; i < this._rows; i++) {
        for (let j = 0; j < this._cols; j++) {
          const element = assertValidElement(this._data, i, j);
          sum += element ** 2;
        }
      }
      return Math.sqrt(sum);
    }
    
    if (ord === 1) {
      // Maximum column sum
      let max = 0;
      for (let j = 0; j < this._cols; j++) {
        let sum = 0;
        for (let i = 0; i < this._rows; i++) {
          const element = assertValidElement(this._data, i, j);
          sum += Math.abs(element);
        }
        max = Math.max(max, sum);
      }
      return max;
    }
    
    if (ord === Infinity) {
      // Maximum row sum
      let max = 0;
      for (let i = 0; i < this._rows; i++) {
        let sum = 0;
        for (let j = 0; j < this._cols; j++) {
          const element = assertValidElement(this._data, i, j);
          sum += Math.abs(element);
        }
        max = Math.max(max, sum);
      }
      return max;
    }
    
    throw new InvalidParameterError('ord', 'supported norm type', ord);
  }

  /**
   * Check if matrix is square
   * @returns True if matrix is square
   */
  isSquare(): boolean {
    return this._rows === this._cols;
  }

  /**
   * Check if matrix is symmetric
   * @param tolerance - Numerical tolerance for comparison
   * @returns True if matrix is symmetric
   */
  isSymmetric(tolerance: number = Number.EPSILON): boolean {
    if (!this.isSquare()) return false;
    
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        const element1 = assertValidElement(this._data, i, j);
        const element2 = assertValidElement(this._data, j, i);
        if (Math.abs(element1 - element2) > tolerance) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Check if matrix is positive definite
   * @returns True if matrix is positive definite
   */
  isPositiveDefinite(): boolean {
    if (!this.isSquare() || !this.isSymmetric()) return false;
    
    try {
      // Try Cholesky decomposition - if it succeeds, matrix is positive definite
      this._choleskyDecomposition();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Solve linear system Ax = b
   * @param b - Right-hand side vector
   * @returns Solution vector x
   */
  solve(b: NumericArray): NumericArray {
    validateSquareMatrix(this, 'solve');
    
    if (b.length !== this._rows) {
      throw new DimensionError(
        'Vector b must have same length as matrix rows',
        [this._rows],
        [b.length],
        'solve'
      );
    }
    
    // Use LU decomposition to solve
    const { L, U, P } = this._luDecomposition();
    
    // Apply permutation to b
    const pb: NumericArray = [];
    for (let i = 0; i < P.length; i++) {
      const pIndex = assertValidArrayElement(P, i, `P[${i}]`);
      const bElement = assertValidArrayElement(b, pIndex, `b[${pIndex}]`);
      pb.push(bElement);
    }
    
    // Forward substitution: Ly = Pb
    const y: NumericArray = new Array(this._rows);
    for (let i = 0; i < this._rows; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        const lElement = assertValidElement(L._data, i, j);
        const yElement = assertValidArrayElement(y, j, `y[${j}]`);
        sum += lElement * yElement;
      }
      const pbElement = assertValidArrayElement(pb, i, `pb[${i}]`);
      const lDiagonal = assertValidElement(L._data, i, i);
      y[i] = (pbElement - sum) / lDiagonal;
    }
    
    // Back substitution: Ux = y
    const x: NumericArray = new Array(this._rows);
    for (let i = this._rows - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < this._rows; j++) {
        const uElement = assertValidElement(U._data, i, j);
        const xElement = assertValidArrayElement(x, j, `x[${j}]`);
        sum += uElement * xElement;
      }
      const yElement = assertValidArrayElement(y, i, `y[${i}]`);
      const uDiagonal = assertValidElement(U._data, i, i);
      x[i] = (yElement - sum) / uDiagonal;
    }
    
    return x;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * LU decomposition with partial pivoting
   * @returns Object containing L, U matrices and permutation array P
   */
  private _luDecomposition(): { L: Matrix; U: Matrix; P: number[] } {
    const n = this._rows;
    const L = Matrix.identity(n);
    const U = this.clone();
    const P: number[] = Array.from({ length: n }, (_, i) => i);
    
    for (let k = 0; k < n - 1; k++) {
      // Find pivot
      let maxRow = k;
      for (let i = k + 1; i < n; i++) {
        const currentElement = Math.abs(assertValidElement(U._data, i, k));
        const maxElement = Math.abs(assertValidElement(U._data, maxRow, k));
        if (currentElement > maxElement) {
          maxRow = i;
        }
      }
      
      // Swap rows if needed
      if (maxRow !== k) {
        // Swap U rows
        const tempURow = assertValidRow(U._data, k);
        const maxURow = assertValidRow(U._data, maxRow);
        U._data[k] = [...maxURow];
        U._data[maxRow] = [...tempURow];
        
        // Swap P elements
        const tempP = assertValidArrayElement(P, k, `P[${k}]`);
        const maxP = assertValidArrayElement(P, maxRow, `P[${maxRow}]`);
        P[k] = maxP;
        P[maxRow] = tempP;
        
        // Swap corresponding rows in L (only lower part)
        for (let j = 0; j < k; j++) {
          const tempL = assertValidElement(L._data, k, j);
          const maxL = assertValidElement(L._data, maxRow, j);
          const kRow = assertValidMutableRow(L._data, k);
          const maxRowData = assertValidMutableRow(L._data, maxRow);
          kRow[j] = maxL;
          maxRowData[j] = tempL;
        }
      }
      
      // Check for singular matrix
      const pivot = assertValidElement(U._data, k, k);
      if (Math.abs(pivot) < Number.EPSILON) {
        throw new SingularMatrixError(this.shape);
      }
      
      // Eliminate column
      for (let i = k + 1; i < n; i++) {
        const uElement = assertValidElement(U._data, i, k);
        const factor = uElement / pivot;
        const lRow = assertValidMutableRow(L._data, i);
        lRow[k] = factor;
        
        const uRow = assertValidMutableRow(U._data, i);
        for (let j = k; j < n; j++) {
          const uij = assertValidElement(U._data, i, j);
          const ukj = assertValidElement(U._data, k, j);
          uRow[j] = uij - factor * ukj;
        }
      }
    }
    
    return { L, U, P };
  }

  /**
   * Gauss-Jordan elimination for matrix inverse
   * @returns Inverse matrix
   */
  private _gaussJordanInverse(): Matrix {
    const n = this._rows;
    const augmented: number[][] = [];
    
    // Create augmented matrix [A | I]
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      const matrixRow = assertValidRow(this._data, i);
      
      // Add original matrix elements
      for (let j = 0; j < n; j++) {
        row.push(assertValidArrayElement(matrixRow, j, `matrix[${i}][${j}]`));
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
        const currentRow = assertValidArrayElement(augmented, k, `augmented[${k}]`);
        const maxRowData = assertValidArrayElement(augmented, maxRow, `augmented[${maxRow}]`);
        const currentValue = assertValidArrayElement(currentRow, i, `augmented[${k}][${i}]`);
        const maxValue = assertValidArrayElement(maxRowData, i, `augmented[${maxRow}][${i}]`);
        
        if (Math.abs(currentValue) > Math.abs(maxValue)) {
          maxRow = k;
        }
      }
      
      // Swap rows
      const tempRow = assertValidArrayElement(augmented, i, `augmented[${i}]`);
      const maxRowData = assertValidArrayElement(augmented, maxRow, `augmented[${maxRow}]`);
      augmented[i] = [...maxRowData];
      augmented[maxRow] = [...tempRow];
      
      // Check for singular matrix
      const currentRow = assertValidArrayElement(augmented, i, `augmented[${i}]`);
      const pivot = assertValidArrayElement(currentRow, i, `augmented[${i}][${i}]`);
      if (Math.abs(pivot) < Number.EPSILON) {
        throw new SingularMatrixError(this.shape);
      }
      
      // Scale pivot row
      for (let j = 0; j < 2 * n; j++) {
        const element = assertValidArrayElement(currentRow, j, `augmented[${i}][${j}]`);
        currentRow[j] = element / pivot;
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const targetRow = assertValidArrayElement(augmented, k, `augmented[${k}]`);
          const factor = assertValidArrayElement(targetRow, i, `augmented[${k}][${i}]`);
          
          for (let j = 0; j < 2 * n; j++) {
            const targetElement = assertValidArrayElement(targetRow, j, `augmented[${k}][${j}]`);
            const pivotElement = assertValidArrayElement(currentRow, j, `augmented[${i}][${j}]`);
            targetRow[j] = targetElement - factor * pivotElement;
          }
        }
      }
    }
    
    // Extract inverse matrix from right half
    const inverse: NumericMatrix = [];
    for (let i = 0; i < n; i++) {
      const row: NumericArray = [];
      const augmentedRow = assertValidArrayElement(augmented, i, `augmented[${i}]`);
      
      for (let j = n; j < 2 * n; j++) {
        const element = assertValidArrayElement(augmentedRow, j, `augmented[${i}][${j}]`);
        row.push(element);
      }
      inverse.push(row);
    }
    
    return new Matrix(inverse);
  }

  /**
   * Reduced row echelon form
   * @returns Matrix in reduced row echelon form
   */
  private _reducedRowEchelonForm(): Matrix {
    const result = this.clone();
    const rows = result._rows;
    const cols = result._cols;
    
    let lead = 0;
    for (let r = 0; r < rows; r++) {
      if (lead >= cols) break;
      
      let i = r;
      while (Math.abs(assertValidElement(result._data, i, lead)) < Number.EPSILON) {
        i++;
        if (i === rows) {
          i = r;
          lead++;
          if (lead === cols) return result;
        }
      }
      
      // Swap rows
      const tempRow = assertValidRow(result._data, i);
      const targetRow = assertValidRow(result._data, r);
      result._data[i] = [...targetRow];
      result._data[r] = [...tempRow];
      
      // Scale pivot row
      const pivot = assertValidElement(result._data, r, lead);
      const pivotRow = assertValidMutableRow(result._data, r);
      for (let j = 0; j < cols; j++) {
        const element = assertValidElement(result._data, r, j);
        pivotRow[j] = element / pivot;
      }
      
      // Eliminate column
      for (let i = 0; i < rows; i++) {
        if (i !== r) {
          const factor = assertValidElement(result._data, i, lead);
          const targetRow = assertValidMutableRow(result._data, i);
          for (let j = 0; j < cols; j++) {
            const targetElement = assertValidElement(result._data, i, j);
            const pivotElement = assertValidElement(result._data, r, j);
            targetRow[j] = targetElement - factor * pivotElement;
          }
        }
      }
      
      lead++;
    }
    
    return result;
  }

  /**
   * Cholesky decomposition (for positive definite matrices)
   * @returns Lower triangular matrix L such that A = L * L^T
   */
  private _choleskyDecomposition(): Matrix {
    validateSquareMatrix(this, 'cholesky');
    
    const n = this._rows;
    const L = Matrix.zeros(n, n);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        if (i === j) {
          // Diagonal elements
          let sum = 0;
          for (let k = 0; k < j; k++) {
            const lElement = assertValidElement(L._data, j, k);
            sum += lElement ** 2;
          }
          const diagonal = assertValidElement(this._data, j, j);
          const val = diagonal - sum;
          if (val <= 0) {
            throw new MathematicalError(
              'Matrix is not positive definite',
              'cholesky_decomposition'
            );
          }
          const lRow = assertValidMutableRow(L._data, j);
          lRow[j] = Math.sqrt(val);
        } else {
          // Off-diagonal elements
          let sum = 0;
          for (let k = 0; k < j; k++) {
            const lElementI = assertValidElement(L._data, i, k);
            const lElementJ = assertValidElement(L._data, j, k);
            sum += lElementI * lElementJ;
          }
          const matrixElement = assertValidElement(this._data, i, j);
          const lDiagonal = assertValidElement(L._data, j, j);
          const lRow = assertValidMutableRow(L._data, i);
          lRow[j] = (matrixElement - sum) / lDiagonal;
        }
      }
    }
    
    return L;
  }

  // ============================================================================
  // String Representation
  // ============================================================================

  /**
   * String representation of the matrix
   * @returns String representation
   */
  toString(): string {
    // Collect all elements for max length calculation
    const flatElements: number[] = [];
    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        flatElements.push(assertValidElement(this._data, i, j));
      }
    }
    
    const maxLength = Math.max(...flatElements.map(val => val.toString().length));
    
    const rows: string[] = [];
    for (let i = 0; i < this._rows; i++) {
      const rowElements: string[] = [];
      for (let j = 0; j < this._cols; j++) {
        const element = assertValidElement(this._data, i, j);
        rowElements.push(element.toString().padStart(maxLength));
      }
      rows.push('[' + rowElements.join(', ') + ']');
    }
    
    return '[\n  ' + rows.join(',\n  ') + '\n]';
  }
}

// ============================================================================
// Static Methods for Backward Compatibility
// ============================================================================

/**
 * Static methods that maintain compatibility with the original Matrix class
 * These work with raw arrays for backward compatibility
 */
export namespace MatrixCompat {
  /**
   * Create a matrix (returns raw array for compatibility)
   */
  export function create(rows: number, cols: number, fill: number = 0): NumericMatrix {
    return Matrix.create(rows, cols, fill).data;
  }

  /**
   * Check if two matrices (raw arrays) are equal
   */
  export function equals(a: NumericMatrix, b: NumericMatrix): boolean {
    return Matrix.fromArray(a).equals(Matrix.fromArray(b));
  }

  /**
   * Add two matrices (raw arrays)
   */
  export function add(a: NumericMatrix, b: NumericMatrix): NumericMatrix {
    return Matrix.fromArray(a).add(Matrix.fromArray(b)).data;
  }

  /**
   * Subtract two matrices (raw arrays)
   */
  export function sub(a: NumericMatrix, b: NumericMatrix): NumericMatrix {
    return Matrix.fromArray(a).subtract(Matrix.fromArray(b)).data;
  }

  /**
   * Element-wise multiply two matrices (raw arrays)
   */
  export function mul(a: NumericMatrix, b: NumericMatrix): NumericMatrix {
    return Matrix.fromArray(a).multiply(Matrix.fromArray(b)).data;
  }

  /**
   * Multiply matrix by scalar (raw array)
   */
  export function mulBy(a: NumericMatrix, scalar: number): NumericMatrix {
    return Matrix.fromArray(a).multiplyScalar(scalar).data;
  }

  /**
   * Matrix multiplication - FIXED VERSION (raw arrays)
   */
  export function dot(a: NumericMatrix, b: NumericMatrix): NumericMatrix {
    return Matrix.fromArray(a).dot(Matrix.fromArray(b)).data;
  }

  /**
   * Apply function to each element (raw array)
   */
  export function map<U>(
    matrix: NumericMatrix, 
    callback: (value: number, row: number, col: number) => U
  ): U[][] {
    return Matrix.fromArray(matrix).map(callback).data as U[][];
  }
}

// Export both the class and compatibility functions
export { Matrix as default };