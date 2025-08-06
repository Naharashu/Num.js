# Statistics API Reference

The statistics module provides comprehensive statistical analysis functions for descriptive statistics, probability distributions, and data analysis.

## Descriptive Statistics

### Central Tendency

#### `mean(arr: NumericArray | NumericMatrix, options?: StatisticalOptions): number | NumericArray`
Calculate the arithmetic mean (average).

```typescript
import { mean } from '@naharashu/num.js';

// Simple mean with NumericArray
const data: number[] = [1, 2, 3, 4, 5];
const average = mean(data); // 3

// Matrix operations with NumericMatrix
const matrix: number[][] = [[1, 2, 3], [4, 5, 6]];
const overallMean = mean(matrix);           // 3.5 (all elements)
const columnMeans = mean(matrix, { axis: 0 }); // [2.5, 3.5, 4.5]
const rowMeans = mean(matrix, { axis: 1 });    // [2, 5]
```

#### `median(arr: NumericArray): number`
Calculate the median (middle value).

```typescript
import { median } from '@naharashu/num.js';

const oddLength = [1, 3, 2, 5, 4];
const medianOdd = median(oddLength); // 3

const evenLength = [1, 2, 3, 4];
const medianEven = median(evenLength); // 2.5 (average of middle two)
```

#### `mode(arr: NumericArray): number | NumericArray`
Calculate the mode (most frequent value).

```typescript
import { mode } from '@naharashu/num.js';

const singleMode = [1, 2, 2, 3, 4];
const modeValue = mode(singleMode); // 2

const multipleMode = [1, 1, 2, 2, 3];
const modes = mode(multipleMode); // [1, 2]

const allEqual = [1, 2, 3, 4, 5];
const allModes = mode(allEqual); // [1, 2, 3, 4, 5]
```

#### `geometricMean(arr: NumericArray): number`
Calculate the geometric mean.

```typescript
import { geometricMean } from '@naharashu/num.js';

const data = [2, 8, 4];
const geomMean = geometricMean(data); // 4 (∛(2×8×4))

// Useful for growth rates, ratios
const growthRates = [1.1, 1.2, 0.9, 1.05];
const avgGrowth = geometricMean(growthRates); // ~1.06
```

#### `harmonicMean(arr: NumericArray): number`
Calculate the harmonic mean.

```typescript
import { harmonicMean } from '@naharashu/num.js';

const rates = [60, 40, 30]; // km/h
const avgRate = harmonicMean(rates); // ~40 km/h

// Useful for rates, ratios, and reciprocal relationships
```

#### `trimmedMean(arr: NumericArray, trimPercent: number): number`
Calculate mean after removing outliers.

```typescript
import { trimmedMean } from '@naharashu/num.js';

const dataWithOutliers = [1, 2, 3, 4, 5, 100]; // 100 is outlier
const regularMean = mean(dataWithOutliers);     // ~19.2
const trimmed = trimmedMean(dataWithOutliers, 0.2); // ~3 (removes 20% from each end)
```

### Measures of Variability

#### `variance(arr: NumericArray | NumericMatrix, options?: StatisticalOptions): number | NumericArray`
Calculate the variance.

```typescript
import { variance, fromArray } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5];
const popVariance = variance(data);              // Population variance
const sampleVariance = variance(data, { ddof: 1 }); // Sample variance (N-1)

// Matrix operations
const matrix = fromArray([[1, 2], [3, 4]]);
const colVariances = variance(matrix, { axis: 0 }); // Column variances
const rowVariances = variance(matrix, { axis: 1 }); // Row variances
```

#### `std(arr: NumericArray | NumericMatrix, options?: StatisticalOptions): number | NumericArray`
Calculate the standard deviation.

```typescript
import { std } from '@naharashu/num.js';

const data = [2, 4, 4, 4, 5, 5, 7, 9];
const popStd = std(data);              // Population std dev
const sampleStd = std(data, { ddof: 1 }); // Sample std dev

// Coefficient of variation
const cv = sampleStd / mean(data); // Relative variability
```

#### `medianAbsoluteDeviation(arr: NumericArray): number`
Calculate the median absolute deviation (robust measure of variability).

```typescript
import { medianAbsoluteDeviation } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5, 100]; // Contains outlier
const mad = medianAbsoluteDeviation(data); // More robust than std dev
const robustStd = mad * 1.4826; // Approximate standard deviation
```

#### `rootMeanSquare(arr: NumericArray): number`
Calculate the root mean square (RMS).

```typescript
import { rootMeanSquare } from '@naharashu/num.js';

const signal = [1, -2, 3, -4, 5];
const rms = rootMeanSquare(signal); // ~3.32

// Useful for signal processing, error metrics
```

#### `coefficientOfVariation(arr: NumericArray): number`
Calculate the coefficient of variation (relative variability).

```typescript
import { coefficientOfVariation } from '@naharashu/num.js';

const data1 = [10, 12, 14, 16, 18]; // Low variability
const data2 = [5, 15, 25, 35, 45];  // High variability

const cv1 = coefficientOfVariation(data1); // ~0.23
const cv2 = coefficientOfVariation(data2); // ~0.58
```

### Distribution Shape

#### `skewness(arr: NumericArray): number`
Calculate the skewness (asymmetry measure).

```typescript
import { skewness } from '@naharashu/num.js';

const symmetric = [1, 2, 3, 4, 5];
const skewSym = skewness(symmetric); // ~0 (symmetric)

const rightSkewed = [1, 1, 1, 2, 3, 4, 10];
const skewRight = skewness(rightSkewed); // > 0 (right-skewed)

const leftSkewed = [1, 7, 8, 9, 9, 9, 10];
const skewLeft = skewness(leftSkewed); // < 0 (left-skewed)
```

#### `kurtosis(arr: NumericArray): number`
Calculate the kurtosis (tail heaviness measure).

```typescript
import { kurtosis } from '@naharashu/num.js';

const normal = [1, 2, 3, 4, 5, 6, 7]; // Approximately normal
const kurtNormal = kurtosis(normal); // ~0 (mesokurtic)

const heavyTails = [1, 1, 3, 3, 3, 7, 7]; // Heavy tails
const kurtHeavy = kurtosis(heavyTails); // > 0 (leptokurtic)

const lightTails = [3, 3, 3, 4, 4, 4, 4]; // Light tails
const kurtLight = kurtosis(lightTails); // < 0 (platykurtic)
```

## Percentiles and Quantiles

#### `percentile(arr: NumericArray, percentile: number): number`
Calculate a specific percentile.

```typescript
import { percentile } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const q1 = percentile(data, 25);  // First quartile
const median = percentile(data, 50); // Median
const q3 = percentile(data, 75);  // Third quartile
const p90 = percentile(data, 90); // 90th percentile
```

#### `percentiles(arr: NumericArray, percentiles: number[]): number[]`
Calculate multiple percentiles at once.

```typescript
import { percentiles } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const quartiles = percentiles(data, [25, 50, 75]); // [3.25, 5.5, 7.75]

// Common percentile sets
const quintiles = percentiles(data, [20, 40, 60, 80]);
const deciles = percentiles(data, [10, 20, 30, 40, 50, 60, 70, 80, 90]);
```

#### `quantiles(arr: NumericArray, q: number): number[]`
Divide data into q equal parts.

```typescript
import { quantiles } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const quartileValues = quantiles(data, 4);  // 4 quartiles
const quintileValues = quantiles(data, 5);  // 5 quintiles
const decileValues = quantiles(data, 10);   // 10 deciles
```

## Extremes and Ranges

#### `min(arr: NumericArray | NumericMatrix, options?: StatisticalOptions): number | NumericArray`
Find minimum values.

```typescript
import { min, fromArray } from '@naharashu/num.js';

const data = [3, 1, 4, 1, 5, 9, 2, 6];
const minimum = min(data); // 1

// Matrix operations
const matrix = fromArray([[1, 2, 3], [4, 0, 6]]);
const overallMin = min(matrix);           // 0
const columnMins = min(matrix, { axis: 0 }); // [1, 0, 3]
const rowMins = min(matrix, { axis: 1 });    // [1, 0]
```

#### `max(arr: NumericArray | NumericMatrix, options?: StatisticalOptions): number | NumericArray`
Find maximum values.

```typescript
import { max, fromArray } from '@naharashu/num.js';

const data = [3, 1, 4, 1, 5, 9, 2, 6];
const maximum = max(data); // 9

// Matrix operations
const matrix = fromArray([[1, 2, 3], [4, 0, 6]]);
const overallMax = max(matrix);           // 6
const columnMaxs = max(matrix, { axis: 0 }); // [4, 2, 6]
const rowMaxs = max(matrix, { axis: 1 });    // [3, 6]
```

#### `range(arr: NumericArray): number`
Calculate the range (max - min).

```typescript
import { range } from '@naharashu/num.js';

const data = [1, 3, 5, 7, 9];
const dataRange = range(data); // 8 (9 - 1)
```

## Correlation and Covariance

#### `correlation(x: NumericArray, y: NumericArray): number`
Calculate Pearson correlation coefficient.

```typescript
import { correlation } from '@naharashu/num.js';

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 6, 8, 10]; // Perfect positive correlation
const corr = correlation(x, y); // 1.0

const z = [10, 8, 6, 4, 2]; // Perfect negative correlation
const corrNeg = correlation(x, z); // -1.0
```

#### `covariance(x: NumericArray, y: NumericArray, options?: StatisticalOptions): number`
Calculate covariance between two variables.

```typescript
import { covariance } from '@naharashu/num.js';

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 6, 8, 10];

const popCov = covariance(x, y);              // Population covariance
const sampleCov = covariance(x, y, { ddof: 1 }); // Sample covariance
```

#### `correlationMatrix(matrix: NumericMatrix): NumericMatrix`
Calculate correlation matrix for multiple variables.

```typescript
import { correlationMatrix, fromArray } from '@naharashu/num.js';

// Each column is a variable, each row is an observation
const data = [
  [1, 2, 3],  // Observation 1
  [2, 4, 5],  // Observation 2
  [3, 6, 7],  // Observation 3
  [4, 8, 9]   // Observation 4
];

const corrMatrix = correlationMatrix(data);
// Result is 3x3 matrix showing correlations between all variable pairs
```

#### `covarianceMatrix(matrix: NumericMatrix, options?: StatisticalOptions): NumericMatrix`
Calculate covariance matrix for multiple variables.

```typescript
import { covarianceMatrix } from '@naharashu/num.js';

const data = [
  [1, 2, 3],
  [2, 4, 5],
  [3, 6, 7],
  [4, 8, 9]
];

const covMatrix = covarianceMatrix(data);
const sampleCovMatrix = covarianceMatrix(data, { ddof: 1 });
```

## Data Distribution Analysis

#### `histogram(arr: NumericArray, bins?: number | NumericArray): { counts: number[]; edges: number[] }`
Create histogram of data distribution.

```typescript
import { histogram } from '@naharashu/num.js';

const data = [1, 1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5];

// Automatic binning
const hist1 = histogram(data);
console.log(hist1.counts); // Frequency counts
console.log(hist1.edges);  // Bin edges

// Specify number of bins
const hist2 = histogram(data, 5);

// Custom bin edges
const customBins = [0, 2, 4, 6];
const hist3 = histogram(data, customBins);
```

#### `summary(arr: NumericArray): StatisticalSummary`
Generate comprehensive statistical summary.

```typescript
import { summary } from '@naharashu/num.js';

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const stats = summary(data);

console.log(stats);
// {
//   count: 10,
//   mean: 5.5,
//   std: 2.87,
//   min: 1,
//   q1: 3.25,
//   median: 5.5,
//   q3: 7.75,
//   max: 10,
//   skewness: 0,
//   kurtosis: -1.2
// }
```

## Statistical Tests

#### `jarqueBeraTest(arr: NumericArray): { statistic: number; pValue: number; isNormal: boolean }`
Test for normality using Jarque-Bera test.

```typescript
import { jarqueBeraTest } from '@naharashu/num.js';

const normalData = [1, 2, 3, 4, 5, 4, 3, 2, 1]; // Approximately normal
const result1 = jarqueBeraTest(normalData);
console.log(result1.isNormal); // true (p > 0.05)

const skewedData = [1, 1, 1, 2, 3, 4, 10, 20, 30]; // Highly skewed
const result2 = jarqueBeraTest(skewedData);
console.log(result2.isNormal); // false (p < 0.05)
```

## Error Handling

Statistics functions throw specific errors for invalid inputs:

```typescript
import { EmptyArrayError, InvalidParameterError } from '@naharashu/num.js';

try {
  const emptyMean = mean([]); // Throws EmptyArrayError
} catch (error) {
  if (error instanceof EmptyArrayError) {
    console.log('Cannot calculate mean of empty array');
  }
}

try {
  const invalidPercentile = percentile([1, 2, 3], 150); // Throws InvalidParameterError
} catch (error) {
  if (error instanceof InvalidParameterError) {
    console.log('Percentile must be between 0 and 100');
  }
}
```

## Performance Notes

### Optimization Tips

1. **Use axis parameter**: For matrix operations, specify axis to avoid unnecessary computations
2. **Choose appropriate measures**: Use robust statistics (median, MAD) for data with outliers
3. **Batch operations**: Calculate multiple percentiles at once using `percentiles()`
4. **Memory efficiency**: Large datasets benefit from streaming algorithms

### Complexity Information

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Mean, Sum | O(n) | O(1) |
| Median | O(n log n) | O(n) |
| Mode | O(n) | O(n) |
| Variance, Std Dev | O(n) | O(1) |
| Percentiles | O(n log n) | O(n) |
| Correlation | O(n) | O(1) |
| Histogram | O(n) | O(bins) |

---

*For more examples and advanced usage patterns, see the [Examples](../examples/statistics/) section.*
