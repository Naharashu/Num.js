/**
 * Common type definitions for Num.js TypeScript migration
 * These types provide the foundation for type-safe mathematical operations
 */

// ============================================================================
// Basic Numeric Types
// ============================================================================

/** Base numeric type - always a finite number for mathematical operations */
export type Numeric = number;

/** One-dimensional array of numbers */
export type NumericArray = number[];

/** Two-dimensional array of numbers (matrix) */
export type NumericMatrix = number[][];

/** Three-dimensional array of numbers */
export type Numeric3D = number[][][];

/** Union type for all numeric array types */
export type NumericArrayLike = NumericArray | NumericMatrix | Numeric3D;

// ============================================================================
// Shape and Dimension Types
// ============================================================================

/** Readonly array representing the shape of an n-dimensional array */
export type Shape = readonly number[];

/** Axis parameter - null means operate on entire array, number specifies axis */
export type Axis = number | null;

/** Information about array dimensions */
export interface Dimensions {
    /** Shape of the array (e.g., [3, 4] for 3x4 matrix) */
    readonly shape: Shape;
    /** Number of dimensions */
    readonly ndim: number;
    /** Total number of elements */
    readonly size: number;
}

// ============================================================================
// Statistical Function Options
// ============================================================================

/** Options for statistical functions */
export interface StatisticalOptions {
    /** Axis along which to operate (null for entire array) */
    readonly axis?: Axis;
    /** Delta degrees of freedom for variance/std calculations */
    readonly ddof?: number;
}

/** Options for array comparison functions */
export interface ComparisonOptions {
    /** Relative tolerance for floating point comparison */
    readonly rtol?: number;
    /** Absolute tolerance for floating point comparison */
    readonly atol?: number;
}

// ============================================================================
// Complex Number Support
// ============================================================================

/** Complex number representation */
export interface ComplexNumber {
    /** Real part */
    readonly real: number;
    /** Imaginary part */
    readonly imag: number;
}

/** Array of complex numbers */
export type ComplexArray = ComplexNumber[];

/** Matrix of complex numbers */
export type ComplexMatrix = ComplexNumber[][];

// ============================================================================
// Function Type Definitions
// ============================================================================

/** Function that operates on a single number */
export type UnaryFunction = (x: number) => number;

/** Function that operates on two numbers */
export type BinaryFunction = (x: number, y: number) => number;

/** Function that operates on an array of numbers */
export type ArrayFunction<T = number> = (arr: readonly number[]) => T;

/** Function that operates element-wise on arrays */
export type ElementWiseFunction = (arr: readonly number[]) => number[];

// ============================================================================
// Utility Types
// ============================================================================

/** Type guard for checking if value is a finite number */
export type FiniteNumber = number & { __brand: 'finite' };

/** Options for random number generation */
export interface RandomOptions {
    /** Random seed for reproducibility */
    readonly seed?: number;
    /** Size/shape of output array */
    readonly size?: number | Shape;
}

/** Range specification for various operations */
export interface Range {
    /** Start value (inclusive) */
    readonly start: number;
    /** End value (exclusive) */
    readonly end: number;
    /** Step size */
    readonly step?: number;
}

// ============================================================================
// Matrix Operation Types
// ============================================================================

/** Supported matrix norms */
export type MatrixNorm = 'fro' | 1 | -1 | 2 | -2 | number;

/** Vector norms */
export type VectorNorm = 1 | 2 | number;

/** Matrix decomposition results */
export interface QRDecomposition {
    readonly Q: NumericMatrix;
    readonly R: NumericMatrix;
}

export interface SVDDecomposition {
    readonly U: NumericMatrix;
    readonly S: NumericArray;
    readonly Vt: NumericMatrix;
}

export interface EigenDecomposition {
    readonly eigenvalues: NumericArray;
    readonly eigenvectors: NumericMatrix;
}

// ============================================================================
// Type Guards and Validation
// ============================================================================

/** Type predicate for finite numbers */
export function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

/** Type predicate for numeric arrays */
export function isNumericArray(value: unknown): value is NumericArray {
    return Array.isArray(value) && value.every(isFiniteNumber);
}

/** Type predicate for numeric matrices */
export function isNumericMatrix(value: unknown): value is NumericMatrix {
    if (!Array.isArray(value) || value.length === 0) return false;

    const firstRowLength = value[0]?.length;
    if (typeof firstRowLength !== 'number' || firstRowLength === 0) return false;

    return value.every(row =>
        Array.isArray(row) &&
        row.length === firstRowLength &&
        row.every(isFiniteNumber)
    );
}

/** Type predicate for complex numbers */
export function isComplexNumber(value: unknown): value is ComplexNumber {
    return (
        typeof value === 'object' &&
        value !== null &&
        'real' in value &&
        'imag' in value &&
        isFiniteNumber((value as ComplexNumber).real) &&
        isFiniteNumber((value as ComplexNumber).imag)
    );
}

// ============================================================================
// Constants
// ============================================================================

/** Mathematical constants with proper typing */
export const MATH_CONSTANTS = {
    /** Euler's number */
    E: Math.E,
    /** Natural logarithm of 2 */
    LN2: Math.LN2,
    /** Natural logarithm of 10 */
    LN10: Math.LN10,
    /** Base 2 logarithm of E */
    LOG2E: Math.LOG2E,
    /** Base 10 logarithm of E */
    LOG10E: Math.LOG10E,
    /** Pi */
    PI: Math.PI,
    /** Square root of 1/2 */
    SQRT1_2: Math.SQRT1_2,
    /** Square root of 2 */
    SQRT2: Math.SQRT2,
    /** Machine epsilon for floating point comparison */
    EPSILON: Number.EPSILON,
    /** Maximum safe integer */
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    /** Minimum safe integer */
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
} as const;
