/**
 * Type-safe Array3d class for Num.js TypeScript migration
 * Provides comprehensive 3D array operations with proper type safety and validation
 */

import type { 
  Numeric3D, 
  NumericArray,
  Shape 
} from '../types/common.js';
import type { 
  Array3dLike, 
  NumericArray3dLike, 
  Array3dOperations, 
  Array3dFactory 
} from '../types/matrix.js';
import { 
  DimensionError, 
  InvalidParameterError, 
  EmptyArrayError 
} from '../types/errors.js';
import { 
  validateNumeric3DArray, 
  validateFiniteNumber, 
  validatePositiveInteger,
  validate3DArrayIndices,
  validateSame3DDimensions 
} from '../types/validation.js';

// ============================================================================
// Type-safe bounds checking utilities for 3D arrays
// ============================================================================

/**
 * Asserts that a 3D array plane index is valid and narrows the type
 */
function assertValidPlane<T>(array: readonly (readonly (readonly T[])[])[], x: number, paramName: string = 'x'): readonly (readonly T[])[] {
  if (!Number.isInteger(x) || x < 0 || x >= array.length) {
    throw new InvalidParameterError(
      paramName, 
      `integer between 0 and ${array.length - 1}`, 
      x
    );
  }
  
  const plane = array[x];
  if (plane === undefined) {
    throw new InvalidParameterError(paramName, 'valid plane index', x);
  }
  
  return plane;
}

/**
 * Asserts that a 3D array row index is valid and narrows the type
 */
function assertValidRow<T>(plane: readonly (readonly T[])[], y: number, paramName: string = 'y'): readonly T[] {
  if (!Number.isInteger(y) || y < 0 || y >= plane.length) {
    throw new InvalidParameterError(
      paramName, 
      `integer between 0 and ${plane.length - 1}`, 
      y
    );
  }
  
  const row = plane[y];
  if (row === undefined) {
    throw new InvalidParameterError(paramName, 'valid row index', y);
  }
  
  return row;
}

/**
 * Asserts that a 3D array element index is valid and returns the element
 */
function assertValidElement<T>(array: readonly (readonly (readonly T[])[])[], x: number, y: number, z: number): T {
  const plane = assertValidPlane(array, x, 'x');
  const row = assertValidRow(plane, y, 'y');
  
  if (!Number.isInteger(z) || z < 0 || z >= row.length) {
    throw new InvalidParameterError(
      'z', 
      `integer between 0 and ${row.length - 1}`, 
      z
    );
  }
  
  const element = row[z];
  if (element === undefined) {
    throw new InvalidParameterError('z', 'valid element index', z);
  }
  
  return element;
}

/**
 * Type-safe Array3d class implementing comprehensive 3D array operations
 */
export class Array3d implements NumericArray3dLike, Array3dOperations<number> {
  private readonly _data: Numeric3D;
  private readonly _x: number;
  private readonly _y: number;
  private readonly _z: number;

  /**
   * Create a new Array3d instance
   * @param data - 3D array of numbers representing the array
   */
  constructor(data: Numeric3D) {
    validateNumeric3DArray(data, 'data');
    
    // Deep clone the data to ensure immutability
    this._data = data.map(plane => 
      plane.map(row => [...row])
    );
    
    this._x = data.length;
    
    // Use type-safe access to get dimensions
    const firstPlane = assertValidPlane(data, 0, 'data[0]');
    this._y = firstPlane.length;
    
    const firstRow = assertValidRow(firstPlane, 0, 'data[0][0]');
    this._z = firstRow.length;
  }

  // ============================================================================
  // Properties
  // ============================================================================

  /** Size in X dimension */
  get x(): number {
    return this._x;
  }

  /** Size in Y dimension */
  get y(): number {
    return this._y;
  }

  /** Size in Z dimension */
  get z(): number {
    return this._z;
  }

  /** 3D array data as readonly array */
  get data(): Numeric3D {
    return this._data.map(plane => 
      plane.map(row => [...row])
    ); // Return a copy to maintain immutability
  }

  /** Get array shape as [x, y, z] */
  get shape(): [number, number, number] {
    return [this._x, this._y, this._z];
  }

  /** Total number of elements in the array */
  get size(): number {
    return this._x * this._y * this._z;
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a 3D array filled with a specific value
   * @param x - Size in X dimension
   * @param y - Size in Y dimension  
   * @param z - Size in Z dimension
   * @param fill - Value to fill the array with (default: 0)
   * @returns New Array3d instance
   */
  static create(x: number, y: number, z: number, fill: number = 0): Array3d {
    validatePositiveInteger(x, 'x');
    validatePositiveInteger(y, 'y');
    validatePositiveInteger(z, 'z');
    validateFiniteNumber(fill, 'fill');

    const data = Array.from({ length: x }, () =>
      Array.from({ length: y }, () => 
        Array.from({ length: z }, () => fill)
      )
    );
    
    return new Array3d(data);
  }

  /**
   * Create a 3D array from 3D array data
   * @param data - 3D array of numbers
   * @returns New Array3d instance
   */
  static fromArray(data: Numeric3D): Array3d {
    return new Array3d(data);
  }

  /**
   * Create a 3D array filled with zeros
   * @param x - Size in X dimension
   * @param y - Size in Y dimension
   * @param z - Size in Z dimension
   * @returns New zero Array3d instance
   */
  static zeros(x: number, y: number, z: number): Array3d {
    return Array3d.create(x, y, z, 0);
  }

  /**
   * Create a 3D array filled with ones
   * @param x - Size in X dimension
   * @param y - Size in Y dimension
   * @param z - Size in Z dimension
   * @returns New ones Array3d instance
   */
  static ones(x: number, y: number, z: number): Array3d {
    return Array3d.create(x, y, z, 1);
  }

  /**
   * Create a random 3D array
   * @param x - Size in X dimension
   * @param y - Size in Y dimension
   * @param z - Size in Z dimension
   * @param min - Minimum random value (default: 0)
   * @param max - Maximum random value (default: 1)
   * @returns New random Array3d instance
   */
  static random(x: number, y: number, z: number, min: number = 0, max: number = 1): Array3d {
    validatePositiveInteger(x, 'x');
    validatePositiveInteger(y, 'y');
    validatePositiveInteger(z, 'z');
    validateFiniteNumber(min, 'min');
    validateFiniteNumber(max, 'max');
    
    if (min >= max) {
      throw new InvalidParameterError('min', 'less than max', min);
    }

    const data = Array.from({ length: x }, () =>
      Array.from({ length: y }, () => 
        Array.from({ length: z }, () => Math.random() * (max - min) + min)
      )
    );
    
    return new Array3d(data);
  }

  // ============================================================================
  // Element Access Methods
  // ============================================================================

  /**
   * Get a specific element
   * @param x - X coordinate (0-based)
   * @param y - Y coordinate (0-based)
   * @param z - Z coordinate (0-based)
   * @returns Element value
   */
  get(x: number, y: number, z: number): number {
    return assertValidElement(this._data, x, y, z);
  }

  /**
   * Get a plane (2D slice) as a 2D array
   * @param x - X coordinate (0-based)
   * @returns Copy of the plane as a 2D array
   */
  getPlane(x: number): number[][] {
    const plane = assertValidPlane(this._data, x);
    return plane.map(row => [...row]);
  }

  /**
   * Get a row as an array
   * @param x - X coordinate (0-based)
   * @param y - Y coordinate (0-based)
   * @returns Copy of the row as an array
   */
  getRow(x: number, y: number): NumericArray {
    const plane = assertValidPlane(this._data, x);
    const row = assertValidRow(plane, y);
    return [...row];
  }

  // ============================================================================
  // Basic 3D Array Operations
  // ============================================================================

  /**
   * Add two 3D arrays element-wise
   * @param other - Array3d to add
   * @returns New Array3d with the result
   */
  add(other: Array3d): Array3d {
    validateSame3DDimensions(this, other, 'addition');
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const thisElement = assertValidElement(this._data, i, j, k);
          const otherElement = assertValidElement(other._data, i, j, k);
          row.push(thisElement + otherElement);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Subtract two 3D arrays element-wise
   * @param other - Array3d to subtract
   * @returns New Array3d with the result
   */
  subtract(other: Array3d): Array3d {
    validateSame3DDimensions(this, other, 'subtraction');
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const thisElement = assertValidElement(this._data, i, j, k);
          const otherElement = assertValidElement(other._data, i, j, k);
          row.push(thisElement - otherElement);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Multiply two 3D arrays element-wise
   * @param other - Array3d to multiply element-wise
   * @returns New Array3d with the result
   */
  multiply(other: Array3d): Array3d {
    validateSame3DDimensions(this, other, 'element-wise multiplication');
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const thisElement = assertValidElement(this._data, i, j, k);
          const otherElement = assertValidElement(other._data, i, j, k);
          row.push(thisElement * otherElement);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Divide two 3D arrays element-wise
   * @param other - Array3d to divide by
   * @returns New Array3d with the result
   */
  divide(other: Array3d): Array3d {
    validateSame3DDimensions(this, other, 'element-wise division');
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const thisElement = assertValidElement(this._data, i, j, k);
          const otherElement = assertValidElement(other._data, i, j, k);
          
          if (otherElement === 0) {
            throw new InvalidParameterError(
              `other[${i}][${j}][${k}]`, 
              'non-zero number', 
              otherElement,
              'Division by zero is not allowed'
            );
          }
          
          row.push(thisElement / otherElement);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Multiply 3D array by a scalar
   * @param scalar - Scalar value to multiply by
   * @returns New Array3d with the result
   */
  multiplyScalar(scalar: number): Array3d {
    validateFiniteNumber(scalar, 'scalar');
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const element = assertValidElement(this._data, i, j, k);
          row.push(element * scalar);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Divide 3D array by a scalar
   * @param scalar - Scalar value to divide by
   * @returns New Array3d with the result
   */
  divideScalar(scalar: number): Array3d {
    validateFiniteNumber(scalar, 'scalar');
    
    if (scalar === 0) {
      throw new InvalidParameterError('scalar', 'non-zero number', scalar, 'Division by zero is not allowed');
    }
    
    const result: Numeric3D = [];
    for (let i = 0; i < this._x; i++) {
      const plane: number[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: NumericArray = [];
        for (let k = 0; k < this._z; k++) {
          const element = assertValidElement(this._data, i, j, k);
          row.push(element / scalar);
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return new Array3d(result);
  }

  /**
   * Apply a function to each element
   * @param callback - Function to apply to each element
   * @returns New Array3d with transformed elements
   */
  map<U>(callback: (value: number, x: number, y: number, z: number) => U): Array3dLike<U> {
    const result: U[][][] = [];
    for (let i = 0; i < this._x; i++) {
      const plane: U[][] = [];
      for (let j = 0; j < this._y; j++) {
        const row: U[] = [];
        for (let k = 0; k < this._z; k++) {
          const element = assertValidElement(this._data, i, j, k);
          row.push(callback(element, i, j, k));
        }
        plane.push(row);
      }
      result.push(plane);
    }
    
    return {
      x: this._x,
      y: this._y,
      z: this._z,
      data: result
    };
  }

  /**
   * Check if two 3D arrays are equal
   * @param other - Array3d to compare with
   * @returns True if arrays are equal
   */
  equals(other: Array3d): boolean {
    if (this._x !== other._x || this._y !== other._y || this._z !== other._z) {
      return false;
    }
    
    for (let i = 0; i < this._x; i++) {
      for (let j = 0; j < this._y; j++) {
        for (let k = 0; k < this._z; k++) {
          const thisElement = assertValidElement(this._data, i, j, k);
          const otherElement = assertValidElement(other._data, i, j, k);
          if (thisElement !== otherElement) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  /**
   * Create a copy of the 3D array
   * @returns New Array3d instance with copied data
   */
  clone(): Array3d {
    return new Array3d(this._data);
  }

  /**
   * Convert to string representation
   * @returns String representation of the 3D array
   */
  toString(): string {
    const planes = this._data.map((plane, i) => 
      `  Plane ${i}:\n` + 
      plane.map(row => `    [${row.join(', ')}]`).join('\n')
    );
    return `Array3d(${this._x}×${this._y}×${this._z}):\n${planes.join('\n')}`;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get the sum of all elements
   * @returns Sum of all elements
   */
  sum(): number {
    let total = 0;
    for (let i = 0; i < this._x; i++) {
      for (let j = 0; j < this._y; j++) {
        for (let k = 0; k < this._z; k++) {
          total += assertValidElement(this._data, i, j, k);
        }
      }
    }
    return total;
  }

  /**
   * Get the mean of all elements
   * @returns Mean of all elements
   */
  mean(): number {
    return this.sum() / this.size;
  }

  /**
   * Get the minimum element
   * @returns Minimum element value
   */
  min(): number {
    let min = assertValidElement(this._data, 0, 0, 0);
    for (let i = 0; i < this._x; i++) {
      for (let j = 0; j < this._y; j++) {
        for (let k = 0; k < this._z; k++) {
          const element = assertValidElement(this._data, i, j, k);
          if (element < min) {
            min = element;
          }
        }
      }
    }
    return min;
  }

  /**
   * Get the maximum element
   * @returns Maximum element value
   */
  max(): number {
    let max = assertValidElement(this._data, 0, 0, 0);
    for (let i = 0; i < this._x; i++) {
      for (let j = 0; j < this._y; j++) {
        for (let k = 0; k < this._z; k++) {
          const element = assertValidElement(this._data, i, j, k);
          if (element > max) {
            max = element;
          }
        }
      }
    }
    return max;
  }
}

// ============================================================================
// Backward Compatibility Layer
// ============================================================================

/**
 * Static methods that maintain compatibility with the original Array3d class
 * These work with raw arrays for backward compatibility
 */
export namespace Array3dCompat {
  /**
   * Create a 3D array (returns raw array for compatibility)
   */
  export function create(x: number, y: number, z: number, fill: number = 0): Numeric3D {
    return Array3d.create(x, y, z, fill).data;
  }

  /**
   * Check if two 3D arrays (raw arrays) are equal - FIXED VERSION
   */
  export function equals(a: Numeric3D, b: Numeric3D): boolean {
    return Array3d.fromArray(a).equals(Array3d.fromArray(b));
  }

  /**
   * Add two 3D arrays element-wise (raw arrays) - FIXED VERSION
   */
  export function add(a: Numeric3D, b: Numeric3D): Numeric3D {
    return Array3d.fromArray(a).add(Array3d.fromArray(b)).data;
  }

  /**
   * Subtract two 3D arrays element-wise (raw arrays) - FIXED VERSION
   */
  export function sub(a: Numeric3D, b: Numeric3D): Numeric3D {
    return Array3d.fromArray(a).subtract(Array3d.fromArray(b)).data;
  }

  /**
   * Multiply 3D array by scalar (raw array)
   */
  export function mulBy(a: Numeric3D, scalar: number): Numeric3D {
    return Array3d.fromArray(a).multiplyScalar(scalar).data;
  }

  /**
   * Divide 3D array by scalar (raw array)
   */
  export function divBy(a: Numeric3D, scalar: number): Numeric3D {
    return Array3d.fromArray(a).divideScalar(scalar).data;
  }

  /**
   * Element-wise multiply two 3D arrays (raw arrays)
   */
  export function multiply(a: Numeric3D, b: Numeric3D): Numeric3D {
    return Array3d.fromArray(a).multiply(Array3d.fromArray(b)).data;
  }

  /**
   * Element-wise divide two 3D arrays (raw arrays)
   */
  export function divide(a: Numeric3D, b: Numeric3D): Numeric3D {
    return Array3d.fromArray(a).divide(Array3d.fromArray(b)).data;
  }
}

// Export both the class and compatibility functions
export { Array3d as default };