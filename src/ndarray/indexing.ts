/**
 * Advanced indexing and slicing functionality for NDArray
 * Provides NumPy-like indexing capabilities including fancy indexing and boolean indexing
 */

import { NDArray } from './ndarray.js';
import type { Shape } from '../types/common.js';
import {
    DimensionError,
    InvalidParameterError,
    IndexOutOfBoundsError
} from '../types/errors.js';
import { validateFiniteNumber } from '../types/validation.js';

// ============================================================================
// Type Definitions for Indexing
// ============================================================================

/** Single index specification */
export type SingleIndex = number;

/** Range slice specification [start, end] or [start, end, step] */
export type RangeSlice = [number, number] | [number, number, number];

/** Slice specification - can be a single index or range */
export type SliceSpec = SingleIndex | RangeSlice;

/** String-based slice specification (e.g., "1:5", ":-1", "::2") */
export type StringSlice = string;

/** Array of indices for fancy indexing */
export type IndexArray = number[];

/** Boolean array for boolean indexing */
export type BooleanArray = boolean[];

/** Combined indexing specification */
export type IndexSpec = SliceSpec | StringSlice | IndexArray | BooleanArray;

// ============================================================================
// Enhanced NDArray Methods (to be added to NDArray class)
// ============================================================================

/**
 * Enhanced get method that supports various indexing patterns
 * This extends the basic get method in NDArray with more flexible indexing
 */
export function enhancedGet(array: NDArray, ...indices: (number | string)[]): NDArray | number {
    // If all indices are numbers, use the basic get method for single element access
    if (indices.every(idx => typeof idx === 'number')) {
        return array.get(...(indices as number[]));
    }

    // Parse string-based slices and convert to SliceSpec
    const parsedIndices: SliceSpec[] = indices.map(idx => {
        if (typeof idx === 'string') {
            return parseStringSlice(idx);
        }
        return idx as number;
    });

    // Use the slice method for multi-dimensional slicing
    return array.slice(...parsedIndices);
}

/**
 * Enhanced set method that supports various indexing patterns
 * This extends the basic set method in NDArray with more flexible indexing
 */
export function enhancedSet(array: NDArray, value: number | NDArray, ...indices: (number | string)[]): void {
    // If all indices are numbers and value is a number, use basic set method
    if (indices.every(idx => typeof idx === 'number') && typeof value === 'number') {
        array.set(...(indices as number[]), value);
        return;
    }

    // For more complex indexing, we need to implement assignment to slices
    // This is a more advanced feature that would require additional implementation
    throw new InvalidParameterError('indexing', 'basic numeric indices for assignment', 'complex indexing');
}

// ============================================================================
// String Slice Parsing
// ============================================================================

/**
 * Parse a string slice specification into a RangeSlice
 * Supports formats like "1:5", ":-1", "::2", "1:5:2", etc.
 * 
 * @param sliceStr - String slice specification
 * @returns Parsed RangeSlice
 * 
 * @example
 * ```typescript
 * parseStringSlice("1:5")    // [1, 5]
 * parseStringSlice(":-1")    // [0, -1]
 * parseStringSlice("::2")    // [0, undefined, 2] -> handled as [0, Infinity, 2]
 * parseStringSlice("1:5:2")  // [1, 5, 2]
 * ```
 */
export function parseStringSlice(sliceStr: string): RangeSlice {
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
        const index = parseSliceNumber(parts[0]!, 0);
        throw new InvalidParameterError('sliceStr', 'slice notation (e.g., "1:5")', `single index: ${index}`);
    }

    if (parts.length === 2) {
        // Format: "start:end"
        const start = parseSliceNumber(parts[0]!, 0);
        const end = parseSliceNumber(parts[1]!, Infinity);
        return [start, end];
    }

    if (parts.length === 3) {
        // Format: "start:end:step"
        const start = parseSliceNumber(parts[0]!, 0);
        const end = parseSliceNumber(parts[1]!, Infinity);
        const step = parseSliceNumber(parts[2]!, 1);

        if (step === 0) {
            throw new InvalidParameterError('step', 'non-zero integer', step);
        }

        return [start, end, step];
    }

    throw new InvalidParameterError('sliceStr', 'valid slice format (start:end or start:end:step)', sliceStr);
}

/**
 * Parse a single number from a slice string part
 * Handles empty strings with default values
 */
function parseSliceNumber(str: string, defaultValue: number): number {
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

// ============================================================================
// Index Validation and Normalization
// ============================================================================

/**
 * Normalize a single index for a given dimension size
 * Handles negative indexing (e.g., -1 for last element)
 * 
 * @param index - The index to normalize
 * @param dimSize - Size of the dimension
 * @param dimIndex - Which dimension this is (for error messages)
 * @returns Normalized index (always positive)
 */
export function normalizeIndex(index: number, dimSize: number, dimIndex?: number): number {
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
 * 
 * @param slice - The range slice to normalize
 * @param dimSize - Size of the dimension
 * @param dimIndex - Which dimension this is (for error messages)
 * @returns Normalized range slice with positive indices
 */
export function normalizeRangeSlice(slice: RangeSlice, dimSize: number, dimIndex?: number): [number, number, number] {
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

    // Ensure start and end are within valid bounds
    start = Math.max(0, Math.min(start, dimSize - 1));
    end = Math.max(-1, Math.min(end, dimSize));

    return [start, end, step];
}

// ============================================================================
// Advanced Indexing Utilities
// ============================================================================

/**
 * Validate an array of indices for fancy indexing
 * Ensures all indices are valid integers within bounds
 * 
 * @param indices - Array of indices
 * @param dimSize - Size of the dimension being indexed
 * @param dimIndex - Which dimension this is (for error messages)
 * @returns Normalized array of indices
 */
export function validateIndexArray(indices: IndexArray, dimSize: number, dimIndex?: number): number[] {
    if (!Array.isArray(indices)) {
        throw new InvalidParameterError('indices', 'array of integers', typeof indices);
    }

    return indices.map((idx, i) => {
        if (!Number.isInteger(idx)) {
            throw new InvalidParameterError(`indices[${i}]`, 'integer', idx);
        }
        return normalizeIndex(idx, dimSize, dimIndex);
    });
}

/**
 * Validate a boolean array for boolean indexing
 * Ensures the array has the correct length and contains only booleans
 * 
 * @param boolArray - Boolean array for indexing
 * @param expectedLength - Expected length of the boolean array
 * @returns Validated boolean array
 */
export function validateBooleanArray(boolArray: BooleanArray, expectedLength: number): boolean[] {
    if (!Array.isArray(boolArray)) {
        throw new InvalidParameterError('boolArray', 'array of booleans', typeof boolArray);
    }

    if (boolArray.length !== expectedLength) {
        throw new DimensionError(
            'Boolean array length mismatch',
            [expectedLength],
            [boolArray.length],
            'boolean_indexing'
        );
    }

    // Validate that all elements are booleans
    for (let i = 0; i < boolArray.length; i++) {
        if (typeof boolArray[i] !== 'boolean') {
            throw new InvalidParameterError(`boolArray[${i}]`, 'boolean', typeof boolArray[i]);
        }
    }

    return boolArray;
}

/**
 * Convert a boolean array to an array of indices where the boolean is true
 * This is used internally for boolean indexing
 * 
 * @param boolArray - Boolean array
 * @returns Array of indices where the boolean array is true
 */
export function booleanToIndices(boolArray: boolean[]): number[] {
    const indices: number[] = [];
    
    for (let i = 0; i < boolArray.length; i++) {
        if (boolArray[i]) {
            indices.push(i);
        }
    }
    
    return indices;
}

// ============================================================================
// Indexing Pattern Detection
// ============================================================================

/**
 * Determine the type of indexing being used
 * This helps route to the appropriate indexing implementation
 */
export function detectIndexingType(spec: IndexSpec): 'single' | 'range' | 'string' | 'fancy' | 'boolean' {
    if (typeof spec === 'number') {
        return 'single';
    }
    
    if (typeof spec === 'string') {
        return 'string';
    }
    
    if (Array.isArray(spec)) {
        if (spec.length === 0) {
            throw new InvalidParameterError('indexSpec', 'non-empty array', 'empty array');
        }
        
        // Check if it's a range slice [start, end] or [start, end, step]
        if (spec.length >= 2 && spec.length <= 3 && spec.every(x => typeof x === 'number')) {
            return 'range';
        }
        
        // Check if it's a boolean array
        if (spec.every(x => typeof x === 'boolean')) {
            return 'boolean';
        }
        
        // Check if it's an index array (fancy indexing)
        if (spec.every(x => typeof x === 'number' && Number.isInteger(x))) {
            return 'fancy';
        }
        
        throw new InvalidParameterError('indexSpec', 'homogeneous array of numbers or booleans', 'mixed types');
    }
    
    throw new InvalidParameterError('indexSpec', 'number, string, or array', typeof spec);
}

// ============================================================================
// Advanced Slicing Operations
// ============================================================================

/**
 * Apply a slice specification to an NDArray dimension
 * This is used internally by the NDArray slice method
 * 
 * @param array - The NDArray to slice
 * @param dimIndex - Which dimension to slice
 * @param sliceSpec - The slice specification
 * @returns Information about the slice (new size, offset, stride)
 */
export function applySliceToDimension(
    array: NDArray,
    dimIndex: number,
    sliceSpec: SliceSpec | StringSlice
): { size: number; offset: number; stride: number } {
    const dimSize = array.shape[dimIndex]!;
    const originalStride = array.strides[dimIndex]!;

    if (typeof sliceSpec === 'number') {
        // Single index - dimension is eliminated
        const normalizedIndex = normalizeIndex(sliceSpec, dimSize, dimIndex);
        return {
            size: 0, // Dimension is eliminated
            offset: normalizedIndex * originalStride,
            stride: originalStride
        };
    }

    if (typeof sliceSpec === 'string') {
        // Parse string slice
        const rangeSlice = parseStringSlice(sliceSpec);
        return applyRangeSlice(rangeSlice, dimSize, originalStride, dimIndex);
    }

    if (Array.isArray(sliceSpec)) {
        // Range slice
        return applyRangeSlice(sliceSpec as RangeSlice, dimSize, originalStride, dimIndex);
    }

    throw new InvalidParameterError('sliceSpec', 'number, string, or array', typeof sliceSpec);
}

/**
 * Apply a range slice to a dimension
 */
function applyRangeSlice(
    rangeSlice: RangeSlice,
    dimSize: number,
    originalStride: number,
    dimIndex?: number
): { size: number; offset: number; stride: number } {
    const [start, end, step] = normalizeRangeSlice(rangeSlice, dimSize, dimIndex);

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
 * Enhanced slice method that supports string-based slicing syntax
 * This extends the basic slice functionality with more NumPy-like syntax
 * 
 * @param array - The NDArray to slice
 * @param slices - Array of slice specifications (mix of numbers, strings, and arrays)
 * @returns A new NDArray view of the sliced data
 */
export function enhancedSlice(
    array: NDArray,
    ...slices: Array<number | string | [number, number] | [number, number, number]>
): NDArray {
    if (slices.length > array.ndim) {
        throw new DimensionError(
            `Too many slice dimensions (${slices.length}) for array with ${array.ndim} dimensions`,
            [array.ndim],
            [slices.length]
        );
    }

    const newShape: number[] = [];
    const newStrides: number[] = [];
    let newOffset = (array as any)._offset || 0;

    // Process each dimension
    for (let i = 0; i < array.ndim; i++) {
        if (i < slices.length) {
            const slice = slices[i]!;
            const sliceResult = applySliceToDimension(array, i, slice);

            if (sliceResult.size > 0) {
                // Dimension is preserved
                newShape.push(sliceResult.size);
                newStrides.push(sliceResult.stride);
            }
            // If size is 0, dimension is eliminated (don't add to shape/strides)

            newOffset += sliceResult.offset;
        } else {
            // No slice specified for this dimension - include entire dimension
            newShape.push(array.shape[i]!);
            newStrides.push(array.strides[i]!);
        }
    }

    // Create a new NDArray that shares the same data buffer
    const sliced = Object.create(NDArray.prototype) as NDArray;

    // Share the same data buffer with new offset
    (sliced as any)._data = (array as any)._data;
    (sliced as any)._offset = newOffset;
    (sliced as any)._dtype = array.dtype;
    (sliced as any)._readonly = array.readonly;

    // Set new shape and strides
    (sliced as any)._shape = newShape;
    (sliced as any)._strides = newStrides;

    return sliced;
}

// ============================================================================
// Common Indexing Patterns
// ============================================================================

/**
 * Create a slice that selects all elements in a dimension
 * Equivalent to ":" in NumPy
 */
export function fullSlice(): RangeSlice {
    return [0, Infinity];
}

/**
 * Create a slice that selects elements in reverse order
 * Equivalent to "::-1" in NumPy
 */
export function reverseSlice(): RangeSlice {
    return [Infinity, -Infinity, -1];
}

/**
 * Create a slice that selects every nth element
 * Equivalent to "::n" in NumPy
 */
export function stepSlice(step: number): RangeSlice {
    if (step === 0) {
        throw new InvalidParameterError('step', 'non-zero integer', step);
    }
    
    if (step > 0) {
        return [0, Infinity, step];
    } else {
        return [Infinity, -Infinity, step];
    }
}

/**
 * Create a slice from start to end (exclusive)
 * Equivalent to "start:end" in NumPy
 */
export function rangeSlice(start: number, end: number): RangeSlice {
    return [start, end];
}

/**
 * Create a slice from start to end with step
 * Equivalent to "start:end:step" in NumPy
 */
export function rangeSliceWithStep(start: number, end: number, step: number): RangeSlice {
    if (step === 0) {
        throw new InvalidParameterError('step', 'non-zero integer', step);
    }
    return [start, end, step];
}