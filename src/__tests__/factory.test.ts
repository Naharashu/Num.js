/**
 * Tests for NDArray factory functions
 */

import { describe, it, expect } from 'vitest';
import { zeros, ones, full, eye, arange, linspace, fromArray } from '../ndarray/factory.js';
import { NDArray } from '../ndarray/ndarray.js';
import { InvalidParameterError, DimensionError } from '../types/errors.js';

describe('NDArray Factory Functions', () => {
    describe('zeros', () => {
        it('should create 1D array of zeros', () => {
            const arr = zeros([5]);
            expect(arr.shape).toEqual([5]);
            expect(arr.dtype).toBe('float64');
            expect(arr.size).toBe(5);
            
            // Check all elements are zero
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBe(0);
            }
        });

        it('should create 2D array of zeros', () => {
            const arr = zeros([2, 3]);
            expect(arr.shape).toEqual([2, 3]);
            expect(arr.size).toBe(6);
            
            // Check all elements are zero
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(arr.get(i, j)).toBe(0);
                }
            }
        });

        it('should create 3D array of zeros', () => {
            const arr = zeros([2, 2, 2]);
            expect(arr.shape).toEqual([2, 2, 2]);
            expect(arr.size).toBe(8);
            
            // Check all elements are zero
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    for (let k = 0; k < 2; k++) {
                        expect(arr.get(i, j, k)).toBe(0);
                    }
                }
            }
        });

        it('should respect dtype option', () => {
            const arr = zeros([3], { dtype: 'int32' });
            expect(arr.dtype).toBe('int32');
        });

        it('should respect readonly option', () => {
            const arr = zeros([3], { readonly: true });
            expect(arr.readonly).toBe(true);
        });

        it('should throw error for invalid shape', () => {
            expect(() => zeros([])).toThrow();
            expect(() => zeros([0])).toThrow();
            expect(() => zeros([-1])).toThrow();
        });
    });

    describe('ones', () => {
        it('should create 1D array of ones', () => {
            const arr = ones([4]);
            expect(arr.shape).toEqual([4]);
            expect(arr.size).toBe(4);
            
            // Check all elements are one
            for (let i = 0; i < 4; i++) {
                expect(arr.get(i)).toBe(1);
            }
        });

        it('should create 2D array of ones', () => {
            const arr = ones([3, 2]);
            expect(arr.shape).toEqual([3, 2]);
            expect(arr.size).toBe(6);
            
            // Check all elements are one
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(arr.get(i, j)).toBe(1);
                }
            }
        });

        it('should respect dtype option', () => {
            const arr = ones([2], { dtype: 'float32' });
            expect(arr.dtype).toBe('float32');
        });
    });

    describe('full', () => {
        it('should create array filled with specified value', () => {
            const arr = full([3], 5);
            expect(arr.shape).toEqual([3]);
            
            // Check all elements are 5
            for (let i = 0; i < 3; i++) {
                expect(arr.get(i)).toBe(5);
            }
        });

        it('should work with negative values', () => {
            const arr = full([2, 2], -2.5);
            expect(arr.shape).toEqual([2, 2]);
            
            // Check all elements are -2.5
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    expect(arr.get(i, j)).toBe(-2.5);
                }
            }
        });

        it('should throw error for non-finite fill value', () => {
            expect(() => full([2], NaN)).toThrow(InvalidParameterError);
            expect(() => full([2], Infinity)).toThrow(InvalidParameterError);
        });
    });

    describe('eye', () => {
        it('should create 2x2 identity matrix', () => {
            const arr = eye(2);
            expect(arr.shape).toEqual([2, 2]);
            
            expect(arr.get(0, 0)).toBe(1);
            expect(arr.get(0, 1)).toBe(0);
            expect(arr.get(1, 0)).toBe(0);
            expect(arr.get(1, 1)).toBe(1);
        });

        it('should create 3x3 identity matrix', () => {
            const arr = eye(3);
            expect(arr.shape).toEqual([3, 3]);
            
            // Check diagonal elements are 1
            for (let i = 0; i < 3; i++) {
                expect(arr.get(i, i)).toBe(1);
            }
            
            // Check off-diagonal elements are 0
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i !== j) {
                        expect(arr.get(i, j)).toBe(0);
                    }
                }
            }
        });

        it('should respect dtype option', () => {
            const arr = eye(2, { dtype: 'int32' });
            expect(arr.dtype).toBe('int32');
        });

        it('should throw error for invalid size', () => {
            expect(() => eye(0)).toThrow(InvalidParameterError);
            expect(() => eye(-1)).toThrow(InvalidParameterError);
            expect(() => eye(1.5)).toThrow(InvalidParameterError);
        });
    });

    describe('arange', () => {
        it('should create range from 0 to n', () => {
            const arr = arange(5);
            expect(arr.shape).toEqual([5]);
            
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBe(i);
            }
        });

        it('should create range with start and stop', () => {
            const arr = arange(2, 7);
            expect(arr.shape).toEqual([5]);
            
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBe(2 + i);
            }
        });

        it('should create range with step', () => {
            const arr = arange(0, 10, 2);
            expect(arr.shape).toEqual([5]);
            
            const expected = [0, 2, 4, 6, 8];
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBe(expected[i]!);
            }
        });

        it('should handle fractional step', () => {
            const arr = arange(0, 2, 0.5);
            expect(arr.shape).toEqual([4]);
            
            const expected = [0, 0.5, 1, 1.5];
            for (let i = 0; i < 4; i++) {
                expect(arr.get(i)).toBeCloseTo(expected[i]!);
            }
        });

        it('should handle negative step', () => {
            const arr = arange(5, 0, -1);
            expect(arr.shape).toEqual([5]);
            
            const expected = [5, 4, 3, 2, 1];
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBe(expected[i]!);
            }
        });

        it('should return empty array when range is invalid', () => {
            const arr = arange(5, 2, 1); // start > stop with positive step
            expect(arr.shape).toEqual([0]);
            expect(arr.size).toBe(0);
        });

        it('should throw error for zero step', () => {
            expect(() => arange(0, 5, 0)).toThrow(InvalidParameterError);
        });
    });

    describe('linspace', () => {
        it('should create evenly spaced values', () => {
            const arr = linspace(0, 1, 5);
            expect(arr.shape).toEqual([5]);
            
            const expected = [0, 0.25, 0.5, 0.75, 1];
            for (let i = 0; i < 5; i++) {
                expect(arr.get(i)).toBeCloseTo(expected[i]!);
            }
        });

        it('should handle negative range', () => {
            const arr = linspace(-1, 1, 3);
            expect(arr.shape).toEqual([3]);
            
            const expected = [-1, 0, 1];
            for (let i = 0; i < 3; i++) {
                expect(arr.get(i)).toBeCloseTo(expected[i]!);
            }
        });

        it('should handle single point', () => {
            const arr = linspace(5, 10, 1);
            expect(arr.shape).toEqual([1]);
            expect(arr.get(0)).toBe(5);
        });

        it('should use default num=50', () => {
            const arr = linspace(0, 1);
            expect(arr.shape).toEqual([50]);
            expect(arr.get(0)).toBe(0);
            expect(arr.get(49)).toBe(1);
        });

        it('should throw error for invalid num', () => {
            expect(() => linspace(0, 1, 0)).toThrow(InvalidParameterError);
            expect(() => linspace(0, 1, -1)).toThrow(InvalidParameterError);
            expect(() => linspace(0, 1, 1.5)).toThrow(InvalidParameterError);
        });
    });

    describe('fromArray', () => {
        it('should create NDArray from 1D array', () => {
            const arr = fromArray([1, 2, 3, 4]);
            expect(arr.shape).toEqual([4]);
            
            for (let i = 0; i < 4; i++) {
                expect(arr.get(i)).toBe(i + 1);
            }
        });

        it('should create NDArray from 2D array', () => {
            const arr = fromArray([[1, 2], [3, 4]]);
            expect(arr.shape).toEqual([2, 2]);
            
            expect(arr.get(0, 0)).toBe(1);
            expect(arr.get(0, 1)).toBe(2);
            expect(arr.get(1, 0)).toBe(3);
            expect(arr.get(1, 1)).toBe(4);
        });

        it('should create NDArray from 3D array', () => {
            const arr = fromArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
            expect(arr.shape).toEqual([2, 2, 2]);
            
            expect(arr.get(0, 0, 0)).toBe(1);
            expect(arr.get(0, 0, 1)).toBe(2);
            expect(arr.get(0, 1, 0)).toBe(3);
            expect(arr.get(0, 1, 1)).toBe(4);
            expect(arr.get(1, 0, 0)).toBe(5);
            expect(arr.get(1, 0, 1)).toBe(6);
            expect(arr.get(1, 1, 0)).toBe(7);
            expect(arr.get(1, 1, 1)).toBe(8);
        });

        it('should create NDArray from scalar', () => {
            const arr = fromArray(42);
            expect(arr.shape).toEqual([]);
            expect(arr.ndim).toBe(0);
            expect(arr.size).toBe(1);
            // For scalars, we need to access with no indices
            // This might need to be implemented in the NDArray class
        });

        it('should respect dtype option', () => {
            const arr = fromArray([1, 2, 3], { dtype: 'int32' });
            expect(arr.dtype).toBe('int32');
        });

        it('should throw error for inconsistent dimensions', () => {
            expect(() => fromArray([[1, 2], [3]])).toThrow(DimensionError);
            expect(() => fromArray([[[1, 2], [3, 4]], [[5], [7, 8]]])).toThrow(DimensionError);
        });

        it('should throw error for non-numeric elements', () => {
            expect(() => fromArray(['a', 'b'] as any)).toThrow(InvalidParameterError);
            expect(() => fromArray([[1, 2], [3, 'invalid']] as any)).toThrow(DimensionError);
        });
    });

    describe('Integration tests', () => {
        it('should create arrays that work with NDArray methods', () => {
            const arr = ones([2, 3]);
            const reshaped = arr.reshape([3, 2]);
            expect(reshaped.shape).toEqual([3, 2]);
            
            const transposed = arr.transpose();
            expect(transposed.shape).toEqual([3, 2]);
        });

        it('should create arrays with different dtypes', () => {
            const float64Arr = zeros([2], { dtype: 'float64' });
            const int32Arr = ones([2], { dtype: 'int32' });
            const float32Arr = full([2], 3.14, { dtype: 'float32' });
            
            expect(float64Arr.dtype).toBe('float64');
            expect(int32Arr.dtype).toBe('int32');
            expect(float32Arr.dtype).toBe('float32');
        });

        it('should handle edge cases gracefully', () => {
            // Single element arrays
            const single = ones([1]);
            expect(single.size).toBe(1);
            expect(single.get(0)).toBe(1);
            
            // Large arrays
            const large = zeros([1000]);
            expect(large.size).toBe(1000);
            expect(large.get(999)).toBe(0);
        });
    });
});