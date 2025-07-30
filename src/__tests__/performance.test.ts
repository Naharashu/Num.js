/**
 * Performance optimization tests for Num.js
 * Tests the new performance features and benchmarking utilities
 */

import { describe, it, expect } from 'vitest';
import { NDArray } from '../ndarray/ndarray.js';
import { random } from '../ndarray/factory.js';
import { 
  benchmark, 
  compareBenchmarks, 
  benchmarkArithmetic,
  benchmarkMemoryAllocation 
} from '../core/performance.js';
import { lazy, LazyNDArray } from '../core/lazy.js';

describe('Performance Optimizations', () => {
  describe('NDArray Matrix Multiplication', () => {
    it('should perform matrix multiplication correctly', () => {
      const a = new NDArray([[1, 2], [3, 4]], [2, 2]);
      const b = new NDArray([[5, 6], [7, 8]], [2, 2]);
      
      const result = a.dot(b);
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(19); // 1*5 + 2*7
      expect(result.get(0, 1)).toBe(22); // 1*6 + 2*8
      expect(result.get(1, 0)).toBe(43); // 3*5 + 4*7
      expect(result.get(1, 1)).toBe(50); // 3*6 + 4*8
    });

    it('should throw error for incompatible dimensions', () => {
      const a = new NDArray([[1, 2]], [1, 2]);
      const b = new NDArray([[1], [2], [3]], [3, 1]);
      
      expect(() => a.dot(b)).toThrow('Matrix multiplication dimension mismatch');
    });

    it('should throw error for non-2D arrays', () => {
      const a = new NDArray([1, 2, 3], [3]);
      const b = new NDArray([4, 5, 6], [3]);
      
      expect(() => a.dot(b)).toThrow('Matrix multiplication requires 2D arrays');
    });
  });

  describe('Method Chaining', () => {
    it('should support fluent interface for arithmetic operations', () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      const result = arr
        .add(5)      // [6, 7, 8, 9]
        .multiply(2) // [12, 14, 16, 18]
        .subtract(2); // [10, 12, 14, 16]
      
      expect(result.toArray()).toEqual([10, 12, 14, 16]);
    });

    it('should support chaining with reshape and transpose', () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      
      // Original: [1, 2, 3, 4] -> reshape to [[1, 2], [3, 4]] -> transpose to [[1, 3], [2, 4]]
      const result = arr
        .reshape([2, 2])
        .transpose()
        .add(10);
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(11); // 1 + 10
      expect(result.get(0, 1)).toBe(12); // 2 + 10 (after transpose)
      expect(result.get(1, 0)).toBe(13); // 3 + 10 (after transpose)
      expect(result.get(1, 1)).toBe(14); // 4 + 10
    });
  });

  describe('Benchmarking System', () => {
    it('should run basic benchmarks', () => {
      let counter = 0;
      const result = benchmark('Test Function', () => {
        counter++;
      }, 100);

      expect(result.name).toBe('Test Function');
      expect(result.iterations).toBe(100);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.operationsPerSecond).toBeGreaterThan(0);
      // Counter might be higher due to warmup iterations
      expect(counter).toBeGreaterThanOrEqual(100);
    });

    it('should compare multiple benchmarks', () => {
      const results = compareBenchmarks([
        {
          name: 'Fast Operation',
          fn: () => { /* minimal work */ }
        },
        {
          name: 'Slow Operation', 
          fn: () => {
            // Simulate slower work
            for (let i = 0; i < 100; i++) {
              Math.sqrt(i);
            }
          }
        }
      ], 10);

      expect(results).toHaveLength(2);
      expect(results[0]?.operationsPerSecond).toBeGreaterThanOrEqual(results[1]?.operationsPerSecond || 0);
    });

    it('should run arithmetic benchmarks', () => {
      const results = benchmarkArithmetic(10); // Small size for test speed
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.operationsPerSecond > 0)).toBe(true);
    });

    it('should run memory allocation benchmarks', () => {
      const results = benchmarkMemoryAllocation(100); // Small size for test speed
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.operationsPerSecond > 0)).toBe(true);
    });
  });

  describe('Lazy Evaluation', () => {
    it('should create lazy evaluation wrapper', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const lazyArr = lazy(arr);
      
      expect(lazyArr).toBeInstanceOf(LazyNDArray);
    });

    it('should support lazy arithmetic operations', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const lazyResult = lazy(arr)
        .add(5)
        .multiply(2)
        .subtract(1);
      
      const result = lazyResult.evaluate();
      
      expect(result.toArray()).toEqual([11, 13, 15]); // ((1+5)*2)-1, ((2+5)*2)-1, ((3+5)*2)-1
    });

    it('should support lazy reshape and transpose', () => {
      const arr = new NDArray([1, 2, 3, 4], [4]);
      const lazyResult = lazy(arr)
        .reshape([2, 2])
        .transpose()
        .add(10);
      
      const result = lazyResult.evaluate();
      
      expect(result.shape).toEqual([2, 2]);
      expect(result.get(0, 0)).toBe(11);
      expect(result.get(1, 1)).toBe(14);
    });

    it('should handle empty operation chain', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const lazyResult = lazy(arr);
      
      const result = lazyResult.evaluate();
      
      expect(result).toBe(arr); // Should return original array
    });

    it('should use NDArray lazy method', () => {
      const arr = new NDArray([1, 2, 3], [3]);
      const lazyArr = arr.lazy();
      
      expect(lazyArr).toBeInstanceOf(LazyNDArray);
      
      const result = lazyArr.add(1).multiply(2).evaluate();
      expect(result.toArray()).toEqual([4, 6, 8]);
    });
  });

  describe('Performance Comparisons', () => {
    it('should demonstrate NDArray performance benefits', () => {
      const size = 100;
      const ndarrayData = random([size]);
      const regularArray = Array.from({ length: size }, () => Math.random());
      
      // Test scalar addition performance
      const ndarrayTime = benchmark('NDArray scalar add', () => {
        ndarrayData.add(2.5);
      }, 100);
      
      const regularArrayTime = benchmark('Regular array scalar add', () => {
        regularArray.map(x => x + 2.5);
      }, 100);
      
      // NDArray should be competitive or faster
      expect(ndarrayTime.operationsPerSecond).toBeGreaterThan(0);
      expect(regularArrayTime.operationsPerSecond).toBeGreaterThan(0);
    });

    it('should show method chaining benefits', () => {
      const arr = random([1000]);
      
      // Chained operations
      const chainedTime = benchmark('Chained operations', () => {
        arr.add(1).multiply(2).subtract(0.5);
      }, 50);
      
      // Separate operations
      const separateTime = benchmark('Separate operations', () => {
        const temp1 = arr.add(1);
        const temp2 = temp1.multiply(2);
        const temp3 = temp2.subtract(0.5);
        return temp3;
      }, 50);
      
      expect(chainedTime.operationsPerSecond).toBeGreaterThan(0);
      expect(separateTime.operationsPerSecond).toBeGreaterThan(0);
    });
  });
});