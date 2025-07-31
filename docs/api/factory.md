# Factory Functions API Reference

Factory functions provide convenient ways to create NDArrays with specific patterns, values, or from existing data structures.

## Array Creation Functions

### Zero and One Arrays

#### `zeros<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array filled with zeros.

```typescript
import { zeros } from '@naharashu/num.js';

// 1D array
const vector = zeros([5]); // [0, 0, 0, 0, 0]

// 2D array (matrix)
const matrix = zeros([3, 4]); // 3x4 matrix of zeros

// 3D array (tensor)
const tensor = zeros([2, 3, 4]); // 2x3x4 tensor of zeros

// Specify data type
const float32Array = zeros<'float32'>([3, 3]);
const int32Array = zeros<'int32'>([2, 2]);
```

#### `ones<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array filled with ones.

```typescript
import { ones } from '@naharashu/num.js';

// Basic usage
const vector = ones([4]); // [1, 1, 1, 1]
const matrix = ones([2, 3]); // 2x3 matrix of ones

// With specific dtype
const float32Ones = ones<'float32'>([3, 3]);
const int16Ones = ones<'int16'>([2, 2]);
```

#### `full<T>(shape: Shape, value: number, dtype?: T): NDArray<T>`
Create an array filled with a specific value.

```typescript
import { full } from '@naharashu/num.js';

// Fill with specific value
const fives = full([3, 2], 5); // 3x2 matrix filled with 5
const negatives = full([4], -2.5); // [-2.5, -2.5, -2.5, -2.5]

// With dtype
const intFull = full<'int32'>([2, 2], 42);
```

### Identity and Diagonal Arrays

#### `eye<T>(n: number, m?: number, k?: number, dtype?: T): NDArray<T>`
Create an identity matrix or matrix with ones on a diagonal.

```typescript
import { eye } from '@naharashu/num.js';

// Square identity matrix
const identity3x3 = eye(3);
// [[1, 0, 0],
//  [0, 1, 0],
//  [0, 0, 1]]

// Rectangular matrix
const rect = eye(3, 4);
// [[1, 0, 0, 0],
//  [0, 1, 0, 0],
//  [0, 0, 1, 0]]

// Offset diagonal (k=1 for super-diagonal, k=-1 for sub-diagonal)
const superDiag = eye(3, 3, 1);
// [[0, 1, 0],
//  [0, 0, 1],
//  [0, 0, 0]]

const subDiag = eye(3, 3, -1);
// [[0, 0, 0],
//  [1, 0, 0],
//  [0, 1, 0]]

// With specific dtype
const float32Identity = eye<'float32'>(4);
```

#### `diag<T>(v: NDArray | number[], k?: number, dtype?: T): NDArray<T>`
Create a diagonal matrix from a vector or extract diagonal from a matrix.

```typescript
import { diag, fromArray } from '@naharashu/num.js';

// Create diagonal matrix from vector
const vector = [1, 2, 3, 4];
const diagMatrix = diag(vector);
// [[1, 0, 0, 0],
//  [0, 2, 0, 0],
//  [0, 0, 3, 0],
//  [0, 0, 0, 4]]

// Offset diagonal
const offsetDiag = diag([1, 2, 3], 1); // Super-diagonal

// Extract diagonal from matrix
const matrix = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
const diagonal = diag(matrix); // [1, 5, 9]
```

### Sequence Arrays

#### `arange<T>(start: number, stop?: number, step?: number, dtype?: T): NDArray<T>`
Create an array with evenly spaced values within a range.

```typescript
import { arange } from '@naharashu/num.js';

// Simple range (0 to n-1)
const simple = arange(5); // [0, 1, 2, 3, 4]

// Start and stop
const range = arange(2, 8); // [2, 3, 4, 5, 6, 7]

// With step
const stepped = arange(0, 10, 2); // [0, 2, 4, 6, 8]
const backwards = arange(10, 0, -2); // [10, 8, 6, 4, 2]

// Floating point
const floats = arange(0, 1, 0.2); // [0, 0.2, 0.4, 0.6, 0.8]

// With specific dtype
const int32Range = arange<'int32'>(0, 10, 2);
const float32Range = arange<'float32'>(0, 1, 0.1);
```

#### `linspace<T>(start: number, stop: number, num?: number, endpoint?: boolean, dtype?: T): NDArray<T>`
Create an array with evenly spaced values over a specified interval.

```typescript
import { linspace } from '@naharashu/num.js';

// Basic usage (50 points by default)
const basic = linspace(0, 1); // 50 evenly spaced points from 0 to 1

// Specify number of points
const tenPoints = linspace(0, 10, 11); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Exclude endpoint
const noEndpoint = linspace(0, 1, 5, false); // [0, 0.2, 0.4, 0.6, 0.8]

// Include endpoint (default)
const withEndpoint = linspace(0, 1, 5, true); // [0, 0.25, 0.5, 0.75, 1]

// With specific dtype
const float32Lin = linspace<'float32'>(0, 1, 10);
```

#### `logspace<T>(start: number, stop: number, num?: number, base?: number, dtype?: T): NDArray<T>`
Create an array with logarithmically spaced values.

```typescript
import { logspace } from '@naharashu/num.js';

// Base 10 logarithmic spacing (default)
const log10 = logspace(0, 2, 3); // [1, 10, 100] (10^0, 10^1, 10^2)

// Different base
const log2 = logspace(0, 4, 5, 2); // [1, 2, 4, 8, 16] (2^0, 2^1, 2^2, 2^3, 2^4)

// More points
const detailed = logspace(0, 3, 10); // 10 points from 10^0 to 10^3

// With specific dtype
const float32Log = logspace<'float32'>(0, 2, 5);
```

### Grid Arrays

#### `meshgrid<T>(x: NDArray, y: NDArray, indexing?: 'xy' | 'ij'): { X: NDArray<T>; Y: NDArray<T> }`
Create coordinate matrices from coordinate vectors.

```typescript
import { meshgrid, linspace } from '@naharashu/num.js';

const x = linspace(0, 2, 3); // [0, 1, 2]
const y = linspace(0, 1, 2); // [0, 1]

// Cartesian indexing (default)
const { X, Y } = meshgrid(x, y, 'xy');
// X: [[0, 1, 2],
//     [0, 1, 2]]
// Y: [[0, 0, 0],
//     [1, 1, 1]]

// Matrix indexing
const { X: Xi, Y: Yi } = meshgrid(x, y, 'ij');
// Xi: [[0, 0],
//      [1, 1],
//      [2, 2]]
// Yi: [[0, 1],
//      [0, 1],
//      [0, 1]]
```

#### `mgrid(ranges: Array<[number, number, number]>): NDArray[]`
Create dense multi-dimensional grids.

```typescript
import { mgrid } from '@naharashu/num.js';

// 2D grid
const [X, Y] = mgrid([[0, 3, 1], [0, 2, 1]]);
// Creates coordinate arrays for a 3x2 grid

// 3D grid
const [X, Y, Z] = mgrid([[0, 2, 1], [0, 2, 1], [0, 2, 1]]);
// Creates coordinate arrays for a 2x2x2 grid
```

## Array Conversion Functions

### From JavaScript Arrays

#### `fromArray<T>(arr: NestedArray, dtype?: T): NDArray<T>`
Create an NDArray from a JavaScript array.

```typescript
import { fromArray } from '@naharashu/num.js';

// 1D array
const vector = fromArray([1, 2, 3, 4, 5]);

// 2D array (matrix)
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);

// 3D array (tensor)
const tensor = fromArray([
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]]
]);

// With specific dtype
const float32Array = fromArray<'float32'>([[1, 2], [3, 4]]);
const int16Array = fromArray<'int16'>([1, 2, 3, 4]);

// Mixed types are converted
const mixed = fromArray([1, 2.5, 3]); // All converted to float64
```

#### `asarray<T>(arr: NDArray | NestedArray, dtype?: T): NDArray<T>`
Convert input to NDArray (no-op if already NDArray with same dtype).

```typescript
import { asarray, zeros } from '@naharashu/num.js';

// From JavaScript array
const fromJS = asarray([1, 2, 3, 4]);

// From existing NDArray (no copy if same dtype)
const existing = zeros([3, 3]);
const same = asarray(existing); // No copy, same reference

// Type conversion
const converted = asarray<'float32'>(existing); // Copy with type conversion
```

### From TypedArrays

#### `fromTypedArray<T>(data: TypedArray, shape: Shape, dtype?: T): NDArray<T>`
Create an NDArray from a TypedArray.

```typescript
import { fromTypedArray } from '@naharashu/num.js';

// From Float64Array
const float64Data = new Float64Array([1, 2, 3, 4, 5, 6]);
const matrix = fromTypedArray(float64Data, [2, 3]);

// From Int32Array
const int32Data = new Int32Array([1, 2, 3, 4]);
const vector = fromTypedArray(int32Data, [4], 'int32');

// From Uint8Array (useful for image data)
const imageData = new Uint8Array(256 * 256 * 3); // RGB image
const image = fromTypedArray(imageData, [256, 256, 3], 'uint8');
```

## Random Array Generation

### Random Values

#### `random<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array with random values from uniform distribution [0, 1).

```typescript
import { random } from '@naharashu/num.js';

// Random vector
const randomVec = random([5]); // 5 random values

// Random matrix
const randomMat = random([3, 4]); // 3x4 matrix of random values

// With specific dtype
const float32Random = random<'float32'>([2, 2]);
```

#### `randn<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array with random values from standard normal distribution.

```typescript
import { randn } from '@naharashu/num.js';

// Standard normal random values
const normal = randn([1000]); // Mean ≈ 0, std ≈ 1

// Random matrix
const normalMat = randn([10, 10]);

// With specific dtype
const float32Normal = randn<'float32'>([5, 5]);
```

#### `randint<T>(low: number, high: number, shape: Shape, dtype?: T): NDArray<T>`
Create an array with random integers.

```typescript
import { randint } from '@naharashu/num.js';

// Random integers from 0 to 9
const dice = randint(0, 10, [100]); // 100 random integers

// Random matrix
const randomMat = randint(1, 7, [6, 6]); // 6x6 matrix of dice rolls

// With specific dtype
const int32Random = randint<'int32'>(0, 100, [10, 10]);
```

### Random Sampling

#### `choice<T>(a: NDArray | number, size?: Shape, replace?: boolean, p?: NDArray): NDArray<T>`
Random sampling from array or range.

```typescript
import { choice, fromArray } from '@naharashu/num.js';

// Sample from range
const sample1 = choice(10, [5]); // 5 samples from [0, 1, 2, ..., 9]

// Sample from array
const options = fromArray([1, 3, 5, 7, 9]);
const sample2 = choice(options, [3]); // 3 samples from options

// Without replacement
const unique = choice(10, [5], false); // 5 unique samples

// With probabilities
const probs = fromArray([0.1, 0.2, 0.3, 0.4]); // Must sum to 1
const weighted = choice(4, [100], true, probs);
```

#### `shuffle<T>(arr: NDArray<T>): NDArray<T>`
Randomly shuffle array elements.

```typescript
import { shuffle, arange } from '@naharashu/num.js';

const ordered = arange(10); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const shuffled = shuffle(ordered); // Random permutation

// For matrices, shuffles along first axis (rows)
const matrix = fromArray([[1, 2], [3, 4], [5, 6]]);
const shuffledRows = shuffle(matrix); // Rows in random order
```

## Specialized Arrays

### Vandermonde Matrix

#### `vander<T>(x: NDArray, n?: number, increasing?: boolean): NDArray<T>`
Generate Vandermonde matrix.

```typescript
import { vander, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 2, 3, 4]);

// Default (decreasing powers)
const vanderDefault = vander(x);
// [[1, 1, 1, 1],
//  [8, 4, 2, 1],
//  [27, 9, 3, 1],
//  [64, 16, 4, 1]]

// Specify number of columns
const vander3 = vander(x, 3);
// [[1, 1, 1],
//  [4, 2, 1],
//  [9, 3, 1],
//  [16, 4, 1]]

// Increasing powers
const vanderInc = vander(x, 4, true);
// [[1, 1, 1, 1],
//  [1, 2, 4, 8],
//  [1, 3, 9, 27],
//  [1, 4, 16, 64]]
```

### Companion Matrix

#### `companion<T>(a: NDArray): NDArray<T>`
Create companion matrix from polynomial coefficients.

```typescript
import { companion, fromArray } from '@naharashu/num.js';

// Polynomial: x^3 - 2x^2 + 3x - 4
const coeffs = fromArray([1, -2, 3, -4]); // Highest degree first
const comp = companion(coeffs);
// [[2, -3, 4],
//  [1, 0, 0],
//  [0, 1, 0]]
```

## Type System Integration

### Generic Type Support

Factory functions support full TypeScript generic typing:

```typescript
import { zeros, ones, arange } from '@naharashu/num.js';

// Explicit type specification
const float32Array = zeros<'float32'>([3, 3]);
const int32Array = ones<'int32'>([2, 2]);
const uint8Array = arange<'uint8'>(0, 256);

// Type inference
const inferred = fromArray([1, 2, 3]); // NDArray<'float64'>
const mixed = fromArray([1, 2.5, 3]); // NDArray<'float64'>
```

### Data Type Conversion

```typescript
import { asarray, zeros } from '@naharashu/num.js';

// Automatic conversion
const original = zeros([3, 3]); // float64 by default
const converted = asarray<'float32'>(original); // Convert to float32

// Preserve type when possible
const same = asarray(original); // No conversion, same reference
```

## Performance Considerations

### Memory Efficiency

```typescript
// Efficient for large arrays
const large = zeros([1000, 1000]); // Pre-allocated, efficient

// Memory-conscious random generation
const randomChunk = random([100, 100]); // Generate in chunks for very large arrays
```

### Initialization Patterns

```typescript
// Fast initialization
const fast = zeros([1000, 1000]); // Fastest for zero-filled arrays
const ones_array = ones([1000, 1000]); // Fast for one-filled arrays

// Custom initialization (slower but flexible)
const custom = full([1000, 1000], Math.PI); // Custom value
```

## Error Handling

Factory functions throw specific errors for invalid parameters:

```typescript
import { InvalidParameterError, ShapeError } from '@naharashu/num.js';

try {
  const invalid = zeros([-1, 5]); // Negative dimension
} catch (error) {
  if (error instanceof InvalidParameterError) {
    console.log('Invalid shape specification');
  }
}

try {
  const badRange = arange(10, 0, 2); // Impossible range
} catch (error) {
  if (error instanceof InvalidParameterError) {
    console.log('Invalid range parameters');
  }
}
```

---

*For more examples and advanced usage patterns, see the [Examples](../examples/factory/) section.*
