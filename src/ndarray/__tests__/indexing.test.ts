/**
 * Tests for NDArray indexing functionality
 */

import { describe, it, expect } from 'vitest';
import { NDArray } from '../ndarray.js';
import { zeros, ones, fromArray } from '../factory.js';
import {
    parseStringSlice,
    normalizeIndex,
    normalizeRangeSlice,
    validateIndexArray,
    validateBooleanArray,
    booleanToIndices,
    detectIndexingType,
    fullSlice,
    reverseSlice,
    stepSlice
} from '../indexing.js';
import {
    DimensionError,
    InvalidParameterError,
    IndexOutOfBoundsError
} from '../../types/errors.js';

describe('NDArray Range Slicing', () => {
    describe('Basic range slicing', () => {
        it('should slice 1D arrays with basic ranges', () => {
            const arr = fromArray([0, 1, 2, 3, 4, 5]);
            
            // Test basic range [1:4]
            const slice1 = arr.sliceAdvanced('1:4') as NDArray;
            expect(slice1.shape).toEqual([3]);
            expect(slice1.get(0)).toBe(1);
            expect(slice1.get(1)).toBe(2);
            expect(slice1.get(2)).toBe(3);
            
            // Test range with negative end [2:-1]
            const slice2 = arr.sliceAdvanced('2:-1') as NDArray;
            expect(slice2.shape).toEqual([3]);
            expect(slice2.get(0)).toBe(2);
            expect(slice2.get(1)).toBe(3);
            expect(slice2.get(2)).toBe(4);
        });

        it('should slice 1D arrays with step', () => {
            const arr = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            
            // Test step slicing [::2]
            const slice1 = arr.sliceAdvanced('::2') as NDArray;
            expect(slice1.shape).toEqual([5]);
            expect(slice1.get(0)).toBe(0);
            expect(slice1.get(1)).toBe(2);
            expect(slice1.get(2)).toBe(4);
            expect(slice1.get(3)).toBe(6);
            expect(slice1.get(4)).toBe(8);
            
            // Test range with step [1:8:2]
            const slice2 = arr.sliceAdvanced('1:8:2') as NDArray;
            expect(slice2.shape).toEqual([4]);
            expect(slice2.get(0)).toBe(1);
            expect(slice2.get(1)).toBe(3);
            expect(slice2.get(2)).toBe(5);
            expect(slice2.get(3)).toBe(7);
        });

        it('should slice 1D arrays in reverse', () => {
            const arr = fromArray([0, 1, 2, 3, 4]);
            
            // Test reverse slicing [::-1]
            const slice1 = arr.sliceAdvanced('::-1') as NDArray;
            expect(slice1.shape).toEqual([5]);
            expect(slice1.get(0)).toBe(4);
            expect(slice1.get(1)).toBe(3);
            expect(slice1.get(2)).toBe(2);
            expect(slice1.get(3)).toBe(1);
            expect(slice1.get(4)).toBe(0);
            
            // Test partial reverse [3:0:-1]
            const slice2 = arr.sliceAdvanced('3:0:-1') as NDArray;
            expect(slice2.shape).toEqual([3]);
            expect(slice2.get(0)).toBe(3);
            expect(slice2.get(1)).toBe(2);
            expect(slice2.get(2)).toBe(1);
        });

        it('should slice 2D arrays', () => {
            const arr = fromArray([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
            
            // Test row slicing [1:3, :]
            const slice1 = arr.sliceAdvanced('1:3', ':') as NDArray;
            expect(slice1.shape).toEqual([2, 4]);
            expect(slice1.get(0, 0)).toBe(5);
            expect(slice1.get(0, 3)).toBe(8);
            expect(slice1.get(1, 0)).toBe(9);
            expect(slice1.get(1, 3)).toBe(12);
            
            // Test column slicing [:, 1:3]
            const slice2 = arr.sliceAdvanced(':', '1:3') as NDArray;
            expect(slice2.shape).toEqual([3, 2]);
            expect(slice2.get(0, 0)).toBe(2);
            expect(slice2.get(0, 1)).toBe(3);
            expect(slice2.get(2, 0)).toBe(10);
            expect(slice2.get(2, 1)).toBe(11);
            
            // Test both dimensions [1:3, 1:3]
            const slice3 = arr.sliceAdvanced('1:3', '1:3') as NDArray;
            expect(slice3.shape).toEqual([2, 2]);
            expect(slice3.get(0, 0)).toBe(6);
            expect(slice3.get(0, 1)).toBe(7);
            expect(slice3.get(1, 0)).toBe(10);
            expect(slice3.get(1, 1)).toBe(11);
        });

        it('should handle single index slicing (dimension elimination)', () => {
            const arr = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            
            // Test single row selection [1, :]
            const slice1 = arr.sliceAdvanced(1, ':') as NDArray;
            expect(slice1.shape).toEqual([3]);
            expect(slice1.get(0)).toBe(4);
            expect(slice1.get(1)).toBe(5);
            expect(slice1.get(2)).toBe(6);
            
            // Test single column selection [:, 1]
            const slice2 = arr.sliceAdvanced(':', 1) as NDArray;
            expect(slice2.shape).toEqual([3]);
            expect(slice2.get(0)).toBe(2);
            expect(slice2.get(1)).toBe(5);
            expect(slice2.get(2)).toBe(8);
        });

        it('should handle empty slices', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            // Test empty slice [5:5]
            const slice1 = arr.sliceAdvanced('5:5') as NDArray;
            expect(slice1.shape).toEqual([0]);
            
            // Test empty slice with step [1:1:2]
            const slice2 = arr.sliceAdvanced('1:1:2') as NDArray;
            expect(slice2.shape).toEqual([0]);
        });
    });

    describe('Advanced range slicing', () => {
        it('should handle complex multi-dimensional slicing', () => {
            // Create a 3D array
            const arr = fromArray([
                [[1, 2], [3, 4]],
                [[5, 6], [7, 8]],
                [[9, 10], [11, 12]]
            ]);
            
            // Test 3D slicing [1:3, :, 0]
            const slice1 = arr.sliceAdvanced('1:3', ':', 0) as NDArray;
            expect(slice1.shape).toEqual([2, 2]);
            expect(slice1.get(0, 0)).toBe(5);
            expect(slice1.get(0, 1)).toBe(7);
            expect(slice1.get(1, 0)).toBe(9);
            expect(slice1.get(1, 1)).toBe(11);
        });

        it('should handle step slicing in multiple dimensions', () => {
            const arr = fromArray([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
            
            // Test step slicing in both dimensions [::2, ::2]
            const slice1 = arr.sliceAdvanced('::2', '::2') as NDArray;
            expect(slice1.shape).toEqual([2, 2]);
            expect(slice1.get(0, 0)).toBe(1);
            expect(slice1.get(0, 1)).toBe(3);
            expect(slice1.get(1, 0)).toBe(9);
            expect(slice1.get(1, 1)).toBe(11);
        });

        it('should handle negative step slicing', () => {
            const arr = fromArray([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12]
            ]);
            
            // Test reverse row order [::-1, :]
            const slice1 = arr.sliceAdvanced('::-1', ':') as NDArray;
            expect(slice1.shape).toEqual([3, 4]);
            expect(slice1.get(0, 0)).toBe(9);
            expect(slice1.get(0, 3)).toBe(12);
            expect(slice1.get(2, 0)).toBe(1);
            expect(slice1.get(2, 3)).toBe(4);
            
            // Test reverse column order [:, ::-1]
            const slice2 = arr.sliceAdvanced(':', '::-1') as NDArray;
            expect(slice2.shape).toEqual([3, 4]);
            expect(slice2.get(0, 0)).toBe(4);
            expect(slice2.get(0, 3)).toBe(1);
            expect(slice2.get(2, 0)).toBe(12);
            expect(slice2.get(2, 3)).toBe(9);
        });

        it('should preserve data sharing (zero-copy)', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            const slice = arr.sliceAdvanced('1:4') as NDArray;
            
            // Verify they share the same underlying data
            expect(slice.sharesDataWith(arr)).toBe(true);
            
            // Modify original array and check if slice reflects the change
            arr.set(2, 99);
            expect(slice.get(1)).toBe(99);
        });
    });

    describe('Error handling', () => {
        it('should throw error for too many slice dimensions', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.sliceAdvanced(':', ':')).toThrow(DimensionError);
        });

        it('should throw error for invalid slice strings', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            expect(() => arr.sliceAdvanced('1:2:0')).toThrow(InvalidParameterError);
            expect(() => arr.sliceAdvanced('a:b')).toThrow(InvalidParameterError);
        });
    });
});

describe('NDArray Basic Indexing', () => {
    describe('Single element access', () => {
        it('should get elements from 1D array', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            expect(arr.get(0)).toBe(1);
            expect(arr.get(2)).toBe(3);
            expect(arr.get(4)).toBe(5);
        });

        it('should get elements from 2D array', () => {
            const arr = fromArray([[1, 2, 3], [4, 5, 6]]);
            
            expect(arr.get(0, 0)).toBe(1);
            expect(arr.get(0, 2)).toBe(3);
            expect(arr.get(1, 1)).toBe(5);
            expect(arr.get(1, 2)).toBe(6);
        });

        it('should get elements from 3D array', () => {
            const arr = fromArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
            
            expect(arr.get(0, 0, 0)).toBe(1);
            expect(arr.get(0, 1, 1)).toBe(4);
            expect(arr.get(1, 0, 1)).toBe(6);
            expect(arr.get(1, 1, 1)).toBe(8);
        });

        it('should handle negative indexing', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            expect(arr.get(-1)).toBe(5);
            expect(arr.get(-2)).toBe(4);
            expect(arr.get(-5)).toBe(1);
        });

        it('should handle negative indexing in 2D arrays', () => {
            const arr = fromArray([[1, 2, 3], [4, 5, 6]]);
            
            expect(arr.get(-1, -1)).toBe(6);
            expect(arr.get(-2, -3)).toBe(1);
            expect(arr.get(0, -1)).toBe(3);
        });

        it('should throw error for out of bounds indices', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.get(3)).toThrow(IndexOutOfBoundsError);
            expect(() => arr.get(-4)).toThrow(IndexOutOfBoundsError);
        });

        it('should throw error for wrong number of indices', () => {
            const arr = fromArray([[1, 2], [3, 4]]);
            
            expect(() => arr.get(0)).toThrow(DimensionError);
            expect(() => arr.get(0, 1, 2)).toThrow(DimensionError);
        });

        it('should throw error for non-integer indices', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.get(1.5)).toThrow(InvalidParameterError);
            expect(() => arr.get(NaN)).toThrow(InvalidParameterError);
        });
    });

    describe('Single element assignment', () => {
        it('should set elements in 1D array', () => {
            const arr = zeros([3]);
            
            arr.set(0, 10);
            arr.set(2, 30);
            
            expect(arr.get(0)).toBe(10);
            expect(arr.get(1)).toBe(0);
            expect(arr.get(2)).toBe(30);
        });

        it('should set elements in 2D array', () => {
            const arr = zeros([2, 3]);
            
            arr.set(0, 1, 5);
            arr.set(1, 2, 15);
            
            expect(arr.get(0, 1)).toBe(5);
            expect(arr.get(1, 2)).toBe(15);
            expect(arr.get(0, 0)).toBe(0);
        });

        it('should handle negative indexing in assignment', () => {
            const arr = zeros([3]);
            
            arr.set(-1, 99);
            arr.set(-2, 88);
            
            expect(arr.get(2)).toBe(99);
            expect(arr.get(1)).toBe(88);
            expect(arr.get(0)).toBe(0);
        });

        it('should throw error for readonly arrays', () => {
            const arr = zeros([3], { readonly: true });
            
            expect(() => arr.set(0, 5)).toThrow('Cannot modify read-only array');
        });

        it('should throw error for invalid arguments', () => {
            const arr = zeros([3]);
            
            expect(() => arr.set(0)).toThrow(InvalidParameterError);
            expect(() => (arr as any).set()).toThrow(InvalidParameterError);
        });

        it('should validate finite numbers', () => {
            const arr = zeros([3]);
            
            expect(() => arr.set(0, NaN)).toThrow(InvalidParameterError);
            expect(() => arr.set(0, Infinity)).toThrow(InvalidParameterError);
        });
    });

    describe('String-based slicing', () => {
        it('should support getAdvanced with string slices', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            const slice1 = arr.getAdvanced('1:4') as NDArray;
            expect(slice1.shape).toEqual([3]);
            expect(slice1.get(0)).toBe(2);
            expect(slice1.get(1)).toBe(3);
            expect(slice1.get(2)).toBe(4);
        });

        it('should support mixed numeric and string indices', () => {
            const arr = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            
            const slice1 = arr.getAdvanced(1, '1:3') as NDArray;
            expect(slice1.shape).toEqual([2]);
            expect(slice1.get(0)).toBe(5);
            expect(slice1.get(1)).toBe(6);
        });

        it('should fall back to basic get for all numeric indices', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            
            const result = arr.getAdvanced(2);
            expect(result).toBe(3);
        });
    });
});

describe('String Slice Parsing', () => {
    describe('parseStringSlice', () => {
        it('should parse basic range slices', () => {
            expect(parseStringSlice('1:5')).toEqual([1, 5]);
            expect(parseStringSlice('0:3')).toEqual([0, 3]);
            expect(parseStringSlice('-2:10')).toEqual([-2, 10]);
        });

        it('should parse slices with step', () => {
            expect(parseStringSlice('1:5:2')).toEqual([1, 5, 2]);
            expect(parseStringSlice('0:10:3')).toEqual([0, 10, 3]);
            expect(parseStringSlice('5:0:-1')).toEqual([5, 0, -1]);
        });

        it('should handle empty start/end/step', () => {
            expect(parseStringSlice(':5')).toEqual([0, 5]);
            expect(parseStringSlice('2:')).toEqual([2, Infinity]);
            expect(parseStringSlice(':')).toEqual([0, Infinity]);
            expect(parseStringSlice('::2')).toEqual([0, Infinity, 2]);
            expect(parseStringSlice('::-1')).toEqual([0, Infinity, -1]);
        });

        it('should handle negative indices', () => {
            expect(parseStringSlice('-5:-1')).toEqual([-5, -1]);
            expect(parseStringSlice(':-2')).toEqual([0, -2]);
            expect(parseStringSlice('-3:')).toEqual([-3, Infinity]);
        });

        it('should throw error for single numbers', () => {
            expect(() => parseStringSlice('5')).toThrow(InvalidParameterError);
            expect(() => parseStringSlice('-1')).toThrow(InvalidParameterError);
        });

        it('should throw error for invalid formats', () => {
            expect(() => parseStringSlice('')).toThrow(InvalidParameterError);
            expect(() => parseStringSlice('1:2:3:4')).toThrow(InvalidParameterError);
            expect(() => parseStringSlice('a:b')).toThrow(InvalidParameterError);
            expect(() => parseStringSlice('1:2:0')).toThrow(InvalidParameterError);
        });

        it('should throw error for non-string input', () => {
            expect(() => parseStringSlice(123 as any)).toThrow(InvalidParameterError);
            expect(() => parseStringSlice(null as any)).toThrow(InvalidParameterError);
        });
    });
});

describe('Index Normalization', () => {
    describe('normalizeIndex', () => {
        it('should normalize positive indices', () => {
            expect(normalizeIndex(0, 5)).toBe(0);
            expect(normalizeIndex(2, 5)).toBe(2);
            expect(normalizeIndex(4, 5)).toBe(4);
        });

        it('should normalize negative indices', () => {
            expect(normalizeIndex(-1, 5)).toBe(4);
            expect(normalizeIndex(-2, 5)).toBe(3);
            expect(normalizeIndex(-5, 5)).toBe(0);
        });

        it('should throw error for out of bounds indices', () => {
            expect(() => normalizeIndex(5, 5)).toThrow(IndexOutOfBoundsError);
            expect(() => normalizeIndex(-6, 5)).toThrow(IndexOutOfBoundsError);
            expect(() => normalizeIndex(10, 3)).toThrow(IndexOutOfBoundsError);
        });

        it('should throw error for non-integer indices', () => {
            expect(() => normalizeIndex(1.5, 5)).toThrow(InvalidParameterError);
            expect(() => normalizeIndex(NaN, 5)).toThrow(InvalidParameterError);
        });

        it('should include dimension info in error messages', () => {
            try {
                normalizeIndex(10, 5, 2);
            } catch (error) {
                expect(error).toBeInstanceOf(IndexOutOfBoundsError);
                expect((error as IndexOutOfBoundsError).dimension).toBe(2);
            }
        });
    });

    describe('normalizeRangeSlice', () => {
        it('should normalize basic range slices', () => {
            expect(normalizeRangeSlice([1, 4], 10)).toEqual([1, 4, 1]);
            expect(normalizeRangeSlice([0, 5], 10)).toEqual([0, 5, 1]);
        });

        it('should normalize slices with step', () => {
            expect(normalizeRangeSlice([1, 8, 2], 10)).toEqual([1, 8, 2]);
            expect(normalizeRangeSlice([0, 10, 3], 10)).toEqual([0, 10, 3]);
        });

        it('should handle negative indices', () => {
            expect(normalizeRangeSlice([-3, -1], 10)).toEqual([7, 9, 1]);
            expect(normalizeRangeSlice([-5, 5], 10)).toEqual([5, 5, 1]);
        });

        it('should handle infinite bounds', () => {
            expect(normalizeRangeSlice([0, Infinity], 10)).toEqual([0, 10, 1]);
            expect(normalizeRangeSlice([-Infinity, 5], 10)).toEqual([0, 5, 1]);
        });

        it('should handle negative step', () => {
            expect(normalizeRangeSlice([5, 1, -1], 10)).toEqual([5, 1, -1]);
            expect(normalizeRangeSlice([Infinity, -Infinity, -1], 10)).toEqual([9, -1, -1]);
        });

        it('should clamp out-of-bounds values', () => {
            expect(normalizeRangeSlice([15, 20], 10)).toEqual([9, 10, 1]);
            expect(normalizeRangeSlice([-15, -10], 10)).toEqual([0, 0, 1]);
        });

        it('should throw error for zero step', () => {
            expect(() => normalizeRangeSlice([1, 5, 0], 10)).toThrow(InvalidParameterError);
        });
    });
});

describe('Advanced Indexing Utilities', () => {
    describe('validateIndexArray', () => {
        it('should validate and normalize index arrays', () => {
            expect(validateIndexArray([0, 2, 4], 10)).toEqual([0, 2, 4]);
            expect(validateIndexArray([-1, -2], 5)).toEqual([4, 3]);
        });

        it('should throw error for invalid indices', () => {
            expect(() => validateIndexArray([0, 10], 5)).toThrow(IndexOutOfBoundsError);
            expect(() => validateIndexArray([1.5, 2], 5)).toThrow(InvalidParameterError);
        });

        it('should throw error for non-array input', () => {
            expect(() => validateIndexArray('not array' as any, 5)).toThrow(InvalidParameterError);
        });
    });

    describe('validateBooleanArray', () => {
        it('should validate boolean arrays', () => {
            const boolArray = [true, false, true, false];
            expect(validateBooleanArray(boolArray, 4)).toEqual(boolArray);
        });

        it('should throw error for wrong length', () => {
            expect(() => validateBooleanArray([true, false], 5)).toThrow(DimensionError);
        });

        it('should throw error for non-boolean elements', () => {
            expect(() => validateBooleanArray([true, 1 as any], 2)).toThrow(InvalidParameterError);
        });

        it('should throw error for non-array input', () => {
            expect(() => validateBooleanArray('not array' as any, 5)).toThrow(InvalidParameterError);
        });
    });

    describe('booleanToIndices', () => {
        it('should convert boolean array to indices', () => {
            expect(booleanToIndices([true, false, true, false, true])).toEqual([0, 2, 4]);
            expect(booleanToIndices([false, false, false])).toEqual([]);
            expect(booleanToIndices([true, true, true])).toEqual([0, 1, 2]);
        });
    });

    describe('detectIndexingType', () => {
        it('should detect single index', () => {
            expect(detectIndexingType(5)).toBe('single');
            expect(detectIndexingType(-1)).toBe('single');
        });

        it('should detect string slice', () => {
            expect(detectIndexingType('1:5')).toBe('string');
            expect(detectIndexingType('::-1')).toBe('string');
        });

        it('should detect range slice', () => {
            expect(detectIndexingType([1, 5])).toBe('range');
            expect(detectIndexingType([0, 10, 2])).toBe('range');
        });

        it('should detect fancy indexing', () => {
            expect(detectIndexingType([0, 2, 4, 1])).toBe('fancy');
            expect(detectIndexingType([5])).toBe('fancy');
        });

        it('should detect boolean indexing', () => {
            expect(detectIndexingType([true, false, true])).toBe('boolean');
            expect(detectIndexingType([false, false])).toBe('boolean');
        });

        it('should throw error for invalid input', () => {
            expect(() => detectIndexingType([])).toThrow(InvalidParameterError);
            expect(() => detectIndexingType([1, true] as any)).toThrow(InvalidParameterError);
            expect(() => detectIndexingType({} as any)).toThrow(InvalidParameterError);
        });
    });
});

describe('Advanced Indexing Features', () => {
    describe('Fancy indexing', () => {
        it('should select elements using index arrays', () => {
            const arr = fromArray([10, 20, 30, 40, 50]);
            
            // Select elements at indices [0, 2, 4]
            const result = arr.fancyIndex([0, 2, 4]);
            expect(result.shape).toEqual([3]);
            expect(result.get(0)).toBe(10);
            expect(result.get(1)).toBe(30);
            expect(result.get(2)).toBe(50);
        });

        it('should work with 2D arrays', () => {
            const arr = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            
            // Select elements at positions (0,1), (1,2), (2,0)
            const result = arr.fancyIndex([0, 1, 2], [1, 2, 0]);
            expect(result.shape).toEqual([3]);
            expect(result.get(0)).toBe(2); // arr[0,1]
            expect(result.get(1)).toBe(6); // arr[1,2]
            expect(result.get(2)).toBe(7); // arr[2,0]
        });

        it('should handle negative indices', () => {
            const arr = fromArray([10, 20, 30, 40, 50]);
            
            const result = arr.fancyIndex([-1, -2, 0]);
            expect(result.shape).toEqual([3]);
            expect(result.get(0)).toBe(50); // arr[-1]
            expect(result.get(1)).toBe(40); // arr[-2]
            expect(result.get(2)).toBe(10); // arr[0]
        });

        it('should throw error for mismatched index array lengths', () => {
            const arr = fromArray([[1, 2], [3, 4]]);
            
            expect(() => arr.fancyIndex([0, 1], [0])).toThrow(DimensionError);
        });

        it('should throw error for too many index arrays', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.fancyIndex([0], [1], [2])).toThrow(DimensionError);
        });

        it('should throw error for out of bounds indices', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.fancyIndex([0, 5])).toThrow(IndexOutOfBoundsError);
        });

        it('should throw error for non-integer indices', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.fancyIndex([0, 1.5])).toThrow(InvalidParameterError);
        });
    });

    describe('Boolean indexing', () => {
        it('should select elements where boolean array is true', () => {
            const arr = fromArray([10, 20, 30, 40, 50]);
            const boolArray = [true, false, true, false, true];
            
            const result = arr.booleanIndex(boolArray);
            expect(result.shape).toEqual([3]);
            expect(result.get(0)).toBe(10);
            expect(result.get(1)).toBe(30);
            expect(result.get(2)).toBe(50);
        });

        it('should handle all false boolean array', () => {
            const arr = fromArray([1, 2, 3, 4, 5]);
            const boolArray = [false, false, false, false, false];
            
            const result = arr.booleanIndex(boolArray);
            expect(result.shape).toEqual([0]);
        });

        it('should handle all true boolean array', () => {
            const arr = fromArray([1, 2, 3]);
            const boolArray = [true, true, true];
            
            const result = arr.booleanIndex(boolArray);
            expect(result.shape).toEqual([3]);
            expect(result.get(0)).toBe(1);
            expect(result.get(1)).toBe(2);
            expect(result.get(2)).toBe(3);
        });

        it('should work with 2D arrays (flattened)', () => {
            const arr = fromArray([[1, 2], [3, 4]]);
            const boolArray = [true, false, false, true];
            
            const result = arr.booleanIndex(boolArray);
            expect(result.shape).toEqual([2]);
            expect(result.get(0)).toBe(1); // First element
            expect(result.get(1)).toBe(4); // Last element
        });

        it('should throw error for wrong boolean array length', () => {
            const arr = fromArray([1, 2, 3]);
            const boolArray = [true, false]; // Wrong length
            
            expect(() => arr.booleanIndex(boolArray)).toThrow(DimensionError);
        });

        it('should throw error for non-boolean elements', () => {
            const arr = fromArray([1, 2, 3]);
            const boolArray = [true, 1 as any, false]; // Non-boolean element
            
            expect(() => arr.booleanIndex(boolArray)).toThrow(InvalidParameterError);
        });

        it('should throw error for non-array input', () => {
            const arr = fromArray([1, 2, 3]);
            
            expect(() => arr.booleanIndex('not array' as any)).toThrow(InvalidParameterError);
        });
    });
});

describe('Common Indexing Patterns', () => {
    describe('fullSlice', () => {
        it('should create a full slice', () => {
            expect(fullSlice()).toEqual([0, Infinity]);
        });
    });

    describe('reverseSlice', () => {
        it('should create a reverse slice', () => {
            expect(reverseSlice()).toEqual([Infinity, -Infinity, -1]);
        });
    });

    describe('stepSlice', () => {
        it('should create step slices', () => {
            expect(stepSlice(2)).toEqual([0, Infinity, 2]);
            expect(stepSlice(-2)).toEqual([Infinity, -Infinity, -2]);
        });

        it('should throw error for zero step', () => {
            expect(() => stepSlice(0)).toThrow(InvalidParameterError);
        });
    });
});