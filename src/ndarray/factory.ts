/**
 * Factory functions for creating NDArray instances
 * Provides NumPy-like array creation functions
 */

import { NDArray, type DType, type NDArrayOptions } from './ndarray.js';
import type { Shape } from '../types/common.js';
import { InvalidParameterError, DimensionError } from '../types/errors.js';
import { validateShape, validateFiniteNumber } from '../types/validation.js';

// ============================================================================
// Basic Factory Functions
// ============================================================================

/**
 * Create an array filled with zeros
 * @param shape - Shape of the array
 * @param options - Array creation options
 * @returns NDArray filled with zeros
 * 
 * @example
 * ```typescript
 * const arr = zeros([2, 3]); // 2x3 array of zeros
 * const arr2 = zeros([5], { dtype: 'int32' }); // 1D array of 5 zeros as int32
 * ```
 */
export function zeros(shape: Shape, options: NDArrayOptions = {}): NDArray {
    validateShape(shape);
    
    const { dtype = 'float64' } = options;
    const size = shape.reduce((acc, dim) => acc * dim, 1);
    
    // Create a typed array filled with zeros
    const data = createTypedArray(dtype, size);
    data.fill(0);
    
    return new NDArray(data, shape, options);
}

/**
 * Create an array filled with ones
 * @param shape - Shape of the array
 * @param options - Array creation options
 * @returns NDArray filled with ones
 * 
 * @example
 * ```typescript
 * const arr = ones([3, 2]); // 3x2 array of ones
 * const arr2 = ones([4], { dtype: 'float32' }); // 1D array of 4 ones as float32
 * ```
 */
export function ones(shape: Shape, options: NDArrayOptions = {}): NDArray {
    validateShape(shape);
    
    const { dtype = 'float64' } = options;
    const size = shape.reduce((acc, dim) => acc * dim, 1);
    
    // Create a typed array filled with ones
    const data = createTypedArray(dtype, size);
    data.fill(1);
    
    return new NDArray(data, shape, options);
}

/**
 * Create an array filled with a specific value
 * @param shape - Shape of the array
 * @param fillValue - Value to fill the array with
 * @param options - Array creation options
 * @returns NDArray filled with the specified value
 * 
 * @example
 * ```typescript
 * const arr = full([2, 2], 5); // 2x2 array filled with 5
 * const arr2 = full([3], -1.5, { dtype: 'float32' }); // 1D array filled with -1.5
 * ```
 */
export function full(shape: Shape, fillValue: number, options: NDArrayOptions = {}): NDArray {
    validateShape(shape);
    validateFiniteNumber(fillValue, 'fillValue');
    
    const { dtype = 'float64' } = options;
    const size = shape.reduce((acc, dim) => acc * dim, 1);
    
    // Create a typed array filled with the specified value
    const data = createTypedArray(dtype, size);
    data.fill(fillValue);
    
    return new NDArray(data, shape, options);
}

/**
 * Create an identity matrix (2D array with ones on the diagonal)
 * @param n - Size of the square matrix (n x n)
 * @param options - Array creation options
 * @returns NDArray representing an identity matrix
 * 
 * @example
 * ```typescript
 * const I = eye(3); // 3x3 identity matrix
 * const I2 = eye(4, { dtype: 'int32' }); // 4x4 identity matrix as int32
 * ```
 */
export function eye(n: number, options: NDArrayOptions = {}): NDArray {
    if (!Number.isInteger(n) || n <= 0) {
        throw new InvalidParameterError('n', 'positive integer', n);
    }
    
    const { dtype = 'float64' } = options;
    const shape: Shape = [n, n];
    const size = n * n;
    
    // Create a typed array filled with zeros
    const data = createTypedArray(dtype, size);
    data.fill(0);
    
    // Set diagonal elements to 1
    for (let i = 0; i < n; i++) {
        data[i * n + i] = 1;
    }
    
    return new NDArray(data, shape, options);
}

// ============================================================================
// Sequence Generation Functions
// ============================================================================

/**
 * Create an array with evenly spaced values within a given interval
 * @param start - Start of interval (inclusive)
 * @param stop - End of interval (exclusive)
 * @param step - Spacing between values (default: 1)
 * @param options - Array creation options
 * @returns 1D NDArray with evenly spaced values
 * 
 * @example
 * ```typescript
 * const arr = arange(0, 10, 2); // [0, 2, 4, 6, 8]
 * const arr2 = arange(5); // [0, 1, 2, 3, 4] (start=0, stop=5, step=1)
 * const arr3 = arange(1, 5, 0.5); // [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]
 * ```
 */
export function arange(start: number, stop?: number, step: number = 1, options: NDArrayOptions = {}): NDArray {
    // Handle single argument case: arange(stop)
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    
    validateFiniteNumber(start, 'start');
    validateFiniteNumber(stop, 'stop');
    validateFiniteNumber(step, 'step');
    
    if (step === 0) {
        throw new InvalidParameterError('step', 'non-zero number', step);
    }
    
    // Calculate the number of elements
    const numElements = Math.max(0, Math.ceil((stop - start) / step));
    
    if (numElements === 0) {
        // Create an empty array with shape [0] - this is valid for empty sequences
        const { dtype = 'float64' } = options;
        const data = createTypedArray(dtype, 0);
        // Use a minimal NDArray constructor approach for empty arrays
        const emptyArray = Object.create(NDArray.prototype) as NDArray;
        (emptyArray as any)._data = data;
        (emptyArray as any)._shape = [0];
        (emptyArray as any)._strides = [1];
        (emptyArray as any)._dtype = dtype;
        (emptyArray as any)._readonly = options.readonly || false;
        (emptyArray as any)._offset = 0;
        return emptyArray;
    }
    
    const { dtype = 'float64' } = options;
    const data = createTypedArray(dtype, numElements);
    
    // Fill the array with the sequence
    for (let i = 0; i < numElements; i++) {
        data[i] = start + i * step;
    }
    
    return new NDArray(data, [numElements], options);
}

/**
 * Create an array with evenly spaced values over a specified interval
 * @param start - Start of interval (inclusive)
 * @param stop - End of interval (inclusive)
 * @param num - Number of samples to generate (default: 50)
 * @param options - Array creation options
 * @returns 1D NDArray with evenly spaced values
 * 
 * @example
 * ```typescript
 * const arr = linspace(0, 1, 5); // [0, 0.25, 0.5, 0.75, 1]
 * const arr2 = linspace(-1, 1, 3); // [-1, 0, 1]
 * const arr3 = linspace(0, 10, 11); // [0, 1, 2, ..., 10]
 * ```
 */
export function linspace(start: number, stop: number, num: number = 50, options: NDArrayOptions = {}): NDArray {
    validateFiniteNumber(start, 'start');
    validateFiniteNumber(stop, 'stop');
    
    if (!Number.isInteger(num) || num <= 0) {
        throw new InvalidParameterError('num', 'positive integer', num);
    }
    
    const { dtype = 'float64' } = options;
    const data = createTypedArray(dtype, num);
    
    if (num === 1) {
        // Special case: only one point, use start value
        data[0] = start;
    } else {
        // Calculate step size
        const step = (stop - start) / (num - 1);
        
        // Fill the array with evenly spaced values
        for (let i = 0; i < num; i++) {
            data[i] = start + i * step;
        }
        
        // Ensure the last element is exactly stop (avoid floating point errors)
        data[num - 1] = stop;
    }
    
    return new NDArray(data, [num], options);
}

// ============================================================================
// Array Conversion Functions
// ============================================================================

/**
 * Create an NDArray from an existing nested array
 * @param array - Nested array data (number, number[], number[][], etc.)
 * @param options - Array creation options
 * @returns NDArray created from the input array
 * 
 * @example
 * ```typescript
 * const arr1 = fromArray([1, 2, 3, 4]); // 1D array
 * const arr2 = fromArray([[1, 2], [3, 4]]); // 2x2 array
 * const arr3 = fromArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]); // 2x2x2 array
 * ```
 */
export function fromArray(array: number | number[] | number[][] | number[][][], options: NDArrayOptions = {}): NDArray {
    // Handle scalar case
    if (typeof array === 'number') {
        return createScalarNDArray(array, options);
    }
    
    // Determine the shape of the input array
    const shape = inferShape(array);
    
    // Create the NDArray using the existing constructor
    return new NDArray(array, shape, options);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a typed array of the specified dtype and size
 */
function createTypedArray(dtype: DType, size: number): Float64Array | Float32Array | Int32Array | Int16Array | Int8Array | Uint32Array | Uint16Array | Uint8Array {
    switch (dtype) {
        case 'float64': return new Float64Array(size);
        case 'float32': return new Float32Array(size);
        case 'int32': return new Int32Array(size);
        case 'int16': return new Int16Array(size);
        case 'int8': return new Int8Array(size);
        case 'uint32': return new Uint32Array(size);
        case 'uint16': return new Uint16Array(size);
        case 'uint8': return new Uint8Array(size);
        default:
            throw new InvalidParameterError('dtype', 'valid data type', dtype);
    }
}

/**
 * Infer the shape of a nested array
 */
function inferShape(array: number | number[] | number[][] | number[][][]): Shape {
    if (typeof array === 'number') {
        return []; // Scalar (0-dimensional)
    }
    
    if (!Array.isArray(array)) {
        throw new InvalidParameterError('array', 'number or array', typeof array);
    }
    
    const shape: number[] = [];
    let current: any = array;
    
    while (Array.isArray(current)) {
        shape.push(current.length);
        
        if (current.length === 0) {
            break; // Empty array
        }
        
        // Check that all elements at this level have the same length
        if (Array.isArray(current[0])) {
            const expectedLength = current[0].length;
            for (let i = 1; i < current.length; i++) {
                if (!Array.isArray(current[i]) || current[i].length !== expectedLength) {
                    throw new DimensionError(
                        `Inconsistent array dimensions at level ${shape.length}`,
                        [expectedLength],
                        [Array.isArray(current[i]) ? current[i].length : 'not array']
                    );
                }
            }
        } else {
            // This level contains non-array elements, check they're all numbers
            for (let i = 0; i < current.length; i++) {
                if (typeof current[i] !== 'number') {
                    throw new InvalidParameterError(`array[${i}]`, 'number', typeof current[i]);
                }
            }
            break;
        }
        
        current = current[0];
    }
    
    return shape;
}

/**
 * Create a scalar NDArray (0-dimensional)
 */
function createScalarNDArray(value: number, options: NDArrayOptions = {}): NDArray {
    const { dtype = 'float64', readonly = false } = options;
    
    // Create a single-element typed array
    const data = createTypedArray(dtype, 1);
    data[0] = value;
    
    // Create NDArray with empty shape (scalar)
    const scalar = Object.create(NDArray.prototype) as NDArray;
    (scalar as any)._data = data;
    (scalar as any)._shape = [];
    (scalar as any)._strides = [];
    (scalar as any)._dtype = dtype;
    (scalar as any)._readonly = readonly;
    (scalar as any)._offset = 0;
    
    return scalar;
}
/**

 * Create an array filled with random values between 0 and 1
 * @param shape - Shape of the array
 * @param options - Array creation options
 * @returns NDArray filled with random values
 * 
 * @example
 * ```typescript
 * const arr = random([2, 3]); // 2x3 array of random values
 * const arr2 = random([5], { dtype: 'float32' }); // 1D array of 5 random values as float32
 * ```
 */
export function random(shape: Shape, options: NDArrayOptions = {}): NDArray {
    validateShape(shape);
    
    const { dtype = 'float64' } = options;
    const size = shape.reduce((acc, dim) => acc * dim, 1);
    
    // Create a typed array filled with random values
    const data = createTypedArray(dtype, size);
    for (let i = 0; i < size; i++) {
        data[i] = Math.random();
    }
    
    return new NDArray(data, shape, options);
}