# NDArray API Reference

The `NDArray` class is the core data structure of Num.js, providing N-dimensional array functionality similar to NumPy's ndarray.

## Class Definition

```typescript
class NDArray<T extends DType = 'float64'> {
  constructor(
    data: TypedArrayConstructor | number[],
    shape: Shape,
    dtype: T,
    offset?: number,
    strides?: number[],
    readonly?: boolean
  )
}
```

## Properties

### Core Properties

#### `shape: Shape`
The dimensions of the array as a tuple of integers.

```typescript
import { zeros } from '@naharashu/num.js';

const arr = zeros([3, 4, 2]);
console.log(arr.shape); // [3, 4, 2]
```

#### `ndim: number`
Number of dimensions (rank) of the array.

```typescript
import { zeros } from '@naharashu/num.js';

const matrix = zeros([3, 4]);
console.log(matrix.ndim); // 2
```

#### `size: number`
Total number of elements in the array.

```typescript
import { zeros } from '@naharashu/num.js';

const arr = zeros([3, 4]);
console.log(arr.size); // 12
```

#### `dtype: T`
Data type of the array elements.

```typescript
const arr = zeros<'float32'>([3, 3]);
console.log(arr.dtype); // 'float32'
```

#### `data: TypedArray`
The underlying typed array containing the data.

```typescript
const arr = fromArray([1, 2, 3]);
console.log(arr.data); // Float64Array [1, 2, 3]
```

## Static Methods

### Array Creation

#### `NDArray.zeros<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array filled with zeros.

```typescript
const zeros2d = NDArray.zeros([2, 3]);           // float64 by default
const zeros32 = NDArray.zeros<'float32'>([2, 3]); // explicit float32
```

#### `NDArray.ones<T>(shape: Shape, dtype?: T): NDArray<T>`
Create an array filled with ones.

```typescript
const ones2d = NDArray.ones([3, 2]);
const ones32 = NDArray.ones<'int32'>([3, 2]);
```

#### `NDArray.full<T>(shape: Shape, value: number, dtype?: T): NDArray<T>`
Create an array filled with a specific value.

```typescript
const fives = NDArray.full([2, 2], 5);
const negatives = NDArray.full([3, 3], -1.5);
```

#### `NDArray.eye<T>(n: number, m?: number, k?: number, dtype?: T): NDArray<T>`
Create an identity matrix or matrix with ones on a diagonal.

```typescript
const identity = NDArray.eye(3);              // 3x3 identity matrix
const rectangular = NDArray.eye(3, 4);        // 3x4 matrix with diagonal ones
const offset = NDArray.eye(3, 3, 1);          // ones on super-diagonal
```

#### `NDArray.fromArray<T>(arr: NestedArray, dtype?: T): NDArray<T>`
Create an NDArray from a JavaScript array.

```typescript
const vector = NDArray.fromArray([1, 2, 3, 4]);
const matrix = NDArray.fromArray([[1, 2], [3, 4]]);
const tensor3d = NDArray.fromArray([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
```

## Instance Methods

### Array Access and Manipulation

#### `get(indices: number[]): number`
Get a single element from the array.

```typescript
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);
const element = matrix.get([1, 2]); // 6
```

#### `set(indices: number[], value: number): void`
Set a single element in the array.

```typescript
const matrix = zeros([2, 3]);
matrix.set([0, 1], 42);
console.log(matrix.get([0, 1])); // 42
```

#### `slice(slices: SliceInput[]): NDArray<T>`
Extract a slice of the array.

```typescript
const matrix = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// Get first row
const row = matrix.slice([0, ':']);        // [1, 2, 3]

// Get second column
const col = matrix.slice([':', 1]);        // [2, 5, 8]

// Get submatrix
const sub = matrix.slice(['0:2', '1:3']);  // [[2, 3], [5, 6]]
```

#### `reshape(newShape: Shape): NDArray<T>`
Return a new array with the same data but different shape.

```typescript
const vector = arange(0, 12);
const matrix = vector.reshape([3, 4]);
const tensor = vector.reshape([2, 2, 3]);
```

#### `transpose(axes?: number[]): NDArray<T>`
Return the transpose of the array.

```typescript
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);
const transposed = matrix.transpose();     // [[1, 4], [2, 5], [3, 6]]

// For higher dimensions, specify axes
const tensor = zeros([2, 3, 4]);
const reordered = tensor.transpose([2, 0, 1]); // Shape becomes [4, 2, 3]
```

### Mathematical Operations

#### `add(other: NDArray<T> | number): NDArray<T>`
Element-wise addition.

```typescript
const a = fromArray([1, 2, 3]);
const b = fromArray([4, 5, 6]);
const sum = a.add(b);           // [5, 7, 9]
const scalar = a.add(10);       // [11, 12, 13]
```

#### `subtract(other: NDArray<T> | number): NDArray<T>`
Element-wise subtraction.

```typescript
const a = fromArray([5, 7, 9]);
const b = fromArray([1, 2, 3]);
const diff = a.subtract(b);     // [4, 5, 6]
const scalar = a.subtract(2);   // [3, 5, 7]
```

#### `multiply(other: NDArray<T> | number): NDArray<T>`
Element-wise multiplication.

```typescript
const a = fromArray([2, 3, 4]);
const b = fromArray([5, 6, 7]);
const product = a.multiply(b);  // [10, 18, 28]
const scaled = a.multiply(3);   // [6, 9, 12]
```

#### `divide(other: NDArray<T> | number): NDArray<T>`
Element-wise division.

```typescript
const a = fromArray([10, 15, 20]);
const b = fromArray([2, 3, 4]);
const quotient = a.divide(b);   // [5, 5, 5]
const scaled = a.divide(5);     // [2, 3, 4]
```

#### `dot(other: NDArray<T>): NDArray<T>`
Matrix multiplication or dot product.

```typescript
// Vector dot product
const v1 = fromArray([1, 2, 3]);
const v2 = fromArray([4, 5, 6]);
const dotProduct = v1.dot(v2);  // Scalar: 32

// Matrix multiplication
const A = fromArray([[1, 2], [3, 4]]);
const B = fromArray([[5, 6], [7, 8]]);
const C = A.dot(B);             // [[19, 22], [43, 50]]
```

### Statistical Methods

#### `sum(axis?: number): number | NDArray<T>`
Sum of array elements.

```typescript
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);

const total = matrix.sum();        // 21 (all elements)
const colSums = matrix.sum(0);     // [5, 7, 9] (column sums)
const rowSums = matrix.sum(1);     // [6, 15] (row sums)
```

#### `mean(axis?: number): number | NDArray<T>`
Arithmetic mean of array elements.

```typescript
const data = fromArray([1, 2, 3, 4, 5]);
const average = data.mean();       // 3

const matrix = fromArray([[1, 2], [3, 4]]);
const colMeans = matrix.mean(0);   // [2, 3]
const rowMeans = matrix.mean(1);   // [1.5, 3.5]
```

#### `std(axis?: number, ddof?: number): number | NDArray<T>`
Standard deviation of array elements.

```typescript
const data = fromArray([1, 2, 3, 4, 5]);
const stdDev = data.std();         // Population standard deviation
const sampleStd = data.std(undefined, 1); // Sample standard deviation
```

#### `variance(axis?: number, ddof?: number): number | NDArray<T>`
Variance of array elements.

```typescript
const data = fromArray([1, 2, 3, 4, 5]);
const variance = data.variance();  // Population variance
const sampleVar = data.variance(undefined, 1); // Sample variance
```

### Utility Methods

#### `clone(): NDArray<T>`
Create a deep copy of the array.

```typescript
const original = fromArray([1, 2, 3]);
const copy = original.clone();
copy.set([0], 99);
console.log(original.get([0])); // Still 1
```

#### `toArray(): NestedArray`
Convert the NDArray back to a JavaScript array.

```typescript
const matrix = fromArray([[1, 2], [3, 4]]);
const jsArray = matrix.toArray(); // [[1, 2], [3, 4]]
```

#### `toString(): string`
String representation of the array.

```typescript
const matrix = fromArray([[1, 2], [3, 4]]);
console.log(matrix.toString());
// Output:
// [[1, 2],
//  [3, 4]]
```

## Broadcasting

NDArray supports NumPy-style broadcasting for operations between arrays of different shapes:

```typescript
// Scalar broadcasting
const arr = fromArray([[1, 2, 3], [4, 5, 6]]);
const result = arr.add(10); // Adds 10 to each element

// Array broadcasting
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);
const vector = fromArray([10, 20, 30]);
const broadcast = matrix.add(vector); // Adds vector to each row
```

## Type Safety

NDArray provides full TypeScript support with generic type parameters:

```typescript
// Explicit dtype specification
const float32Array = NDArray.zeros<'float32'>([3, 3]);
const int32Array = NDArray.ones<'int32'>([2, 2]);

// Type inference from input
const inferred = NDArray.fromArray([1, 2, 3]); // NDArray<'float64'>
```

## Error Handling

NDArray methods throw typed errors for invalid operations:

```typescript
import { InvalidParameterError, ShapeError } from '@naharashu/num.js';

try {
  const arr = zeros([2, 3]);
  arr.get([5, 0]); // Index out of bounds
} catch (error) {
  if (error instanceof InvalidParameterError) {
    console.log('Invalid index:', error.message);
  }
}
```

---

*For more examples and advanced usage patterns, see the [Examples](../examples/) section.*
