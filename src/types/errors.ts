/**
 * Custom error classes for Num.js TypeScript migration
 * Provides specific error types for mathematical operations with detailed context
 */

import type { Shape } from './common.js';

// ============================================================================
// Base Error Classes
// ============================================================================

/**
 * Base class for all mathematical operation errors
 * Provides context about which operation failed
 */
export class MathematicalError extends Error {
  public override name = 'MathematicalError';
  
  constructor(
    message: string,
    public readonly operation: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MathematicalError.prototype);
    
    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MathematicalError);
    }
  }
  
  /**
   * Create a detailed error message with operation context
   */
  public getDetailedMessage(): string {
    let message = `${this.operation}: ${this.message}`;
    
    if (this.context) {
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      message += ` (Context: ${contextStr})`;
    }
    
    return message;
  }
}

// ============================================================================
// Dimension and Shape Errors
// ============================================================================

/**
 * Error thrown when array dimensions are incompatible for an operation
 */
export class DimensionError extends Error {
  public override readonly name = 'DimensionError';
  
  constructor(
    message: string,
    public readonly expectedShape: Shape,
    public readonly actualShape: Shape,
    public readonly operation?: string
  ) {
    const detailedMessage = operation 
      ? `${operation}: ${message}. Expected shape: [${expectedShape.join(', ')}], got: [${actualShape.join(', ')}]`
      : `${message}. Expected shape: [${expectedShape.join(', ')}], got: [${actualShape.join(', ')}]`;
    
    super(detailedMessage);
    Object.setPrototypeOf(this, DimensionError.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DimensionError);
    }
  }
  
  /**
   * Check if shapes are compatible for broadcasting
   */
  public static checkBroadcastCompatibility(shape1: Shape, shape2: Shape): void {
    const maxLength = Math.max(shape1.length, shape2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const dim1 = shape1[shape1.length - 1 - i] ?? 1;
      const dim2 = shape2[shape2.length - 1 - i] ?? 1;
      
      if (dim1 !== dim2 && dim1 !== 1 && dim2 !== 1) {
        throw new DimensionError(
          'Arrays cannot be broadcast together',
          shape1,
          shape2,
          'broadcasting'
        );
      }
    }
  }
}

// ============================================================================
// Matrix-Specific Errors
// ============================================================================

/**
 * Error thrown when attempting to invert a singular matrix
 */
export class SingularMatrixError extends MathematicalError {
  public override name = 'SingularMatrixError';
  
  constructor(matrixShape?: Shape) {
    const message = matrixShape 
      ? `Matrix of shape [${matrixShape.join(', ')}] is singular and cannot be inverted`
      : 'Matrix is singular and cannot be inverted';
    
    super(message, 'matrix_inversion', { matrixShape });
    Object.setPrototypeOf(this, SingularMatrixError.prototype);
  }
}

/**
 * Error thrown when matrix is not square for operations requiring square matrices
 */
export class NonSquareMatrixError extends MathematicalError {
  public override name = 'NonSquareMatrixError';
  
  constructor(shape: Shape, operation: string) {
    super(
      `Operation '${operation}' requires a square matrix, got shape [${shape.join(', ')}]`,
      operation,
      { shape, required: 'square matrix' }
    );
    Object.setPrototypeOf(this, NonSquareMatrixError.prototype);
  }
}

/**
 * Error thrown when matrix is not positive definite for Cholesky decomposition
 */
export class NotPositiveDefiniteError extends MathematicalError {
  public override name = 'NotPositiveDefiniteError';
  
  constructor(matrixShape?: Shape) {
    const message = matrixShape
      ? `Matrix of shape [${matrixShape.join(', ')}] is not positive definite`
      : 'Matrix is not positive definite';
    
    super(message, 'cholesky_decomposition', { matrixShape });
    Object.setPrototypeOf(this, NotPositiveDefiniteError.prototype);
  }
}

// ============================================================================
// Parameter Validation Errors
// ============================================================================

/**
 * Error thrown when function parameters are invalid
 */
export class InvalidParameterError extends Error {
  public override readonly name = 'InvalidParameterError';
  
  constructor(
    public readonly parameterName: string,
    public readonly expectedType: string,
    public readonly actualValue: unknown,
    public readonly additionalInfo?: string
  ) {
    const valueStr = typeof actualValue === 'object' 
      ? JSON.stringify(actualValue)
      : String(actualValue);
    
    let message = `Parameter '${parameterName}' expected ${expectedType}, got ${typeof actualValue}`;
    
    if (actualValue !== null && actualValue !== undefined) {
      message += ` (value: ${valueStr})`;
    }
    
    if (additionalInfo) {
      message += `. ${additionalInfo}`;
    }
    
    super(message);
    Object.setPrototypeOf(this, InvalidParameterError.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidParameterError);
    }
  }
  
  /**
   * Create error for non-finite number
   */
  public static nonFiniteNumber(paramName: string, value: unknown): InvalidParameterError {
    return new InvalidParameterError(
      paramName,
      'finite number',
      value,
      'Mathematical operations require finite numbers'
    );
  }
  
  /**
   * Create error for negative number when positive required
   */
  public static negativeNumber(paramName: string, value: number): InvalidParameterError {
    return new InvalidParameterError(
      paramName,
      'positive number',
      value,
      'This operation requires a positive number'
    );
  }
  
  /**
   * Create error for non-integer when integer required
   */
  public static nonInteger(paramName: string, value: number): InvalidParameterError {
    return new InvalidParameterError(
      paramName,
      'integer',
      value,
      'This operation requires an integer value'
    );
  }
}

// ============================================================================
// Numerical Computation Errors
// ============================================================================

/**
 * Error thrown when numerical computation fails to converge
 */
export class ConvergenceError extends MathematicalError {
  public override name = 'ConvergenceError';
  
  constructor(
    operation: string,
    public readonly maxIterations: number,
    public readonly tolerance: number,
    public readonly finalError?: number
  ) {
    let message = `${operation} failed to converge after ${maxIterations} iterations (tolerance: ${tolerance})`;
    
    if (finalError !== undefined) {
      message += `. Final error: ${finalError}`;
    }
    
    super(message, operation, { maxIterations, tolerance, finalError });
    Object.setPrototypeOf(this, ConvergenceError.prototype);
  }
}

/**
 * Error thrown when numerical computation results in overflow
 */
export class NumericalOverflowError extends MathematicalError {
  public override name = 'NumericalOverflowError';
  
  constructor(operation: string, value?: number) {
    const message = value !== undefined
      ? `Numerical overflow in ${operation}: result would be ${value}`
      : `Numerical overflow in ${operation}`;
    
    super(message, operation, { overflowValue: value });
    Object.setPrototypeOf(this, NumericalOverflowError.prototype);
  }
}

/**
 * Error thrown when division by zero occurs
 */
export class DivisionByZeroError extends MathematicalError {
  public override name = 'DivisionByZeroError';
  
  constructor(operation: string = 'division') {
    super('Division by zero', operation);
    Object.setPrototypeOf(this, DivisionByZeroError.prototype);
  }
}

// ============================================================================
// Array and Index Errors
// ============================================================================

/**
 * Error thrown when array index is out of bounds
 */
export class IndexOutOfBoundsError extends Error {
  public override readonly name = 'IndexOutOfBoundsError';
  
  constructor(
    public readonly index: number,
    public readonly arrayLength: number,
    public readonly dimension?: number
  ) {
    const dimStr = dimension !== undefined ? ` in dimension ${dimension}` : '';
    super(`Index ${index} is out of bounds for array of length ${arrayLength}${dimStr}`);
    Object.setPrototypeOf(this, IndexOutOfBoundsError.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IndexOutOfBoundsError);
    }
  }
}

/**
 * Error thrown when array is empty but operation requires non-empty array
 */
export class EmptyArrayError extends Error {
  public override readonly name = 'EmptyArrayError';
  
  constructor(operation: string) {
    super(`Operation '${operation}' cannot be performed on empty array`);
    Object.setPrototypeOf(this, EmptyArrayError.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmptyArrayError);
    }
  }
}


// ============================================================================
// Utility functions for error handling
// ============================================================================

/**
 * Type guard to check if error is a mathematical error
 */
export function isMathematicalError(error: unknown): error is MathematicalError {
  return error instanceof MathematicalError;
}

/**
 * Type guard to check if error is a dimension error
 */
export function isDimensionError(error: unknown): error is DimensionError {
  return error instanceof DimensionError;
}

/**
 * Wrap a function to provide better error context
 */
export function withErrorContext<T extends unknown[], R>(
  fn: (...args: T) => R,
  operation: string
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof Error && !isMathematicalError(error)) {
        throw new MathematicalError(error.message, operation);
      }
      throw error;
    }
  };
}