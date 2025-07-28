/**
 * Statistical functions for Num.js TypeScript migration
 * Provides type-safe implementations of statistical operations with comprehensive error handling
 */

import type { 
  NumericArray, 
  StatisticalOptions,
  Axis 
} from '../types/common.js';
import { 
  InvalidParameterError, 
  EmptyArrayError,
  MathematicalError 
} from '../types/errors.js';
import { 
  validateNumericArray,
  validateFiniteNumber,
  validateNonNegativeNumber,
  validateInteger 
} from '../types/validation.js';

// ============================================================================
// Basic Statistical Functions
// ============================================================================

/**
 * Calculate the arithmetic mean (average) of an array
 * @param arr - Array of numbers
 * @returns The mean value
 * 
 * @example
 * mean([1, 2, 3, 4, 5]) // 3
 * mean([10, 20, 30]) // 20
 */
export function mean(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('mean');
  }
  
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    sum += value;
  }
  
  return sum / arr.length;
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
 * @param arr - Array of numbers
 * @param options - Statistical options (ddof for degrees of freedom)
 * @returns The variance
 * 
 * @example
 * variance([1, 2, 3, 4, 5]) // 2.5 (population variance)
 * variance([1, 2, 3, 4, 5], { ddof: 1 }) // 2.5 (sample variance)
 */
export function variance(arr: NumericArray, options: StatisticalOptions = {}): number {
  validateNumericArray(arr, 'arr');
  
  const { ddof = 0 } = options;
  validateNonNegativeNumber(ddof, 'ddof');
  validateInteger(ddof, 'ddof');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('variance');
  }
  
  if (arr.length <= ddof) {
    throw new InvalidParameterError(
      'ddof', 
      `less than array length (${arr.length})`, 
      ddof,
      'Degrees of freedom cannot be greater than or equal to array length'
    );
  }
  
  const arrayMean = mean(arr);
  let sumSquaredDiffs = 0;
  
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined) {
      throw new InvalidParameterError(`arr[${i}]`, 'finite number', value);
    }
    const diff = value - arrayMean;
    sumSquaredDiffs += diff * diff;
  }
  
  return sumSquaredDiffs / (arr.length - ddof);
}

/**
 * Calculate the standard deviation of an array
 * @param arr - Array of numbers
 * @param options - Statistical options (ddof for degrees of freedom)
 * @returns The standard deviation
 * 
 * @example
 * standardDeviation([1, 2, 3, 4, 5]) // ~1.58 (population std dev)
 * standardDeviation([1, 2, 3, 4, 5], { ddof: 1 }) // ~1.58 (sample std dev)
 */
export function standardDeviation(arr: NumericArray, options: StatisticalOptions = {}): number {
  const varianceValue = variance(arr, options);
  return Math.sqrt(varianceValue);
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
 * @param arr - Array of numbers
 * @returns The minimum value
 * 
 * @example
 * min([3, 1, 4, 1, 5]) // 1
 */
export function min(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('min');
  }
  
  return Math.min(...arr);
}

/**
 * Find the maximum value in an array
 * @param arr - Array of numbers
 * @returns The maximum value
 * 
 * @example
 * max([3, 1, 4, 1, 5]) // 5
 */
export function max(arr: NumericArray): number {
  validateNumericArray(arr, 'arr');
  
  if (arr.length === 0) {
    throw new EmptyArrayError('max');
  }
  
  return Math.max(...arr);
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
  return max(arr) - min(arr);
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
  
  const arrayMean = mean(arr);
  const arrayStd = standardDeviation(arr, options);
  
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
  
  const arrayMean = mean(arr);
  const arrayStd = standardDeviation(arr, options);
  
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
  
  const meanX = mean(x);
  const meanY = mean(y);
  
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
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);
  
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
    mean: mean(arr),
    median: median(arr),
    mode: mode(arr),
    min: min(arr),
    max: max(arr),
    range: range(arr),
    variance: variance(arr),
    standardDeviation: standardDeviation(arr),
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
    
    const minVal = min(arr);
    const maxVal = max(arr);
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