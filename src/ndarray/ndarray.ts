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
     * Enhanced get method that supports string-based slicing
     * @param indices - Mix of numbers and strings for indexing
     * @returns Single element (number) or NDArray slice
     */
    getAdvanced(...indices: (number | string)[]): NDArray | number {
        // If all indices are numbers, use the basic get method
        if (indices.every(idx => typeof idx === 'number')) {
            return this.get(...(indices as number[]));
        }

        // Use enhanced slicing for mixed or string-based indices
        return this.sliceAdvanced(...indices);
    }

    /**
     * Advanced slicing method that supports string-based syntax
     * @param slices - Array of slice specifications (mix of numbers, strings, and arrays)
     * @returns A new NDArray view of the sliced data
     */
    sliceAdvanced(...slices: Array<number | string | [number, number] | [number, number, number]>): NDArray {
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

        // Process each dimension
        for (let i = 0; i < this.ndim; i++) {
            if (i < slices.length) {
                const slice = slices[i]!;
                const sliceResult = this._applySliceToDimension(i, slice);

                if (sliceResult.size >= 0) {
                    // Dimension is preserved (including empty slices with size 0)
                    newShape.push(sliceResult.size);
                    newStrides.push(sliceResult.stride);
                }
                // If size is -1, dimension is eliminated (single index access)

                newOffset += sliceResult.offset;
            } else {
                // No slice specified for this dimension - include entire dimension
                newShape.push(this._shape[i]!);
                newStrides.push(this._strides[i]!);
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
     * Fancy indexing - select elements using arrays of indices
     * @param indices - Arrays of indices for each dimension
     * @returns NDArray with selected elements
     */
    fancyIndex(...indices: number[][]): NDArray {
        if (indices.length === 0) {
            throw new InvalidParameterError('indices', 'at least one index array', 'empty');
        }

        if (indices.length > this.ndim) {
            throw new DimensionError(
                `Too many index arrays (${indices.length}) for array with ${this.ndim} dimensions`,
                [this.ndim],
                [indices.length]
            );
        }

        // Validate all index arrays have the same length
        const resultLength = indices[0]!.length;
        for (let i = 1; i < indices.length; i++) {
            if (indices[i]!.length !== resultLength) {
                throw new DimensionError(
                    'All index arrays must have the same length',
                    [resultLength],
                    [indices[i]!.length]
                );
            }
        }

        // Validate and normalize all indices
        const normalizedIndices = indices.map((indexArray, dim) => {
            return indexArray.map(idx => {
                if (!Number.isInteger(idx)) {
                    throw new InvalidParameterError(`indices[${dim}]`, 'array of integers', typeof idx);
                }
                return this._normalizeIndex(idx, this._shape[dim]!, dim);
            });
        });

        // Create result array
        const resultShape: Shape = [resultLength];
        const resultData = new (this._data.constructor as any)(resultLength);

        // Extract elements
        for (let i = 0; i < resultLength; i++) {
            const elementIndices = normalizedIndices.map(indexArray => indexArray[i]!);
            
            // Pad with zeros for missing dimensions
            while (elementIndices.length < this.ndim) {
                elementIndices.push(0);
            }

            const offset = this._offset + indicesToOffset(elementIndices, this._strides);
            resultData[i] = this._data[offset];
        }

        return new NDArray(resultData, resultShape, { dtype: this._dtype, readonly: this._readonly });
    }

    /**
     * Boolean indexing - select elements where boolean array is true
     * @param boolArray - Boolean array for indexing (must match array size)
     * @returns NDArray with selected elements
     */
    booleanIndex(boolArray: boolean[]): NDArray {
        if (!Array.isArray(boolArray)) {
            throw new InvalidParameterError('boolArray', 'array of booleans', typeof boolArray);
        }

        if (boolArray.length !== this.size) {
            throw new DimensionError(
                'Boolean array length must match array size',
                [this.size],
                [boolArray.length]
            );
        }

        // Validate boolean array
        for (let i = 0; i < boolArray.length; i++) {
            if (typeof boolArray[i] !== 'boolean') {
                throw new InvalidParameterError(`boolArray[${i}]`, 'boolean', typeof boolArray[i]);
            }
        }

        // Count true values to determine result size
        const trueCount = boolArray.filter(b => b).length;
        
        if (trueCount === 0) {
            // Return empty array
            const resultData = new (this._data.constructor as any)(0);
            return new NDArray(resultData, [0], { dtype: this._dtype, readonly: this._readonly });
        }

        // Create result array
        const resultData = new (this._data.constructor as any)(trueCount);
        let resultIndex = 0;

        // Extract elements where boolean is true
        for (let i = 0; i < boolArray.length; i++) {
            if (boolArray[i]) {
                const offset = this._offset + i;
                resultData[resultIndex++] = this._data[offset];
            }
        }

        return new NDArray(resultData, [trueCount], { dtype: this._dtype, readonly: this._readonly });
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

    /**
     * Parse a string slice specification into a range slice
     * Supports formats like "1:5", ":-1", "::2", "1:5:2", etc.
     */
    private _parseStringSlice(sliceStr: string): [number, number] | [number, number, number] {
        if (typeof sliceStr !== 'string') {
            throw new InvalidParameterError('sliceStr', 'string', sliceStr);
        }

        // Handle empty string
        if (sliceStr.trim() === '') {
            throw new InvalidParameterError('sliceStr', 'non-empty string', sliceStr);
        }

        // Split by colons
        const parts = sliceStr.split(':');

        if (parts.length === 1) {
            // Single number - this should be handled as a single index, not a slice
            const index = this._parseSliceNumber(parts[0]!, 0);
            throw new InvalidParameterError('sliceStr', 'slice notation (e.g., "1:5")', `single index: ${index}`);
        }

        if (parts.length === 2) {
            // Format: "start:end"
            const start = this._parseSliceNumber(parts[0]!, 0);
            const end = this._parseSliceNumber(parts[1]!, Infinity);
            return [start, end];
        }

        if (parts.length === 3) {
            // Format: "start:end:step"
            const step = this._parseSliceNumber(parts[2]!, 1);

            if (step === 0) {
                throw new InvalidParameterError('step', 'non-zero integer', step);
            }

            // Default values depend on step direction
            const defaultStart = step > 0 ? 0 : Infinity;
            const defaultEnd = step > 0 ? Infinity : -Infinity;

            const start = this._parseSliceNumber(parts[0]!, defaultStart);
            const end = this._parseSliceNumber(parts[1]!, defaultEnd);

            return [start, end, step];
        }

        throw new InvalidParameterError('sliceStr', 'valid slice format (start:end or start:end:step)', sliceStr);
    }

    /**
     * Parse a single number from a slice string part
     * Handles empty strings with default values
     */
    private _parseSliceNumber(str: string, defaultValue: number): number {
        const trimmed = str.trim();
        
        if (trimmed === '') {
            return defaultValue;
        }

        const num = parseInt(trimmed, 10);
        
        if (isNaN(num)) {
            throw new InvalidParameterError('slice component', 'integer or empty', str);
        }

        return num;
    }

    /**
     * Apply a slice specification to a specific dimension
     * @param dimIndex - Which dimension to slice
     * @param sliceSpec - The slice specification
     * @returns Information about the slice (new size, offset, stride)
     */
    private _applySliceToDimension(
        dimIndex: number,
        sliceSpec: number | string | [number, number] | [number, number, number]
    ): { size: number; offset: number; stride: number } {
        const dimSize = this._shape[dimIndex]!;
        const originalStride = this._strides[dimIndex]!;

        if (typeof sliceSpec === 'number') {
            // Single index - dimension is eliminated
            const normalizedIndex = this._normalizeIndex(sliceSpec, dimSize, dimIndex);
            return {
                size: -1, // Special marker for dimension elimination
                offset: normalizedIndex * originalStride,
                stride: originalStride
            };
        }

        if (typeof sliceSpec === 'string') {
            // Parse string slice
            const rangeSlice = this._parseStringSlice(sliceSpec);
            return this._applyRangeSlice(rangeSlice, dimSize, originalStride, dimIndex);
        }

        if (Array.isArray(sliceSpec)) {
            // Range slice
            return this._applyRangeSlice(sliceSpec, dimSize, originalStride, dimIndex);
        }

        throw new InvalidParameterError('sliceSpec', 'number, string, or array', typeof sliceSpec);
    }

    /**
     * Apply a range slice to a dimension
     */
    private _applyRangeSlice(
        rangeSlice: [number, number] | [number, number, number],
        dimSize: number,
        originalStride: number,
        dimIndex?: number
    ): { size: number; offset: number; stride: number } {
        const [start, end, step] = this._normalizeRangeSlice(rangeSlice, dimSize, dimIndex);

        let sliceSize: number;
        let offset: number;

        if (step > 0) {
            // Forward iteration
            sliceSize = Math.max(0, Math.ceil((end - start) / step));
            offset = start * originalStride;
        } else {
            // Backward iteration
            sliceSize = Math.max(0, Math.ceil((start - end) / Math.abs(step)));
            offset = start * originalStride;
        }

        return {
            size: sliceSize,
            offset,
            stride: originalStride * step
        };
    }

    /**
     * Normalize a single index for a given dimension size
     * Handles negative indexing (e.g., -1 for last element)
     */
    private _normalizeIndex(index: number, dimSize: number, dimIndex?: number): number {
        if (!Number.isInteger(index)) {
            throw new InvalidParameterError(`index${dimIndex !== undefined ? `[${dimIndex}]` : ''}`, 'integer', index);
        }

        // Handle negative indexing
        const normalizedIndex = index < 0 ? dimSize + index : index;

        // Check bounds
        if (normalizedIndex < 0 || normalizedIndex >= dimSize) {
            throw new IndexOutOfBoundsError(index, dimSize, dimIndex);
        }

        return normalizedIndex;
    }

    /**
     * Normalize a range slice for a given dimension size
     * Handles negative indices and default values
     */
    private _normalizeRangeSlice(
        slice: [number, number] | [number, number, number],
        dimSize: number,
        dimIndex?: number
    ): [number, number, number] {
        let [start, end, step = 1] = slice;

        if (step === 0) {
            throw new InvalidParameterError('step', 'non-zero integer', step);
        }

        // Handle default values for start and end based on step direction
        if (step > 0) {
            // Forward iteration
            if (start === -Infinity || (start < 0 && Math.abs(start) > dimSize)) {
                start = 0;
            } else if (start < 0) {
                start = dimSize + start;
            } else if (start > dimSize) {
                start = dimSize;
            }

            if (end === Infinity || end > dimSize) {
                end = dimSize;
            } else if (end < 0) {
                end = Math.max(0, dimSize + end);
            }
        } else {
            // Backward iteration (negative step)
            if (start === Infinity || start >= dimSize) {
                start = dimSize - 1;
            } else if (start < 0) {
                start = dimSize + start;
            }

            if (end === -Infinity || (end < 0 && Math.abs(end) > dimSize)) {
                end = -1; // One before the first element
            } else if (end < 0) {
                end = dimSize + end;
            } else if (end >= dimSize) {
                end = dimSize - 1;
            }
        }

        // Ensure start and end are within valid bounds based on step direction
        if (step > 0) {
            // Forward iteration: start >= 0, end <= dimSize
            // Don't clamp start if it would create an invalid range
            if (start < 0) start = 0;
            if (start > dimSize) start = dimSize;
            if (end < 0) end = 0;
            if (end > dimSize) end = dimSize;
        } else {
            // Backward iteration: start <= dimSize-1, end >= -1
            if (start < 0) start = 0;
            if (start >= dimSize) start = dimSize - 1;
            if (end < -1) end = -1;
            if (end >= dimSize) end = dimSize - 1;
        }

        return [start, end, step];
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
    // Broadcasting Utilities
    // ============================================================================

    /**
     * Check if this array can be broadcast with another array
     * @param other - Another NDArray or scalar
     * @returns True if broadcasting is possible
     */
    private _canBroadcastWith(other: NDArray | number): boolean {
        if (typeof other === 'number') {
            return true; // Scalars can always be broadcast
        }

        const thisShape = this._shape;
        const otherShape = other._shape;
        const maxLen = Math.max(thisShape.length, otherShape.length);

        // Pad shapes with 1s on the left to make them the same length
        const paddedThis = [...Array(maxLen - thisShape.length).fill(1), ...thisShape];
        const paddedOther = [...Array(maxLen - otherShape.length).fill(1), ...otherShape];

        // Check if each dimension is compatible
        for (let i = 0; i < maxLen; i++) {
            const dimThis = paddedThis[i];
            const dimOther = paddedOther[i];

            // Dimensions are compatible if they're equal or one of them is 1
            if (dimThis !== dimOther && dimThis !== 1 && dimOther !== 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate the resulting shape after broadcasting with another array
     * @param other - Another NDArray or scalar
     * @returns Resulting broadcast shape
     */
    private _getBroadcastShape(other: NDArray | number): Shape {
        if (typeof other === 'number') {
            return [...this._shape]; // Scalar broadcasting preserves this shape
        }

        if (!this._canBroadcastWith(other)) {
            throw new DimensionError(
                'Arrays cannot be broadcast together',
                this._shape,
                other._shape,
                'broadcasting'
            );
        }

        const thisShape = this._shape;
        const otherShape = other._shape;
        const maxLen = Math.max(thisShape.length, otherShape.length);
        const paddedThis = [...Array(maxLen - thisShape.length).fill(1), ...thisShape];
        const paddedOther = [...Array(maxLen - otherShape.length).fill(1), ...otherShape];

        const result: number[] = [];
        for (let i = 0; i < maxLen; i++) {
            result.push(Math.max(paddedThis[i], paddedOther[i]));
        }

        return result;
    }

    /**
     * Perform element-wise binary operation with broadcasting
     * @param other - Another NDArray or scalar
     * @param operation - Binary operation function
     * @param operationName - Name of the operation for error messages
     * @returns New NDArray with the result
     */
    _broadcastBinaryOp(
        other: NDArray | number,
        operation: (a: number, b: number) => number,
        operationName: string
    ): NDArray {
        const resultShape = this._getBroadcastShape(other);
        const resultSize = calculateSize(resultShape);
        const TypedArrayCtor = getTypedArrayConstructor(this._dtype);
        const resultData = new TypedArrayCtor(resultSize);

        if (typeof other === 'number') {
            // Scalar broadcasting - simple case
            for (let i = 0; i < this.size; i++) {
                const thisValue = this._data[this._offset + i];
                if (thisValue === undefined) {
                    throw new MathematicalError(`Invalid data access at index ${i}`, operationName);
                }
                try {
                    resultData[i] = operation(thisValue, other);
                } catch (error) {
                    throw new MathematicalError(`Operation failed: ${error}`, operationName);
                }
            }
            return new NDArray(resultData, this._shape, { dtype: this._dtype });
        }

        // Array broadcasting - more complex case
        const resultStrides = calculateStrides(resultShape);
        
        // Create iterators for both arrays
        for (let i = 0; i < resultSize; i++) {
            // Convert flat index to multi-dimensional indices
            const resultIndices = this._flatIndexToIndices(i, resultShape, resultStrides);
            
            // Map result indices to source array indices
            const thisIndices = this._mapBroadcastIndices(resultIndices, this._shape);
            const otherIndices = this._mapBroadcastIndices(resultIndices, other._shape);
            
            // Get values from both arrays
            const thisOffset = this._offset + indicesToOffset(thisIndices, this._strides);
            const otherOffset = other._offset + indicesToOffset(otherIndices, other._strides);
            
            const thisValue = this._data[thisOffset];
            const otherValue = other._data[otherOffset];
            
            if (thisValue === undefined || otherValue === undefined) {
                throw new MathematicalError(`Invalid data access during broadcasting`, operationName);
            }
            
            try {
                resultData[i] = operation(thisValue, otherValue);
            } catch (error) {
                throw new MathematicalError(`Operation failed: ${error}`, operationName);
            }
        }

        return new NDArray(resultData, resultShape, { dtype: this._dtype });
    }

    /**
     * Convert flat index to multi-dimensional indices
     */
    _flatIndexToIndices(flatIndex: number, shape: Shape, strides?: number[]): number[] {
        const indices: number[] = [];
        let remaining = flatIndex;

        if (strides) {
            // Use strides for conversion
            for (let i = 0; i < shape.length; i++) {
                const stride = strides[i]!;
                const index = Math.floor(remaining / stride);
                indices.push(index);
                remaining = remaining % stride;
            }
        } else {
            // Use shape-based conversion (row-major order)
            for (let i = shape.length - 1; i >= 0; i--) {
                const dimSize = shape[i]!;
                indices.unshift(remaining % dimSize);
                remaining = Math.floor(remaining / dimSize);
            }
        }

        return indices;
    }

    /**
     * Map broadcast result indices to source array indices
     */
    private _mapBroadcastIndices(resultIndices: number[], sourceShape: Shape): number[] {
        const sourceIndices: number[] = [];
        const offset = resultIndices.length - sourceShape.length;

        for (let i = 0; i < sourceShape.length; i++) {
            const resultIndex = i + offset;
            const sourceDim = sourceShape[i]!;
            
            if (sourceDim === 1) {
                // Broadcast dimension - use index 0
                sourceIndices.push(0);
            } else {
                // Normal dimension - use the result index
                sourceIndices.push(resultIndices[resultIndex] || 0);
            }
        }

        return sourceIndices;
    }

    // ============================================================================
    // Arithmetic Operations with Broadcasting
    // ============================================================================

    /**
     * Element-wise addition with broadcasting
     * @param other - NDArray or scalar to add
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([1, 2, 3], [3]);
     * const b = new NDArray([10], [1]);
     * const result = a.add(b); // [11, 12, 13]
     */
    add(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => a + b, 'add');
    }

    /**
     * Element-wise subtraction with broadcasting
     * @param other - NDArray or scalar to subtract
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([5, 6, 7], [3]);
     * const result = a.subtract(2); // [3, 4, 5]
     */
    subtract(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => a - b, 'subtract');
    }

    /**
     * Element-wise multiplication with broadcasting
     * @param other - NDArray or scalar to multiply
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * const result = a.multiply(2); // [[2, 4], [6, 8]]
     */
    multiply(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => a * b, 'multiply');
    }

    /**
     * Element-wise division with broadcasting
     * @param other - NDArray or scalar to divide by
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([10, 20, 30], [3]);
     * const result = a.divide(5); // [2, 4, 6]
     */
    divide(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => {
            if (b === 0) {
                throw new Error('Division by zero');
            }
            return a / b;
        }, 'divide');
    }

    /**
     * Element-wise power operation with broadcasting
     * @param other - NDArray or scalar exponent
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([2, 3, 4], [3]);
     * const result = a.power(2); // [4, 9, 16]
     */
    power(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => Math.pow(a, b), 'power');
    }

    /**
     * Element-wise modulo operation with broadcasting
     * @param other - NDArray or scalar divisor
     * @returns New NDArray with the result
     * 
     * @example
     * const a = new NDArray([7, 8, 9], [3]);
     * const result = a.mod(3); // [1, 2, 0]
     */
    mod(other: NDArray | number): NDArray {
        return this._broadcastBinaryOp(other, (a, b) => {
            if (b === 0) {
                throw new Error('Modulo by zero');
            }
            return a % b;
        }, 'mod');
    }

    // ============================================================================
    // Axis-wise Operations
    // ============================================================================

    /**
     * Sum of array elements along specified axis
     * @param axis - Axis along which to sum (null for all elements)
     * @returns Sum value or NDArray with sums along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.sum() // 10 (sum of all elements)
     * a.sum(0) // NDArray([4, 6]) (column sums)
     * a.sum(1) // NDArray([3, 7]) (row sums)
     */
    sum(axis?: number | null): NDArray | number {
        if (axis === undefined || axis === null) {
            // Sum all elements
            let total = 0;
            for (let i = 0; i < this._data.length; i++) {
                total += this._data[i + this._offset]!;
            }
            return total;
        }

        return this._reduceAlongAxis(axis, (acc, val) => acc + val, 0);
    }

    /**
     * Mean of array elements along specified axis
     * @param axis - Axis along which to calculate mean (null for all elements)
     * @returns Mean value or NDArray with means along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.mean() // 2.5 (mean of all elements)
     * a.mean(0) // NDArray([2, 3]) (column means)
     * a.mean(1) // NDArray([1.5, 3.5]) (row means)
     */
    mean(axis?: number | null): NDArray | number {
        if (axis === undefined || axis === null) {
            // Mean of all elements
            const total = this.sum() as number;
            return total / this.size;
        }

        const sums = this.sum(axis) as NDArray;
        const counts = this._shape[axis]!;
        
        // Create result array with means
        const resultData = new (this._data.constructor as any)(sums.size);
        for (let i = 0; i < sums.size; i++) {
            resultData[i] = sums._data[i + sums._offset]! / counts;
        }

        return new NDArray(resultData, sums.shape, { dtype: this._dtype });
    }

    /**
     * Standard deviation of array elements along specified axis
     * @param axis - Axis along which to calculate std (null for all elements)
     * @param ddof - Delta degrees of freedom (default: 0)
     * @returns Standard deviation value or NDArray with std along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.std() // ~1.29 (std of all elements)
     * a.std(0) // NDArray([1, 1]) (column stds)
     * a.std(1) // NDArray([0.5, 0.5]) (row stds)
     */
    std(axis?: number | null, ddof: number = 0): NDArray | number {
        const variance = this.var(axis, ddof);
        
        if (typeof variance === 'number') {
            return Math.sqrt(variance);
        } else {
            const resultData = new (this._data.constructor as any)(variance.size);
            for (let i = 0; i < variance.size; i++) {
                resultData[i] = Math.sqrt(variance._data[i + variance._offset]!);
            }
            return new NDArray(resultData, variance.shape, { dtype: this._dtype });
        }
    }

    /**
     * Variance of array elements along specified axis
     * @param axis - Axis along which to calculate variance (null for all elements)
     * @param ddof - Delta degrees of freedom (default: 0)
     * @returns Variance value or NDArray with variances along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.var() // ~1.67 (variance of all elements)
     * a.var(0) // NDArray([1, 1]) (column variances)
     * a.var(1) // NDArray([0.25, 0.25]) (row variances)
     */
    var(axis?: number | null, ddof: number = 0): NDArray | number {
        if (axis === undefined || axis === null) {
            // Variance of all elements
            const meanValue = this.mean() as number;
            let sumSquaredDiffs = 0;
            
            for (let i = 0; i < this._data.length; i++) {
                const diff = this._data[i + this._offset]! - meanValue;
                sumSquaredDiffs += diff * diff;
            }
            
            const n = this.size;
            if (n <= ddof) {
                throw new InvalidParameterError('ddof', `less than array size (${n})`, ddof);
            }
            
            return sumSquaredDiffs / (n - ddof);
        }

        const means = this.mean(axis) as NDArray;
        const n = this._shape[axis]!;
        
        if (n <= ddof) {
            throw new InvalidParameterError('ddof', `less than axis size (${n})`, ddof);
        }

        // Calculate variance along axis
        const resultShape = [...this._shape];
        resultShape.splice(axis, 1);
        
        if (resultShape.length === 0) {
            resultShape.push(1);
        }
        
        const resultSize = resultShape.reduce((a, b) => a * b, 1);
        const resultData = new (this._data.constructor as any)(resultSize);
        
        // Iterate through result positions
        for (let resultIdx = 0; resultIdx < resultSize; resultIdx++) {
            const resultIndices = this._flatIndexToIndices(resultIdx, resultShape);
            const meanValue = means.get(...resultIndices);
            
            let sumSquaredDiffs = 0;
            
            // Sum squared differences along the specified axis
            for (let axisIdx = 0; axisIdx < this._shape[axis]!; axisIdx++) {
                const indices = [...resultIndices];
                indices.splice(axis, 0, axisIdx);
                
                const value = this.get(...indices);
                const diff = value - meanValue;
                sumSquaredDiffs += diff * diff;
            }
            
            resultData[resultIdx] = sumSquaredDiffs / (n - ddof);
        }

        return new NDArray(resultData, resultShape, { dtype: this._dtype });
    }

    /**
     * Minimum value along specified axis
     * @param axis - Axis along which to find minimum (null for all elements)
     * @returns Minimum value or NDArray with minimums along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.min() // 1 (min of all elements)
     * a.min(0) // NDArray([1, 2]) (column mins)
     * a.min(1) // NDArray([1, 3]) (row mins)
     */
    min(axis?: number | null): NDArray | number {
        if (axis === undefined || axis === null) {
            // Min of all elements
            let minValue = Infinity;
            for (let i = 0; i < this._data.length; i++) {
                const value = this._data[i + this._offset]!;
                if (value < minValue) {
                    minValue = value;
                }
            }
            return minValue;
        }

        return this._reduceAlongAxis(axis, (acc, val) => Math.min(acc, val), Infinity);
    }

    /**
     * Maximum value along specified axis
     * @param axis - Axis along which to find maximum (null for all elements)
     * @returns Maximum value or NDArray with maximums along axis
     * 
     * @example
     * const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
     * a.max() // 4 (max of all elements)
     * a.max(0) // NDArray([3, 4]) (column maxs)
     * a.max(1) // NDArray([2, 4]) (row maxs)
     */
    max(axis?: number | null): NDArray | number {
        if (axis === undefined || axis === null) {
            // Max of all elements
            let maxValue = -Infinity;
            for (let i = 0; i < this._data.length; i++) {
                const value = this._data[i + this._offset]!;
                if (value > maxValue) {
                    maxValue = value;
                }
            }
            return maxValue;
        }

        return this._reduceAlongAxis(axis, (acc, val) => Math.max(acc, val), -Infinity);
    }

    // ============================================================================
    // Private Helper Methods for Axis Operations
    // ============================================================================

    /**
     * Reduce along a specified axis using a reduction function
     * @param axis - Axis to reduce along
     * @param reduceFn - Reduction function (accumulator, value) => newAccumulator
     * @param initialValue - Initial value for the accumulator
     * @returns NDArray with reduced values
     */
    private _reduceAlongAxis(axis: number, reduceFn: (acc: number, val: number) => number, initialValue: number): NDArray {
        // Validate axis
        if (!Number.isInteger(axis) || axis < 0 || axis >= this.ndim) {
            throw new InvalidParameterError('axis', `integer between 0 and ${this.ndim - 1}`, axis);
        }

        // Calculate result shape (remove the reduced axis)
        const resultShape = [...this._shape];
        resultShape.splice(axis, 1);
        
        if (resultShape.length === 0) {
            resultShape.push(1);
        }
        
        const resultSize = resultShape.reduce((a, b) => a * b, 1);
        const resultData = new (this._data.constructor as any)(resultSize);
        
        // Iterate through result positions
        for (let resultIdx = 0; resultIdx < resultSize; resultIdx++) {
            const resultIndices = this._flatIndexToIndices(resultIdx, resultShape);
            
            let accumulator = initialValue;
            
            // Reduce along the specified axis
            for (let axisIdx = 0; axisIdx < this._shape[axis]!; axisIdx++) {
                const indices = [...resultIndices];
                indices.splice(axis, 0, axisIdx);
                
                const value = this.get(...indices);
                accumulator = reduceFn(accumulator, value);
            }
            
            resultData[resultIdx] = accumulator;
        }

        return new NDArray(resultData, resultShape, { dtype: this._dtype });
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