/**
 * Core N-dimensional array implementation for Num.js
 * Provides a unified, NumPy-like ndarray class with efficient memory layout
 */

import type {
    Shape
} from '../types/common.js';
import {
    DimensionError,
    InvalidParameterError,
    IndexOutOfBoundsError,
    MathematicalError
} from '../types/errors.js';
import {
    validateFiniteNumber,
    validateShape
} from '../types/validation.js';

// ============================================================================
// Type Definitions for ndarray
// ============================================================================

/** Supported data types for ndarray */
export type DType = 'float64' | 'float32' | 'int32' | 'int16' | 'int8' | 'uint32' | 'uint16' | 'uint8';

/** TypedArray constructor types */
export type TypedArrayConstructor =
    | Float64ArrayConstructor
    | Float32ArrayConstructor
    | Int32ArrayConstructor
    | Int16ArrayConstructor
    | Int8ArrayConstructor
    | Uint32ArrayConstructor
    | Uint16ArrayConstructor
    | Uint8ArrayConstructor;

/** Union of all TypedArray types */
export type TypedArrayLike =
    | Float64Array
    | Float32Array
    | Int32Array
    | Int16Array
    | Int8Array
    | Uint32Array
    | Uint16Array
    | Uint8Array;

/** Nested array types for arbitrary dimensions */
export type NestedArray = number | number[] | number[][] | number[][][];

/** Configuration options for ndarray creation */
export interface NDArrayOptions {
    /** Data type for the array elements */
    dtype?: DType;
    /** Whether the array should be read-only */
    readonly?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the TypedArray constructor for a given dtype
 */
function getTypedArrayConstructor(dtype: DType): TypedArrayConstructor {
    switch (dtype) {
        case 'float64': return Float64Array;
        case 'float32': return Float32Array;
        case 'int32': return Int32Array;
        case 'int16': return Int16Array;
        case 'int8': return Int8Array;
        case 'uint32': return Uint32Array;
        case 'uint16': return Uint16Array;
        case 'uint8': return Uint8Array;
        default:
            throw new InvalidParameterError('dtype', 'valid data type', dtype);
    }
}

/**
 * Calculate strides for a given shape (C-order/row-major)
 */
function calculateStrides(shape: Shape): number[] {
    const strides = new Array<number>(shape.length);
    let stride = 1;

    // Calculate strides from right to left (C-order)
    for (let i = shape.length - 1; i >= 0; i--) {
        strides[i] = stride;
        stride *= shape[i]!; // Safe because shape is validated
    }

    return strides;
}

/**
 * Calculate the total number of elements from a shape
 */
function calculateSize(shape: Shape): number {
    return shape.reduce((size, dim) => size * dim, 1);
}

/**
 * Convert multi-dimensional indices to flat buffer index
 */
function indicesToOffset(indices: number[], strides: number[]): number {
    if (indices.length !== strides.length) {
        throw new DimensionError(
            `Index dimensions (${indices.length}) don't match array dimensions (${strides.length})`,
            [strides.length],
            [indices.length]
        );
    }

    let offset = 0;
    for (let i = 0; i < indices.length; i++) {
        offset += indices[i]! * strides[i]!; // Safe because lengths are validated
    }

    return offset;
}

// ============================================================================
// Core NDArray Class
// ============================================================================

/**
 * N-dimensional array class providing NumPy-like functionality
 * 
 * This class uses a flat TypedArray buffer with shape and strides for efficient
 * memory layout and zero-copy operations like reshape and transpose.
 */
export class NDArray {
    /** Flat data buffer storing all elements */
    private readonly _data: TypedArrayLike;

    /** Shape tuple describing dimensions */
    private readonly _shape: Shape;

    /** Strides tuple for memory layout */
    private readonly _strides: number[];

    /** Data type of array elements */
    private readonly _dtype: DType;

    /** Whether this array is read-only */
    private readonly _readonly: boolean;

    /** Offset into the data buffer (for views) */
    private readonly _offset: number;

    // ============================================================================
    // Constructor
    // ============================================================================

    /**
     * Create a new NDArray
     * @param data - Flat data buffer or nested array data
     * @param shape - Shape of the array
     * @param options - Configuration options
     */
    constructor(
        data: TypedArrayLike | NestedArray,
        shape: Shape,
        options: NDArrayOptions = {}
    ) {
        const { dtype = 'float64', readonly = false } = options;

        // Validate shape
        validateShape(shape);

        this._shape = [...shape]; // Create defensive copy
        this._strides = calculateStrides(this._shape);
        this._dtype = dtype;
        this._readonly = readonly;
        this._offset = 0;

        const expectedSize = calculateSize(this._shape);

        if (data instanceof Float64Array || data instanceof Float32Array ||
            data instanceof Int32Array || data instanceof Int16Array ||
            data instanceof Int8Array || data instanceof Uint32Array ||
            data instanceof Uint16Array || data instanceof Uint8Array) {
            // Handle TypedArray input
            if (data.length !== expectedSize) {
                throw new DimensionError(
                    `Data size (${data.length}) doesn't match shape size (${expectedSize})`,
                    [expectedSize],
                    [data.length]
                );
            }

            // Create a copy to ensure immutability of the original
            const TypedArrayCtor = getTypedArrayConstructor(dtype);
            this._data = new TypedArrayCtor(data);
        } else {
            // Handle nested array input (number, number[], number[][], etc.)
            const flatData = this._flattenNestedArray(data);
            if (flatData.length !== expectedSize) {
                throw new DimensionError(
                    `Data size (${flatData.length}) doesn't match shape size (${expectedSize})`,
                    [expectedSize],
                    [flatData.length]
                );
            }

            const TypedArrayCtor = getTypedArrayConstructor(dtype);
            this._data = new TypedArrayCtor(flatData);
        }
    }

    // ============================================================================
    // Properties
    // ============================================================================

    /** Get the shape of the array */
    get shape(): Shape {
        return [...this._shape]; // Return defensive copy
    }

    /** Get the strides of the array */
    get strides(): number[] {
        return [...this._strides]; // Return defensive copy
    }

    /** Get the data type */
    get dtype(): DType {
        return this._dtype;
    }

    /** Get the number of dimensions */
    get ndim(): number {
        return this._shape.length;
    }

    /** Get the total number of elements */
    get size(): number {
        return calculateSize(this._shape);
    }

    /** Check if the array is read-only */
    get readonly(): boolean {
        return this._readonly;
    }

    // ============================================================================
    // Element Access
    // ============================================================================

    /**
     * Get an element at the specified indices
     * @param indices - Multi-dimensional indices
     * @returns The element value
     */
    get(...indices: number[]): number {
        this._validateIndices(indices);
        const offset = this._offset + indicesToOffset(indices, this._strides);
        return this._data[offset]!; // Safe because offset is calculated from validated indices
    }

    /**
     * Set an element at the specified indices
     * @param indices - Multi-dimensional indices followed by the value
     */
    set(...args: number[]): void {
        if (this._readonly) {
            throw new MathematicalError('Cannot modify read-only array', 'set');
        }

        if (args.length < 2) {
            throw new InvalidParameterError('arguments', 'at least 2 arguments (indices and value)', args.length);
        }

        const value = args[args.length - 1];
        const indices = args.slice(0, -1);

        validateFiniteNumber(value, 'value');
        this._validateIndices(indices);

        const offset = this._offset + indicesToOffset(indices, this._strides);
        this._data[offset] = value;
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * Flatten nested array data into a 1D array
     * Handles arbitrary nesting levels in a type-safe way
     */
    private _flattenNestedArray(data: NestedArray): number[] {
        const result: number[] = [];

        const flattenRecursive = (item: NestedArray): void => {
            if (typeof item === 'number') {
                validateFiniteNumber(item, 'array element');
                result.push(item);
            } else if (Array.isArray(item)) {
                for (const subItem of item) {
                    flattenRecursive(subItem);
                }
            }
        };

        flattenRecursive(data);
        return result;
    }

    /**
     * Validate multi-dimensional indices
     */
    private _validateIndices(indices: number[]): void {
        if (indices.length !== this._shape.length) {
            throw new DimensionError(
                `Expected ${this._shape.length} indices, got ${indices.length}`,
                [this._shape.length],
                [indices.length]
            );
        }

        for (let i = 0; i < indices.length; i++) {
            const index = indices[i]!; // Safe because we validated length above
            const dim = this._shape[i]!; // Safe because we validated length above

            if (!Number.isInteger(index)) {
                throw new InvalidParameterError(`index[${i}]`, 'integer', index);
            }

            // Handle negative indexing
            const normalizedIndex = index < 0 ? dim + index : index;

            if (normalizedIndex < 0 || normalizedIndex >= dim) {
                throw new IndexOutOfBoundsError(index, dim, i);
            }

            // Update the index in place for further processing
            indices[i] = normalizedIndex;
        }
    }

    // ============================================================================
    // Zero-Copy Operations
    // ============================================================================

    /**
     * Create a new view of the array with a different shape (zero-copy reshape)
     * The new shape must have the same total number of elements
     * @param newShape - The desired shape
     * @returns A new NDArray view with the specified shape
     */
    reshape(newShape: Shape): NDArray {
        validateShape(newShape);

        const newSize = calculateSize(newShape);
        if (newSize !== this.size) {
            throw new DimensionError(
                `Cannot reshape array of size ${this.size} into shape [${newShape.join(', ')}] (size ${newSize})`,
                [this.size],
                [newSize]
            );
        }

        // Create a new NDArray that shares the same data buffer
        const reshaped = Object.create(NDArray.prototype) as NDArray;

        // Share the same data buffer and offset
        (reshaped as any)._data = this._data;
        (reshaped as any)._offset = this._offset;
        (reshaped as any)._dtype = this._dtype;
        (reshaped as any)._readonly = this._readonly;

        // Calculate new shape and strides
        (reshaped as any)._shape = [...newShape];
        (reshaped as any)._strides = calculateStrides(newShape);

        return reshaped;
    }

    /**
     * Create a transposed view of the array (zero-copy transpose)
     * For 2D arrays, this swaps rows and columns
     * For higher dimensions, reverses all axes
     * @param axes - Optional array specifying the permutation of axes
     * @returns A new NDArray view that is transposed
     */
    transpose(axes?: number[]): NDArray {
        let newShape: Shape;
        let newStrides: number[];

        if (axes) {
            // Validate axes parameter
            if (axes.length !== this.ndim) {
                throw new DimensionError(
                    `Axes length (${axes.length}) must match array dimensions (${this.ndim})`,
                    [this.ndim],
                    [axes.length]
                );
            }

            // Check for valid axis indices and no duplicates
            const axesSet = new Set(axes);
            if (axesSet.size !== axes.length) {
                throw new InvalidParameterError('axes', 'unique axis indices', axes);
            }

            for (const axis of axes) {
                if (!Number.isInteger(axis) || axis < 0 || axis >= this.ndim) {
                    throw new InvalidParameterError('axis', `integer between 0 and ${this.ndim - 1}`, axis);
                }
            }

            // Permute shape and strides according to axes
            newShape = axes.map(axis => this._shape[axis]!);
            newStrides = axes.map(axis => this._strides[axis]!);
        } else {
            // Default: reverse all axes
            newShape = [...this._shape].reverse();
            newStrides = [...this._strides].reverse();
        }

        // Create a new NDArray that shares the same data buffer
        const transposed = Object.create(NDArray.prototype) as NDArray;

        // Share the same data buffer and offset
        (transposed as any)._data = this._data;
        (transposed as any)._offset = this._offset;
        (transposed as any)._dtype = this._dtype;
        (transposed as any)._readonly = this._readonly;

        // Set new shape and strides
        (transposed as any)._shape = newShape;
        (transposed as any)._strides = newStrides;

        return transposed;
    }

    /**
     * Create a view of a subset of the array (zero-copy slicing)
     * @param slices - Array of slice specifications for each dimension
     * @returns A new NDArray view of the sliced data
     */
    slice(...slices: Array<number | [number, number] | [number, number, number]>): NDArray {
        if (slices.length > this.ndim) {
            throw new DimensionError(
                `Too many slice dimensions (${slices.length}) for array with ${this.ndim} dimensions`,
                [this.ndim],
                [slices.length]
            );
        }

        const newShape: number[] = [];
        const newStrides: number[] = [];
        let newOffset = this._offset;

        for (let i = 0; i < this.ndim; i++) {
            const dimSize = this._shape[i]!;
            const stride = this._strides[i]!;

            if (i < slices.length) {
                const slice = slices[i]!;

                if (typeof slice === 'number') {
                    // Single index - this dimension is eliminated
                    const normalizedIndex = slice < 0 ? dimSize + slice : slice;
                    if (normalizedIndex < 0 || normalizedIndex >= dimSize) {
                        throw new IndexOutOfBoundsError(slice, dimSize, i);
                    }
                    newOffset += normalizedIndex * stride;
                    // Don't add to newShape/newStrides - dimension is eliminated
                } else {
                    // Range slice [start, end] or [start, end, step]
                    const [start, end, step = 1] = slice;

                    if (step === 0) {
                        throw new InvalidParameterError('step', 'non-zero integer', step);
                    }

                    // Normalize start and end indices
                    const normalizedStart = start < 0 ? Math.max(0, dimSize + start) : Math.min(start, dimSize);
                    const normalizedEnd = end < 0 ? Math.max(0, dimSize + end) : Math.min(end, dimSize);

                    if (step > 0) {
                        const sliceSize = Math.max(0, Math.ceil((normalizedEnd - normalizedStart) / step));
                        newShape.push(sliceSize);
                        newStrides.push(stride * step);
                        newOffset += normalizedStart * stride;
                    } else {
                        // Negative step - reverse iteration
                        const sliceSize = Math.max(0, Math.ceil((normalizedStart - normalizedEnd) / Math.abs(step)));
                        newShape.push(sliceSize);
                        newStrides.push(stride * step);
                        newOffset += normalizedStart * stride;
                    }
                }
            } else {
                // No slice specified for this dimension - include entire dimension
                newShape.push(dimSize);
                newStrides.push(stride);
            }
        }

        // Create a new NDArray that shares the same data buffer
        const sliced = Object.create(NDArray.prototype) as NDArray;

        // Share the same data buffer with new offset
        (sliced as any)._data = this._data;
        (sliced as any)._offset = newOffset;
        (sliced as any)._dtype = this._dtype;
        (sliced as any)._readonly = this._readonly;

        // Set new shape and strides
        (sliced as any)._shape = newShape;
        (sliced as any)._strides = newStrides;

        return sliced;
    }

    /**
     * Create a view that shares the same data buffer
     * This is useful for creating multiple views of the same data
     * @returns A new NDArray view that shares the underlying buffer
     */
    view(): NDArray {
        const view = Object.create(NDArray.prototype) as NDArray;

        // Share all properties
        (view as any)._data = this._data;
        (view as any)._offset = this._offset;
        (view as any)._dtype = this._dtype;
        (view as any)._readonly = this._readonly;
        (view as any)._shape = [...this._shape];
        (view as any)._strides = [...this._strides];

        return view;
    }

    /**
     * Check if this array shares data with another array
     * @param other - Another NDArray to compare with
     * @returns True if both arrays share the same underlying buffer
     */
    sharesDataWith(other: NDArray): boolean {
        return this._data === (other as any)._data;
    }

    // ============================================================================
    // String Representation
    // ============================================================================

    /**
     * String representation of the array
     */
    toString(): string {
        return `NDArray(shape=[${this._shape.join(', ')}], dtype=${this._dtype})`;
    }

    /**
     * Detailed string representation showing data
     */
    repr(): string {
        // For now, just return basic info - we'll enhance this later
        return `NDArray(shape=[${this._shape.join(', ')}], dtype=${this._dtype}, size=${this.size})`;
    }
}