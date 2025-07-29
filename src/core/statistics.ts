/**
 * Statistical functions for Num.js TypeScript migration
 * Provides type-safe implementations of statistical operations with comprehensive error handling
 */

import type { 
  NumericArray, 
  NumericMatrix,
  StatisticalOptions,
  Axis 
} from '../types/common.js';
import { 
  InvalidParameterError, 
  EmptyArrayError,
  MathematicalError,
  DimensionError 
} from '../types/errors.js';
import { 
  validateNumericArray,
  validateNumericMatrix,
  validateFiniteNumber,
  validateNonNegativeNumber,
  validateInteger 
} from '../types/validation.js';

// ============================================================================
// Basic Statistical Functions
// ============================================================================

/**
 * Calculate the sum of array elements
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options including axis parameter
 * @returns The sum value or array of sums along specified axis
 * 
 * @example
 * sum([1, 2, 3, 4, 5]) // 15
 * sum([[1, 2], [3, 4]], { axis: 0 }) // [4, 6] (column sums)
 * sum([[1, 2], [3, 4]], { axis: 1 }) // [3, 7] (row sums)
 */
export function sum(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const { axis = null } = options;
  
  if (axis === null) {
    // Sum all elements
    if (Array.isArray(arr[0])) {
      // Matrix case
      const matrix = arr as NumericMatrix;
      validateNumericMatrix(matrix, 'arr');
      
      if (matrix.length === 0) {
        throw new EmptyArrayError('sum');
      }
      
      let total = 0;
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          total += value;
        }
      }
      return total;
    } else {
      // Array case
      const array = arr as NumericArray;
      validateNumericArray(array, 'arr');
      
      if (array.length === 0) {
        throw new EmptyArrayError('sum');
      }
      
      let total = 0;
      for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (value === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
        }
        total += value;
      }
      return total;
    }
  } else {
    // Sum along specified axis
    if (!Array.isArray(arr[0])) {
      throw new InvalidParameterError('arr', 'matrix when axis is specified', 'array');
    }
    
    const matrix = arr as NumericMatrix;
    validateNumericMatrix(matrix, 'arr');
    
    if (matrix.length === 0) {
      throw new EmptyArrayError('sum');
    }
    
    if (axis === 0) {
      // Sum along rows (column sums)
      const numCols = matrix[0]!.length;
      const result: NumericArray = new Array(numCols).fill(0);
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        if (row.length !== numCols) {
          throw new DimensionError('All rows must have the same length', [numCols], [row.length]);
        }
        for (let j = 0; j < numCols; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          result[j]! += value;
        }
      }
      return result;
    } else if (axis === 1) {
      // Sum along columns (row sums)
      const result: NumericArray = [];
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        
        let rowSum = 0;
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          rowSum += value;
        }
        result.push(rowSum);
      }
      return result;
    } else {
      throw new InvalidParameterError('axis', '0, 1, or null', axis);
    }
  }
}

/**
 * Calculate the arithmetic mean (average) of an array
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options including axis parameter
 * @returns The mean value or array of means along specified axis
 * 
 * @example
 * mean([1, 2, 3, 4, 5]) // 3
 * mean([[1, 2], [3, 4]], { axis: 0 }) // [2, 3] (column means)
 * mean([[1, 2], [3, 4]], { axis: 1 }) // [1.5, 3.5] (row means)
 */
export function mean(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const { axis = null } = options;
  
  if (axis === null) {
    // Mean of all elements
    if (Array.isArray(arr[0])) {
      // Matrix case
      const matrix = arr as NumericMatrix;
      validateNumericMatrix(matrix, 'arr');
      
      if (matrix.length === 0) {
        throw new EmptyArrayError('mean');
      }
      
      const totalSum = sum(matrix) as number;
      const totalElements = matrix.length * matrix[0]!.length;
      return totalSum / totalElements;
    } else {
      // Array case
      const array = arr as NumericArray;
      validateNumericArray(array, 'arr');
      
      if (array.length === 0) {
        throw new EmptyArrayError('mean');
      }
      
      const totalSum = sum(array) as number;
      return totalSum / array.length;
    }
  } else {
    // Mean along specified axis
    if (!Array.isArray(arr[0])) {
      throw new InvalidParameterError('arr', 'matrix when axis is specified', 'array');
    }
    
    const matrix = arr as NumericMatrix;
    const sums = sum(matrix, { axis }) as NumericArray;
    
    if (axis === 0) {
      // Column means
      const numRows = matrix.length;
      return sums.map(s => s / numRows);
    } else if (axis === 1) {
      // Row means
      return sums.map((s, i) => s / matrix[i]!.length);
    } else {
      throw new InvalidParameterError('axis', '0, 1, or null', axis);
    }
  }
}

/**
 * Calculate the median (middle value) of an array
 * @param arr - Array of numbers
 * @returns The median value
 * 
 * @example
 * median([1, 2, 3, 4, 5]) // 3
 * median([1, 2, 3, 4]) // 2.5
 * median([5, 1, 3, 2, 4]) // 3
 */
export function median(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('median');
  }
  
  // Create a sorted copy without modifying the original array
  const sorted = [...arr].sort((a, b) => a - b);
  const length = sorted.length;
  const middle = Math.floor(length / 2);
  
  if (length % 2 === 0) {
    // Even number of elements - return average of two middle values
    const val1 = sorted[middle - 1];
    const val2 = sorted[middle];
    if (val1 === undefined || val2 === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return (val1 + val2) / 2;
  } else {
    // Odd number of elements - return middle value
    const val = sorted[middle];
    if (val === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return val;
  }
}

/**
 * Calculate the mode (most frequent value(s)) of an array
 * @param arr - Array of numbers
 * @returns The mode value (single number) or array of modes (if multiple modes exist)
 * 
 * @example
 * mode([1, 2, 2, 3, 4]) // 2
 * mode([1, 1, 2, 2, 3]) // [1, 2]
 * mode([1, 2, 3, 4, 5]) // [1, 2, 3, 4, 5] (all equally frequent)
 */
export function mode(arr: NumericArray): number | NumericArray {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('mode');
  }
  
  // Count frequency of each value
  const counts = new Map<number, number>();
  for (const value of arr) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  
  // Find maximum frequency
  const maxCount = Math.max(...counts.values());
  
  // Collect all values with maximum frequency
  const modes: NumericArray = [];
  for (const [value, count] of counts.entries()) {
    if (count === maxCount) {
      modes.push(value);
    }
  }
  
  // Sort modes for consistent output
  modes.sort((a, b) => a - b);
  
  // Return single mode or array of modes
  if (modes.length === 1) {
    const singleMode = modes[0];
    if (singleMode === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return singleMode;
  }
  return modes;
}

// ============================================================================
// Measures of Variability
// ============================================================================

/**
 * Calculate the variance of an array
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options (ddof for degrees of freedom, axis)
 * @returns The variance or array of variances along specified axis
 * 
 * @example
 * variance([1, 2, 3, 4, 5]) // 2.5 (population variance)
 * variance([1, 2, 3, 4, 5], { ddof: 1 }) // 2.5 (sample variance)
 * variance([[1, 2], [3, 4]], { axis: 0 }) // [1, 1] (column variances)
 */
export function variance(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const { ddof = 0, axis = null } = options;
  validateNonNegativeNumber(ddof, 'ddof');
  validateInteger(ddof, 'ddof');
  
  if (axis === null) {
    // Variance of all elements
    if (Array.isArray(arr[0])) {
      // Matrix case - flatten and calculate variance
      const matrix = arr as NumericMatrix;
      validateNumericMatrix(matrix, 'arr');
      
      if (matrix.length === 0) {
        throw new EmptyArrayError('variance');
      }
      
      const flatArray: NumericArray = [];
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          flatArray.push(value);
        }
      }
      
      if (flatArray.length <= ddof) {
        throw new InvalidParameterError(
          'ddof', 
          `less than total elements (${flatArray.length})`, 
          ddof
        );
      }
      
      const arrayMean = mean(flatArray) as number;
      let sumSquaredDiffs = 0;
      
      for (let i = 0; i < flatArray.length; i++) {
        const diff = flatArray[i]! - arrayMean;
        sumSquaredDiffs += diff * diff;
      }
      
      return sumSquaredDiffs / (flatArray.length - ddof);
    } else {
      // Array case
      const array = arr as NumericArray;
      validateNumericArray(array, 'arr');
      
      if (array.length === 0) {
        throw new EmptyArrayError('variance');
      }
      
      if (array.length <= ddof) {
        throw new InvalidParameterError(
          'ddof', 
          `less than array length (${array.length})`, 
          ddof
        );
      }
      
      const arrayMean = mean(array) as number;
      let sumSquaredDiffs = 0;
      
      for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (value === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
        }
        const diff = value - arrayMean;
        sumSquaredDiffs += diff * diff;
      }
      
      return sumSquaredDiffs / (array.length - ddof);
    }
  } else {
    // Variance along specified axis
    if (!Array.isArray(arr[0])) {
      throw new InvalidParameterError('arr', 'matrix when axis is specified', 'array');
    }
    
    const matrix = arr as NumericMatrix;
    validateNumericMatrix(matrix, 'arr');
    
    if (matrix.length === 0) {
      throw new EmptyArrayError('variance');
    }
    
    const means = mean(matrix, { axis }) as NumericArray;
    
    if (axis === 0) {
      // Column variances
      const numRows = matrix.length;
      if (numRows <= ddof) {
        throw new InvalidParameterError('ddof', `less than number of rows (${numRows})`, ddof);
      }
      
      const numCols = matrix[0]!.length;
      const result: NumericArray = new Array(numCols).fill(0);
      
      for (let j = 0; j < numCols; j++) {
        let sumSquaredDiffs = 0;
        const colMean = means[j]!;
        
        for (let i = 0; i < numRows; i++) {
          const value = matrix[i]![j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          const diff = value - colMean;
          sumSquaredDiffs += diff * diff;
        }
        
        result[j] = sumSquaredDiffs / (numRows - ddof);
      }
      
      return result;
    } else if (axis === 1) {
      // Row variances
      const result: NumericArray = [];
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        
        if (row.length <= ddof) {
          throw new InvalidParameterError('ddof', `less than row length (${row.length})`, ddof);
        }
        
        const rowMean = means[i]!;
        let sumSquaredDiffs = 0;
        
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          const diff = value - rowMean;
          sumSquaredDiffs += diff * diff;
        }
        
        result.push(sumSquaredDiffs / (row.length - ddof));
      }
      
      return result;
    } else {
      throw new InvalidParameterError('axis', '0, 1, or null', axis);
    }
  }
}

/**
 * Calculate the standard deviation of an array
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options (ddof for degrees of freedom, axis)
 * @returns The standard deviation or array of standard deviations along specified axis
 * 
 * @example
 * standardDeviation([1, 2, 3, 4, 5]) // ~1.58 (population std dev)
 * standardDeviation([1, 2, 3, 4, 5], { ddof: 1 }) // ~1.58 (sample std dev)
 * standardDeviation([[1, 2], [3, 4]], { axis: 0 }) // [1, 1] (column std devs)
 */
export function standardDeviation(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const varianceValue = variance(arr, options);
  
  if (typeof varianceValue === 'number') {
    return Math.sqrt(varianceValue);
  } else {
    return varianceValue.map(v => Math.sqrt(v));
  }
}

// ============================================================================
// Percentiles and Quantiles
// ============================================================================

/**
 * Calculate a percentile of an array
 * @param arr - Array of numbers
 * @param percentile - Percentile to calculate (0-100)
 * @returns The percentile value
 * 
 * @example
 * percentile([1, 2, 3, 4, 5], 50) // 3 (median)
 * percentile([1, 2, 3, 4, 5], 25) // 2 (first quartile)
 * percentile([1, 2, 3, 4, 5], 75) // 4 (third quartile)
 */
export function percentile(arr: NumericArray, percentile: number): number {
  validateNumericArray(arr, 'arr');
  validateFiniteNumber(percentile, 'percentile');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('percentile');
  }
  
  if (percentile < 0 || percentile > 100) {
    throw new InvalidParameterError(
      'percentile', 
      'number between 0 and 100', 
      percentile
    );
  }
  
  const sorted = [...arr].sort((a, b) => a - b);
  
  if (percentile === 0) {
    const val = sorted[0];
    if (val === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return val;
  }
  if (percentile === 100) {
    const val = sorted[sorted.length - 1];
    if (val === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return val;
  }
  
  // Use linear interpolation method
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) {
    const val = sorted[lower];
    if (val === undefined) {
      throw new InvalidParameterError('arr', 'valid array', arr);
    }
    return val;
  }
  
  const weight = index - lower;
  const lowerVal = sorted[lower];
  const upperVal = sorted[upper];
  if (lowerVal === undefined || upperVal === undefined) {
    throw new InvalidParameterError('arr', 'valid array', arr);
  }
  return lowerVal * (1 - weight) + upperVal * weight;
}

/**
 * Calculate a quantile of an array
 * @param arr - Array of numbers
 * @param q - Quantile to calculate (0-1)
 * @returns The quantile value
 * 
 * @example
 * quantile([1, 2, 3, 4, 5], 0.5) // 3 (median)
 * quantile([1, 2, 3, 4, 5], 0.25) // 2 (first quartile)
 * quantile([1, 2, 3, 4, 5], 0.75) // 4 (third quartile)
 */
export function quantile(arr: NumericArray, q: number): number {
  validateFiniteNumber(q, 'q');
  
  if (q < 0 || q > 1) {
    throw new InvalidParameterError(
      'q', 
      'number between 0 and 1', 
      q
    );
  }
  
  return percentile(arr, q * 100);
}

/**
 * Calculate the interquartile range (IQR) of an array
 * @param arr - Array of numbers
 * @returns The IQR (Q3 - Q1)
 * 
 * @example
 * iqr([1, 2, 3, 4, 5, 6, 7, 8, 9]) // 4 (Q3=7, Q1=3, IQR=4)
 */
export function iqr(arr: NumericArray): number {
  const q1 = quantile(arr, 0.25);
  const q3 = quantile(arr, 0.75);
  return q3 - q1;
}

// ============================================================================
// Range and Extremes
// ============================================================================

/**
 * Find the minimum value in an array
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options including axis parameter
 * @returns The minimum value or array of minimums along specified axis
 * 
 * @example
 * min([3, 1, 4, 1, 5]) // 1
 * min([[1, 2], [3, 4]], { axis: 0 }) // [1, 2] (column mins)
 * min([[1, 2], [3, 4]], { axis: 1 }) // [1, 3] (row mins)
 */
export function min(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const { axis = null } = options;
  
  if (axis === null) {
    // Min of all elements
    if (Array.isArray(arr[0])) {
      // Matrix case
      const matrix = arr as NumericMatrix;
      validateNumericMatrix(matrix, 'arr');
      
      if (matrix.length === 0) {
        throw new EmptyArrayError('min');
      }
      
      let minValue = Infinity;
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          if (value < minValue) {
            minValue = value;
          }
        }
      }
      return minValue;
    } else {
      // Array case
      const array = arr as NumericArray;
      validateNumericArray(array, 'arr');
      
      if (array.length === 0) {
        throw new EmptyArrayError('min');
      }
      
      return Math.min(...array);
    }
  } else {
    // Min along specified axis
    if (!Array.isArray(arr[0])) {
      throw new InvalidParameterError('arr', 'matrix when axis is specified', 'array');
    }
    
    const matrix = arr as NumericMatrix;
    validateNumericMatrix(matrix, 'arr');
    
    if (matrix.length === 0) {
      throw new EmptyArrayError('min');
    }
    
    if (axis === 0) {
      // Column mins
      const numCols = matrix[0]!.length;
      const result: NumericArray = new Array(numCols).fill(Infinity);
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        if (row.length !== numCols) {
          throw new DimensionError('All rows must have the same length', [numCols], [row.length]);
        }
        for (let j = 0; j < numCols; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          if (value < result[j]!) {
            result[j] = value;
          }
        }
      }
      return result;
    } else if (axis === 1) {
      // Row mins
      const result: NumericArray = [];
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        
        if (row.length === 0) {
          throw new EmptyArrayError(`min (row ${i})`);
        }
        
        result.push(Math.min(...row));
      }
      return result;
    } else {
      throw new InvalidParameterError('axis', '0, 1, or null', axis);
    }
  }
}

/**
 * Find the maximum value in an array
 * @param arr - Array of numbers or matrix
 * @param options - Statistical options including axis parameter
 * @returns The maximum value or array of maximums along specified axis
 * 
 * @example
 * max([3, 1, 4, 1, 5]) // 5
 * max([[1, 2], [3, 4]], { axis: 0 }) // [3, 4] (column maxs)
 * max([[1, 2], [3, 4]], { axis: 1 }) // [2, 4] (row maxs)
 */
export function max(arr: NumericArray | NumericMatrix, options: StatisticalOptions = {}): number | NumericArray {
  const { axis = null } = options;
  
  if (axis === null) {
    // Max of all elements
    if (Array.isArray(arr[0])) {
      // Matrix case
      const matrix = arr as NumericMatrix;
      validateNumericMatrix(matrix, 'arr');
      
      if (matrix.length === 0) {
        throw new EmptyArrayError('max');
      }
      
      let maxValue = -Infinity;
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        for (let j = 0; j < row.length; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          if (value > maxValue) {
            maxValue = value;
          }
        }
      }
      return maxValue;
    } else {
      // Array case
      const array = arr as NumericArray;
      validateNumericArray(array, 'arr');
      
      if (array.length === 0) {
        throw new EmptyArrayError('max');
      }
      
      return Math.max(...array);
    }
  } else {
    // Max along specified axis
    if (!Array.isArray(arr[0])) {
      throw new InvalidParameterError('arr', 'matrix when axis is specified', 'array');
    }
    
    const matrix = arr as NumericMatrix;
    validateNumericMatrix(matrix, 'arr');
    
    if (matrix.length === 0) {
      throw new EmptyArrayError('max');
    }
    
    if (axis === 0) {
      // Column maxs
      const numCols = matrix[0]!.length;
      const result: NumericArray = new Array(numCols).fill(-Infinity);
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        if (row.length !== numCols) {
          throw new DimensionError('All rows must have the same length', [numCols], [row.length]);
        }
        for (let j = 0; j < numCols; j++) {
          const value = row[j];
          if (value === undefined) {
            throw new InvalidParameterError(`arr[${i}][${j}]`, 'finite number', value);
          }
          if (value > result[j]!) {
            result[j] = value;
          }
        }
      }
      return result;
    } else if (axis === 1) {
      // Row maxs
      const result: NumericArray = [];
      
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (row === undefined) {
          throw new InvalidParameterError(`arr[${i}]`, 'valid row', row);
        }
        
        if (row.length === 0) {
          throw new EmptyArrayError(`max (row ${i})`);
        }
        
        result.push(Math.max(...row));
      }
      return result;
    } else {
      throw new InvalidParameterError('axis', '0, 1, or null', axis);
    }
  }
}

/**
 * Calculate the range (max - min) of an array
 * @param arr - Array of numbers
 * @returns The range
 * 
 * @example
 * range([1, 2, 3, 4, 5]) // 4
 */
export function range(arr: NumericArray): number {
  return (max(arr) as number) - (min(arr) as number);
}

// ============================================================================
// Distribution Shape Measures
// ============================================================================

/**
 * Calculate the skewness of an array (measure of asymmetry)
 * @param arr - Array of numbers
 * @param options - Statistical options
 * @returns The skewness value
 * 
 * @example
 * skewness([1, 2, 3, 4, 5]) // ~0 (symmetric)
 * skewness([1, 1, 1, 2, 3, 4, 5]) // positive (right-skewed)
 */
export function skewness(arr: NumericArray, options: StatisticalOptions = {}): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length < 3) {
    throw new InvalidParameterError(
      'arr', 
      'array with at least 3 elements', 
      arr,
      'Skewness requires at least 3 data points'
    );
  }
  
  const arrayMean = mean(arr) as number;
  const arrayStd = standardDeviation(arr, options) as number;
  
  if (arrayStd === 0) {
    throw new MathematicalError('Cannot calculate skewness with zero standard deviation', 'skewness');
  }
  
  let sumCubedDeviations = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    const standardizedValue = (value - arrayMean) / arrayStd;
    sumCubedDeviations += Math.pow(standardizedValue, 3);
  }
  
  return sumCubedDeviations / arr.length;
}

/**
 * Calculate the kurtosis of an array (measure of tail heaviness)
 * @param arr - Array of numbers
 * @param options - Statistical options
 * @returns The kurtosis value
 * 
 * @example
 * kurtosis([1, 2, 3, 4, 5]) // negative (platykurtic - lighter tails)
 */
export function kurtosis(arr: NumericArray, options: StatisticalOptions = {}): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length < 4) {
    throw new InvalidParameterError(
      'arr', 
      'array with at least 4 elements', 
      arr,
      'Kurtosis requires at least 4 data points'
    );
  }
  
  const arrayMean = mean(arr) as number;
  const arrayStd = standardDeviation(arr, options) as number;
  
  if (arrayStd === 0) {
    throw new MathematicalError('Cannot calculate kurtosis with zero standard deviation', 'kurtosis');
  }
  
  let sumFourthPowers = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    const standardizedValue = (value - arrayMean) / arrayStd;
    sumFourthPowers += Math.pow(standardizedValue, 4);
  }
  
  // Return excess kurtosis (subtract 3 for normal distribution baseline)
  return (sumFourthPowers / arr.length) - 3;
}

// ============================================================================
// Correlation and Covariance
// ============================================================================

/**
 * Calculate the covariance between two arrays
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @param options - Statistical options
 * @returns The covariance
 * 
 * @example
 * covariance([1, 2, 3], [2, 4, 6]) // positive covariance
 * covariance([1, 2, 3], [3, 2, 1]) // negative covariance
 */
export function covariance(x: NumericArray, y: NumericArray, options: StatisticalOptions = {}): number {
  validateNumericArray(x, 'x');
  validateNumericArray(y, 'y');
  
  if (x.length !== y.length) {
    throw new InvalidParameterError(
      'y', 
      `array of length ${x.length}`, 
      y,
      'Arrays must have the same length for covariance calculation'
    );
  }
  
  if (x.length === 0) {
    throw new EmptyArrayError('covariance');
  }
  
  const { ddof = 0 } = options;
  validateNonNegativeNumber(ddof, 'ddof');
  validateInteger(ddof, 'ddof');
  
  if (x.length <= ddof) {
    throw new InvalidParameterError(
      'ddof', 
      `less than array length (${x.length})`, 
      ddof
    );
  }
  
  const meanX = mean(x) as number;
  const meanY = mean(y) as number;
  
  let sumProducts = 0;
  for (let i = 0; i < x.length; i++) {
    const xVal = x[i];
    const yVal = y[i];
    if (xVal === undefined || yVal === undefined) {
      throw new InvalidParameterError('arrays', 'valid arrays with consistent elements', { x, y });
    }
    sumProducts += (xVal - meanX) * (yVal - meanY);
  }
  
  return sumProducts / (x.length - ddof);
}

/**
 * Calculate the Pearson correlation coefficient between two arrays
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @returns The correlation coefficient (-1 to 1)
 * 
 * @example
 * correlation([1, 2, 3], [2, 4, 6]) // 1 (perfect positive correlation)
 * correlation([1, 2, 3], [3, 2, 1]) // -1 (perfect negative correlation)
 * correlation([1, 2, 3], [1, 4, 2]) // ~0 (no correlation)
 */
export function correlation(x: NumericArray, y: NumericArray): number {
  const cov = covariance(x, y);
  const stdX = standardDeviation(x) as number;
  const stdY = standardDeviation(y) as number;
  
  if (stdX === 0 || stdY === 0) {
    throw new MathematicalError(
      'Cannot calculate correlation with zero standard deviation', 
      'correlation'
    );
  }
  
  return cov / (stdX * stdY);
}

// ============================================================================
// Summary Statistics
// ============================================================================

/**
 * Calculate comprehensive summary statistics for an array
 * @param arr - Array of numbers
 * @returns Object containing various statistical measures
 * 
 * @example
 * summary([1, 2, 3, 4, 5])
 * // {
 * //   count: 5,
 * //   mean: 3,
 * //   median: 3,
 * //   mode: [1, 2, 3, 4, 5],
 * //   min: 1,
 * //   max: 5,
 * //   range: 4,
 * //   variance: 2.5,
 * //   standardDeviation: 1.58,
 * //   skewness: 0,
 * //   kurtosis: -1.2
 * // }
 */
export function summary(arr: NumericArray): {
  count: number;
  mean: number;
  median: number;
  mode: number | NumericArray;
  min: number;
  max: number;
  range: number;
  variance: number;
  standardDeviation: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness?: number;
  kurtosis?: number;
} {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('summary');
  }
  
  const result = {
    count: arr.length,
    mean: mean(arr) as number,
    median: median(arr),
    mode: mode(arr),
    min: min(arr) as number,
    max: max(arr) as number,
    range: range(arr),
    variance: variance(arr) as number,
    standardDeviation: standardDeviation(arr) as number,
    q1: quantile(arr, 0.25),
    q3: quantile(arr, 0.75),
    iqr: iqr(arr),
  };
  
  // Only calculate skewness and kurtosis if we have enough data points
  const extendedResult = { ...result } as typeof result & { 
    skewness?: number; 
    kurtosis?: number; 
  };
  
  if (arr.length >= 3) {
    try {
      extendedResult.skewness = skewness(arr);
    } catch {
      // Skip skewness if calculation fails (e.g., zero std dev)
    }
  }
  
  if (arr.length >= 4) {
    try {
      extendedResult.kurtosis = kurtosis(arr);
    } catch {
      // Skip kurtosis if calculation fails (e.g., zero std dev)
    }
  }
  
  return extendedResult;
}

// ============================================================================
// Advanced Statistical Functions
// ============================================================================

/**
 * Calculate multiple percentiles at once
 * @param arr - Array of numbers
 * @param percentiles - Array of percentiles to calculate (0-100)
 * @returns Array of percentile values
 * 
 * @example
 * percentiles([1, 2, 3, 4, 5], [25, 50, 75]) // [2, 3, 4]
 */
export function percentiles(arr: NumericArray, percentiles: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  validateNumericArray(percentiles, 'percentiles');
  
  for (let i = 0; i < percentiles.length; i++) {
    const p = percentiles[i];
    if (p === undefined) {
      throw new InvalidParameterError(`percentiles[${i}]`, 'finite number', p);
    }
    if (p < 0 || p > 100) {
      throw new InvalidParameterError(
        `percentiles[${i}]`, 
        'number between 0 and 100', 
        p
      );
    }
  }
  
  return percentiles.map(p => percentile(arr, p));
}

/**
 * Calculate multiple quantiles at once
 * @param arr - Array of numbers
 * @param quantiles - Array of quantiles to calculate (0-1)
 * @returns Array of quantile values
 * 
 * @example
 * quantiles([1, 2, 3, 4, 5], [0.25, 0.5, 0.75]) // [2, 3, 4]
 */
export function quantiles(arr: NumericArray, quantiles: NumericArray): NumericArray {
  validateNumericArray(arr, 'arr');
  validateNumericArray(quantiles, 'quantiles');
  
  for (let i = 0; i < quantiles.length; i++) {
    const q = quantiles[i];
    if (q === undefined) {
      throw new InvalidParameterError(`quantiles[${i}]`, 'finite number', q);
    }
    if (q < 0 || q > 1) {
      throw new InvalidParameterError(
        `quantiles[${i}]`, 
        'number between 0 and 1', 
        q
      );
    }
  }
  
  return quantiles.map(q => quantile(arr, q));
}

/**
 * Calculate the coefficient of variation (CV)
 * @param arr - Array of numbers
 * @param options - Statistical options
 * @returns Coefficient of variation (std dev / mean)
 * 
 * @example
 * coefficientOfVariation([1, 2, 3, 4, 5]) // ~0.527
 */
export function coefficientOfVariation(arr: NumericArray, options: StatisticalOptions = {}): number {
  const arrayMean = mean(arr) as number;
  const arrayStd = standardDeviation(arr, options) as number;
  
  if (arrayMean === 0) {
    throw new MathematicalError('Cannot calculate coefficient of variation with zero mean', 'coefficientOfVariation');
  }
  
  return arrayStd / Math.abs(arrayMean);
}

/**
 * Calculate the geometric mean of an array
 * @param arr - Array of positive numbers
 * @returns Geometric mean
 * 
 * @example
 * geometricMean([1, 2, 4, 8]) // 2.828 (4th root of 64)
 */
export function geometricMean(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('geometricMean');
  }
  
  // Check for non-positive values
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    if (value <= 0) {
      throw new InvalidParameterError(
        `arr[${i}]`, 
        'positive number', 
        value,
        'Geometric mean requires all positive values'
      );
    }
  }
  
  // Calculate using logarithms to avoid overflow
  let logSum = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    logSum += Math.log(value);
  }
  
  return Math.exp(logSum / arr.length);
}

/**
 * Calculate the harmonic mean of an array
 * @param arr - Array of positive numbers
 * @returns Harmonic mean
 * 
 * @example
 * harmonicMean([1, 2, 4]) // ~1.714 (3 / (1/1 + 1/2 + 1/4))
 */
export function harmonicMean(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('harmonicMean');
  }
  
  let reciprocalSum = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    if (value === 0) {
      throw new InvalidParameterError(
        `arr[${i}]`, 
        'non-zero number', 
        value,
        'Harmonic mean requires all non-zero values'
      );
    }
    reciprocalSum += 1 / value;
  }
  
  return arr.length / reciprocalSum;
}

/**
 * Calculate the root mean square (RMS) of an array
 * @param arr - Array of numbers
 * @returns Root mean square
 * 
 * @example
 * rootMeanSquare([1, 2, 3, 4, 5]) // ~3.317
 */
export function rootMeanSquare(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('rootMeanSquare');
  }
  
  let sumSquares = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    sumSquares += value * value;
  }
  
  return Math.sqrt(sumSquares / arr.length);
}

// ============================================================================
// Matrix Statistical Functions
// ============================================================================

/**
 * Calculate correlation matrix for multiple variables
 * @param matrix - 2D array where each column is a variable
 * @returns Correlation matrix
 * 
 * @example
 * correlationMatrix([[1, 2], [2, 4], [3, 6]]) // [[1, 1], [1, 1]] (perfect correlation)
 */
export function correlationMatrix(matrix: NumericMatrix): NumericMatrix {
  validateNumericMatrix(matrix, 'matrix');
  
  if (matrix.length === 0) {
    throw new EmptyArrayError('correlationMatrix');
  }
  
  const numVars = matrix[0]!.length;
  const numObs = matrix.length;
  
  // Extract columns (variables)
  const variables: NumericArray[] = [];
  for (let j = 0; j < numVars; j++) {
    const column: NumericArray = [];
    for (let i = 0; i < numObs; i++) {
      const row = matrix[i];
      if (row === undefined) {
        throw new InvalidParameterError(`matrix[${i}]`, 'valid row', row);
      }
      const value = row[j];
      if (value === undefined) {
        throw new InvalidParameterError(`matrix[${i}][${j}]`, 'finite number', value);
      }
      column.push(value);
    }
    variables.push(column);
  }
  
  // Calculate correlation matrix
  const corrMatrix: NumericMatrix = [];
  for (let i = 0; i < numVars; i++) {
    const row: NumericArray = [];
    for (let j = 0; j < numVars; j++) {
      if (i === j) {
        row.push(1); // Perfect correlation with itself
      } else {
        const corr = correlation(variables[i]!, variables[j]!);
        row.push(corr);
      }
    }
    corrMatrix.push(row);
  }
  
  return corrMatrix;
}

/**
 * Calculate covariance matrix for multiple variables
 * @param matrix - 2D array where each column is a variable
 * @param options - Statistical options
 * @returns Covariance matrix
 * 
 * @example
 * covarianceMatrix([[1, 2], [2, 4], [3, 6]]) // Covariance matrix
 */
export function covarianceMatrix(matrix: NumericMatrix, options: StatisticalOptions = {}): NumericMatrix {
  validateNumericMatrix(matrix, 'matrix');
  
  if (matrix.length === 0) {
    throw new EmptyArrayError('covarianceMatrix');
  }
  
  const numVars = matrix[0]!.length;
  const numObs = matrix.length;
  
  // Extract columns (variables)
  const variables: NumericArray[] = [];
  for (let j = 0; j < numVars; j++) {
    const column: NumericArray = [];
    for (let i = 0; i < numObs; i++) {
      const row = matrix[i];
      if (row === undefined) {
        throw new InvalidParameterError(`matrix[${i}]`, 'valid row', row);
      }
      const value = row[j];
      if (value === undefined) {
        throw new InvalidParameterError(`matrix[${i}][${j}]`, 'finite number', value);
      }
      column.push(value);
    }
    variables.push(column);
  }
  
  // Calculate covariance matrix
  const covMatrix: NumericMatrix = [];
  for (let i = 0; i < numVars; i++) {
    const row: NumericArray = [];
    for (let j = 0; j < numVars; j++) {
      if (i === j) {
        const varValue = variance(variables[i]!, options) as number;
        row.push(varValue);
      } else {
        const cov = covariance(variables[i]!, variables[j]!, options);
        row.push(cov);
      }
    }
    covMatrix.push(row);
  }
  
  return covMatrix;
}

// ============================================================================
// Robust Statistics
// ============================================================================

/**
 * Calculate the median absolute deviation (MAD)
 * @param arr - Array of numbers
 * @param constant - Scaling constant (default: 1.4826 for normal distribution)
 * @returns Median absolute deviation
 * 
 * @example
 * medianAbsoluteDeviation([1, 2, 3, 4, 5]) // Robust measure of spread
 */
export function medianAbsoluteDeviation(arr: NumericArray, constant: number = 1.4826): number {
  validateNumericArray(arr, 'arr');
  validateFiniteNumber(constant, 'constant');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('medianAbsoluteDeviation');
  }
  
  const arrayMedian = median(arr);
  const deviations: NumericArray = [];
  
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    deviations.push(Math.abs(value - arrayMedian));
  }
  
  return constant * median(deviations);
}

/**
 * Calculate trimmed mean (mean after removing outliers)
 * @param arr - Array of numbers
 * @param trimPercent - Percentage to trim from each end (0-50)
 * @returns Trimmed mean
 * 
 * @example
 * trimmedMean([1, 2, 3, 4, 100], 20) // Remove 20% from each end
 */
export function trimmedMean(arr: NumericArray, trimPercent: number): number {
  validateNumericArray(arr, 'arr');
  validateFiniteNumber(trimPercent, 'trimPercent');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('trimmedMean');
  }
  
  if (trimPercent < 0 || trimPercent > 50) {
    throw new InvalidParameterError(
      'trimPercent', 
      'number between 0 and 50', 
      trimPercent
    );
  }
  
  const sorted = [...arr].sort((a, b) => a - b);
  const trimCount = Math.floor((trimPercent / 100) * sorted.length);
  
  if (trimCount * 2 >= sorted.length) {
    throw new InvalidParameterError(
      'trimPercent', 
      'value that leaves at least one element', 
      trimPercent
    );
  }
  
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  return mean(trimmed) as number;
}

// ============================================================================
// Distribution Testing
// ============================================================================

/**
 * Calculate the Jarque-Bera test statistic for normality
 * @param arr - Array of numbers
 * @returns Jarque-Bera test statistic
 * 
 * @example
 * jarqueBeraTest([1, 2, 3, 4, 5]) // Test for normality
 */
export function jarqueBeraTest(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length < 4) {
    throw new InvalidParameterError(
      'arr', 
      'array with at least 4 elements', 
      arr,
      'Jarque-Bera test requires at least 4 data points'
    );
  }
  
  const n = arr.length;
  const s = skewness(arr);
  const k = kurtosis(arr);
  
  // Jarque-Bera statistic: JB = (n/6) * (S² + (1/4) * K²)
  return (n / 6) * (s * s + (k * k) / 4);
}

/**
 * Calculate Anderson-Darling test statistic for normality
 * @param arr - Array of numbers
 * @returns Anderson-Darling test statistic
 * 
 * @example
 * andersonDarlingTest([1, 2, 3, 4, 5]) // Test for normality
 */
export function andersonDarlingTest(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length < 3) {
    throw new InvalidParameterError(
      'arr', 
      'array with at least 3 elements', 
      arr,
      'Anderson-Darling test requires at least 3 data points'
    );
  }
  
  const n = arr.length;
  const sorted = [...arr].sort((a, b) => a - b);
  const arrayMean = mean(arr) as number;
  const arrayStd = standardDeviation(arr) as number;
  
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const value = sorted[i];
    if (value === undefined) {
      throw new InvalidParameterError(`sorted[${i}]`, 'finite number', value);
    }
    
    // Standardize the value
    const z = (value - arrayMean) / arrayStd;
    
    // Calculate cumulative distribution function for standard normal
    const phi = 0.5 * (1 + erf(z / Math.sqrt(2)));
    
    // Avoid log(0) by using small epsilon
    const epsilon = 1e-15;
    const logPhi = Math.log(Math.max(phi, epsilon));
    const log1MinusPhi = Math.log(Math.max(1 - phi, epsilon));
    
    sum += (2 * i + 1) * logPhi + (2 * (n - i) - 1) * log1MinusPhi;
  }
  
  return -n - sum / n;
}

/**
 * Error function approximation for Anderson-Darling test
 * @param x - Input value
 * @returns Error function value
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

// ============================================================================
// Histogram and Frequency Analysis
// ============================================================================

/**
 * Create a histogram of an array
 * @param arr - Array of numbers
 * @param bins - Number of bins or array of bin edges
 * @returns Object with bin edges and counts
 * 
 * @example
 * histogram([1, 2, 2, 3, 3, 3, 4], 4)
 * // { bins: [1, 1.75, 2.5, 3.25, 4], counts: [1, 2, 3, 1] }
 */
export function histogram(
  arr: NumericArray, 
  bins: number | NumericArray = 10
): { bins: NumericArray; counts: NumericArray } {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('histogram');
  }
  
  let binEdges: NumericArray;
  
  if (typeof bins === 'number') {
    validateInteger(bins, 'bins');
    if (bins <= 0) {
      throw new InvalidParameterError('bins', 'positive integer', bins);
    }
    
    const minVal = min(arr) as number;
    const maxVal = max(arr) as number;
    const binWidth = (maxVal - minVal) / bins;
    
    binEdges = [];
    for (let i = 0; i <= bins; i++) {
      binEdges.push(minVal + i * binWidth);
    }
  } else {
    validateNumericArray(bins, 'bins');
    if (bins.length < 2) {
      throw new InvalidParameterError(
        'bins', 
        'array with at least 2 elements', 
        bins
      );
    }
    binEdges = [...bins].sort((a, b) => a - b);
  }
  
  const counts: NumericArray = new Array(binEdges.length - 1).fill(0);
  
  for (const value of arr) {
    // Find which bin this value belongs to
    let binIndex = -1;
    for (let i = 0; i < binEdges.length - 1; i++) {
      const currentEdge = binEdges[i];
      const nextEdge = binEdges[i + 1];
      if (currentEdge === undefined || nextEdge === undefined) {
        throw new InvalidParameterError('binEdges', 'valid bin edges array', binEdges);
      }
      
      if (value >= currentEdge && (value < nextEdge || 
          (i === binEdges.length - 2 && value <= nextEdge))) {
        binIndex = i;
        break;
      }
    }
    
    if (binIndex >= 0) {
      const currentCount = counts[binIndex];
      if (currentCount === undefined) {
        throw new InvalidParameterError('counts', 'valid counts array', counts);
      }
      counts[binIndex] = currentCount + 1;
    }
  }
  
  return { bins: binEdges, counts };
}