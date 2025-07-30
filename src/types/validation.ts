/**
 * Type validation utilities for Num.js TypeScript migration
 * Provides runtime validation functions that work with TypeScript type system
 */

import type { 
  NumericArray, 
  NumericMatrix, 
  Numeric3D, 
  Shape,
  ComplexNumber 
} from './common.js';
import { 
  InvalidParameterError, 
  DimensionError, 
  EmptyArrayError 
} from './errors.js';

// ============================================================================
// Basic Type Validation
// ============================================================================

/**
 * Validate that a value is a finite number
 */
export function validateFiniteNumber(
  value: unknown, 
  paramName: string = 'value'
): asserts value is number {
  if (typeof value !== 'number') {
    throw new InvalidParameterError(paramName, 'number', value);
  }
  
  if (!Number.isFinite(value)) {
    throw InvalidParameterError.nonFiniteNumber(paramName, value);
  }
}

/**
 * Validate that a value is a positive number
 */
export function validatePositiveNumber(
  value: unknown, 
  paramName: string = 'value'
): asserts value is number {
  validateFiniteNumber(value, paramName);
  
  if (value <= 0) {
    throw InvalidParameterError.negativeNumber(paramName, value);
  }
}

/**
 * Validate that a value is a non-negative number
 */
export function validateNonNegativeNumber(
  value: unknown, 
  paramName: string = 'value'
): asserts value is number {
  validateFiniteNumber(value, paramName);
  
  if (value < 0) {
    throw new InvalidParameterError(
      paramName, 
      'non-negative number', 
      value,
      'Value must be >= 0'
    );
  }
}

/**
 * Validate that a value is an integer
 */
export function validateInteger(
  value: unknown, 
  paramName: string = 'value'
): asserts value is number {
  validateFiniteNumber(value, paramName);
  
  if (!Number.isInteger(value)) {
    throw InvalidParameterError.nonInteger(paramName, value);
  }
}

/**
 * Validate that a value is a positive integer
 */
export function validatePositiveInteger(
  value: unknown, 
  paramName: string = 'value'
): asserts value is number {
  validateInteger(value, paramName);
  
  if (value <= 0) {
    throw new InvalidParameterError(
      paramName, 
      'positive integer', 
      value,
      'Value must be a positive integer'
    );
  }
}

// ============================================================================
// Shape Validation
// ============================================================================

/**
 * Validate that a value is a valid shape array
 */
export function validateShape(
  value: unknown, 
  paramName: string = 'shape'
): asserts value is Shape {
  if (!Array.isArray(value)) {
    throw new InvalidParameterError(paramName, 'array', value);
  }
  
  if (value.length === 0) {
    throw new InvalidParameterError(
      paramName, 
      'non-empty array', 
      value,
      'Shape must have at least one dimension'
    );
  }
  
  for (let i = 0; i < value.length; i++) {
    const dim = value[i];
    
    if (!Number.isInteger(dim) || dim < 0) {
      throw new InvalidParameterError(
        `${paramName}[${i}]`, 
        'non-negative integer', 
        dim,
        'All shape dimensions must be non-negative integers'
      );
    }
  }
}

// ============================================================================
// Array Validation
// ============================================================================

/**
 * Validate that a value is a numeric array
 */
export function validateNumericArray(
  value: unknown, 
  paramName: string = 'array'
): asserts value is NumericArray {
  if (!Array.isArray(value)) {
    throw new InvalidParameterError(paramName, 'array', value);
  }
  
  if (value.length === 0) {
    throw new EmptyArrayError(`Parameter '${paramName}'`);
  }
  
  for (let i = 0; i < value.length; i++) {
    try {
      validateFiniteNumber(value[i], `${paramName}[${i}]`);
    } catch (error) {
      throw new InvalidParameterError(
        `${paramName}[${i}]`, 
        'finite number', 
        value[i],
        'All array elements must be finite numbers'
      );
    }
  }
}

/**
 * Validate that a value is a numeric matrix (2D array)
 */
export function validateNumericMatrix(
  value: unknown, 
  paramName: string = 'matrix'
): asserts value is NumericMatrix {
  if (!Array.isArray(value)) {
    throw new InvalidParameterError(paramName, '2D array', value);
  }
  
  if (value.length === 0) {
    throw new EmptyArrayError(`Parameter '${paramName}'`);
  }
  
  const expectedCols = value[0]?.length;
  if (typeof expectedCols !== 'number' || expectedCols === 0) {
    throw new InvalidParameterError(
      paramName, 
      'non-empty 2D array', 
      value,
      'Matrix must have at least one column'
    );
  }
  
  for (let i = 0; i < value.length; i++) {
    const row = value[i];
    
    if (!Array.isArray(row)) {
      throw new InvalidParameterError(
        `${paramName}[${i}]`, 
        'array', 
        row,
        'All matrix rows must be arrays'
      );
    }
    
    if (row.length !== expectedCols) {
      throw new DimensionError(
        `All matrix rows must have the same length`,
        [expectedCols],
        [row.length],
        `${paramName}[${i}]`
      );
    }
    
    for (let j = 0; j < row.length; j++) {
      try {
        validateFiniteNumber(row[j], `${paramName}[${i}][${j}]`);
      } catch (error) {
        throw new InvalidParameterError(
          `${paramName}[${i}][${j}]`, 
          'finite number', 
          row[j],
          'All matrix elements must be finite numbers'
        );
      }
    }
  }
}

/**
 * Validate that a value is a 3D numeric array
 */
export function validateNumeric3DArray(
  value: unknown, 
  paramName: string = 'array3d'
): asserts value is Numeric3D {
  if (!Array.isArray(value)) {
    throw new InvalidParameterError(paramName, '3D array', value);
  }
  
  if (value.length === 0) {
    throw new EmptyArrayError(`Parameter '${paramName}'`);
  }
  
  const expectedY = value[0]?.length;
  const expectedZ = value[0]?.[0]?.length;
  
  if (typeof expectedY !== 'number' || expectedY === 0) {
    throw new InvalidParameterError(
      paramName, 
      'non-empty 3D array', 
      value,
      '3D array must have at least one element in Y dimension'
    );
  }
  
  if (typeof expectedZ !== 'number' || expectedZ === 0) {
    throw new InvalidParameterError(
      paramName, 
      'non-empty 3D array', 
      value,
      '3D array must have at least one element in Z dimension'
    );
  }
  
  for (let x = 0; x < value.length; x++) {
    const plane = value[x];
    
    if (!Array.isArray(plane) || plane.length !== expectedY) {
      throw new DimensionError(
        `All 3D array planes must have the same Y dimension`,
        [expectedY],
        [Array.isArray(plane) ? plane.length : 0],
        `${paramName}[${x}]`
      );
    }
    
    for (let y = 0; y < plane.length; y++) {
      const row = plane[y];
      
      if (!Array.isArray(row) || row.length !== expectedZ) {
        throw new DimensionError(
          `All 3D array rows must have the same Z dimension`,
          [expectedZ],
          [Array.isArray(row) ? row.length : 0],
          `${paramName}[${x}][${y}]`
        );
      }
      
      for (let z = 0; z < row.length; z++) {
        try {
          validateFiniteNumber(row[z], `${paramName}[${x}][${y}][${z}]`);
        } catch (error) {
          throw new InvalidParameterError(
            `${paramName}[${x}][${y}][${z}]`, 
            'finite number', 
            row[z],
            'All 3D array elements must be finite numbers'
          );
        }
      }
    }
  }
}


// ============================================================================
// Index Validation
// ============================================================================

/**
 * Validate array index bounds
 */
export function validateArrayIndex(
  index: number, 
  arrayLength: number, 
  paramName: string = 'index'
): void {
  validateInteger(index, paramName);
  
  if (index < 0 || index >= arrayLength) {
    throw new InvalidParameterError(
      paramName,
      `integer between 0 and ${arrayLength - 1}`,
      index,
      `Index must be within array bounds [0, ${arrayLength - 1}]`
    );
  }
}




// ============================================================================
// Complex Number Validation
// ============================================================================

/**
 * Validate complex number
 */
export function validateComplexNumber(
  value: unknown, 
  paramName: string = 'complex'
): asserts value is ComplexNumber {
  if (typeof value !== 'object' || value === null) {
    throw new InvalidParameterError(paramName, 'complex number object', value);
  }
  
  const complex = value as any;
  
  if (!('real' in complex) || !('imag' in complex)) {
    throw new InvalidParameterError(
      paramName, 
      'object with real and imag properties', 
      value,
      'Complex number must have real and imag properties'
    );
  }
  
  validateFiniteNumber(complex.real, `${paramName}.real`);
  validateFiniteNumber(complex.imag, `${paramName}.imag`);
}

// ============================================================================
// Range and Options Validation
// ============================================================================

/**
 * Validate range object
 */
export function validateRange(
  range: unknown, 
  paramName: string = 'range'
): asserts range is { start: number; end: number; step?: number } {
  if (typeof range !== 'object' || range === null) {
    throw new InvalidParameterError(paramName, 'range object', range);
  }
  
  const r = range as any;
  
  if (!('start' in r) || !('end' in r)) {
    throw new InvalidParameterError(
      paramName, 
      'object with start and end properties', 
      range,
      'Range must have start and end properties'
    );
  }
  
  validateFiniteNumber(r.start, `${paramName}.start`);
  validateFiniteNumber(r.end, `${paramName}.end`);
  
  if ('step' in r && r.step !== undefined) {
    validateFiniteNumber(r.step, `${paramName}.step`);
    
    if (r.step === 0) {
      throw new InvalidParameterError(
        `${paramName}.step`, 
        'non-zero number', 
        r.step,
        'Step cannot be zero'
      );
    }
  }
}