# Universal Functions API Reference

Universal functions (ufuncs) provide element-wise mathematical operations on NDArrays with automatic broadcasting support.

## Mathematical Operations

### Basic Arithmetic

#### `add(a: NDArray, b: NDArray | number): NDArray`
Element-wise addition.

```typescript
import { add, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3]);
const b = fromArray([4, 5, 6]);
const sum = add(a, b); // [5, 7, 9]

// Scalar addition
const scalar = add(a, 10); // [11, 12, 13]

// Broadcasting
const matrix = fromArray([[1, 2], [3, 4]]);
const vector = fromArray([10, 20]);
const broadcast = add(matrix, vector); // [[11, 22], [13, 24]]
```

#### `subtract(a: NDArray, b: NDArray | number): NDArray`
Element-wise subtraction.

```typescript
import { subtract, fromArray } from '@naharashu/num.js';

const a = fromArray([5, 7, 9]);
const b = fromArray([1, 2, 3]);
const diff = subtract(a, b); // [4, 5, 6]

// Scalar subtraction
const scalar = subtract(a, 2); // [3, 5, 7]
```

#### `multiply(a: NDArray, b: NDArray | number): NDArray`
Element-wise multiplication.

```typescript
import { multiply, fromArray } from '@naharashu/num.js';

const a = fromArray([2, 3, 4]);
const b = fromArray([5, 6, 7]);
const product = multiply(a, b); // [10, 18, 28]

// Scalar multiplication
const scaled = multiply(a, 3); // [6, 9, 12]
```

#### `divide(a: NDArray, b: NDArray | number): NDArray`
Element-wise division.

```typescript
import { divide, fromArray } from '@naharashu/num.js';

const a = fromArray([10, 15, 20]);
const b = fromArray([2, 3, 4]);
const quotient = divide(a, b); // [5, 5, 5]

// Scalar division
const scaled = divide(a, 5); // [2, 3, 4]
```

#### `power(a: NDArray, b: NDArray | number): NDArray`
Element-wise exponentiation.

```typescript
import { power, fromArray } from '@naharashu/num.js';

const base = fromArray([2, 3, 4]);
const exponent = fromArray([2, 3, 2]);
const result = power(base, exponent); // [4, 27, 16]

// Scalar exponent
const squares = power(base, 2); // [4, 9, 16]
```

#### `mod(a: NDArray, b: NDArray | number): NDArray`
Element-wise modulo operation.

```typescript
import { mod, fromArray } from '@naharashu/num.js';

const a = fromArray([10, 11, 12, 13]);
const b = fromArray([3, 3, 3, 3]);
const remainder = mod(a, b); // [1, 2, 0, 1]

// Scalar modulo
const mod3 = mod(a, 3); // [1, 2, 0, 1]
```

### Rounding Functions

#### `round(x: NDArray): NDArray`
Round to nearest integer.

```typescript
import { round, fromArray } from '@naharashu/num.js';

const x = fromArray([1.2, 2.7, -1.5, -2.3]);
const rounded = round(x); // [1, 3, -2, -2]
```

#### `floor(x: NDArray): NDArray`
Round down to nearest integer.

```typescript
import { floor, fromArray } from '@naharashu/num.js';

const x = fromArray([1.7, 2.3, -1.2, -2.8]);
const floored = floor(x); // [1, 2, -2, -3]
```

#### `ceil(x: NDArray): NDArray`
Round up to nearest integer.

```typescript
import { ceil, fromArray } from '@naharashu/num.js';

const x = fromArray([1.2, 2.7, -1.8, -2.1]);
const ceiled = ceil(x); // [2, 3, -1, -2]
```

#### `trunc(x: NDArray): NDArray`
Truncate towards zero.

```typescript
import { trunc, fromArray } from '@naharashu/num.js';

const x = fromArray([1.7, 2.3, -1.8, -2.3]);
const truncated = trunc(x); // [1, 2, -1, -2]
```

## Trigonometric Functions

### Basic Trigonometric

#### `sin(x: NDArray): NDArray`
Element-wise sine.

```typescript
import { sin, fromArray } from '@naharashu/num.js';

const angles = fromArray([0, Math.PI/6, Math.PI/4, Math.PI/2]);
const sines = sin(angles); // [0, 0.5, 0.707, 1]
```

#### `cos(x: NDArray): NDArray`
Element-wise cosine.

```typescript
import { cos, fromArray } from '@naharashu/num.js';

const angles = fromArray([0, Math.PI/3, Math.PI/2, Math.PI]);
const cosines = cos(angles); // [1, 0.5, 0, -1]
```

#### `tan(x: NDArray): NDArray`
Element-wise tangent.

```typescript
import { tan, fromArray } from '@naharashu/num.js';

const angles = fromArray([0, Math.PI/4, Math.PI/3]);
const tangents = tan(angles); // [0, 1, 1.732]
```

### Inverse Trigonometric

#### `asin(x: NDArray): NDArray`
Element-wise arcsine.

```typescript
import { asin, fromArray } from '@naharashu/num.js';

const values = fromArray([0, 0.5, 0.707, 1]);
const angles = asin(values); // [0, π/6, π/4, π/2]

// Input must be in [-1, 1]
```

#### `acos(x: NDArray): NDArray`
Element-wise arccosine.

```typescript
import { acos, fromArray } from '@naharashu/num.js';

const values = fromArray([1, 0.5, 0, -1]);
const angles = acos(values); // [0, π/3, π/2, π]

// Input must be in [-1, 1]
```

#### `atan(x: NDArray): NDArray`
Element-wise arctangent.

```typescript
import { atan, fromArray } from '@naharashu/num.js';

const values = fromArray([0, 1, 1.732, Infinity]);
const angles = atan(values); // [0, π/4, π/3, π/2]
```

#### `atan2(y: NDArray, x: NDArray): NDArray`
Two-argument arctangent.

```typescript
import { atan2, fromArray } from '@naharashu/num.js';

const y = fromArray([1, 1, -1, -1]);
const x = fromArray([1, -1, 1, -1]);
const angles = atan2(y, x); // [π/4, 3π/4, -π/4, -3π/4]

// Handles all quadrants correctly
```

## Hyperbolic Functions

#### `sinh(x: NDArray): NDArray`
Element-wise hyperbolic sine.

```typescript
import { sinh, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1, 2]);
const result = sinh(x); // [0, 1.175, 3.627]
```

#### `cosh(x: NDArray): NDArray`
Element-wise hyperbolic cosine.

```typescript
import { cosh, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1, 2]);
const result = cosh(x); // [1, 1.543, 3.762]
```

#### `tanh(x: NDArray): NDArray`
Element-wise hyperbolic tangent.

```typescript
import { tanh, fromArray } from '@naharashu/num.js';

const x = fromArray([-2, -1, 0, 1, 2]);
const result = tanh(x); // [-0.964, -0.762, 0, 0.762, 0.964]
```

### Inverse Hyperbolic

#### `asinh(x: NDArray): NDArray`
Element-wise inverse hyperbolic sine.

```typescript
import { asinh, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1.175, 3.627]);
const result = asinh(x); // [0, 1, 2]
```

#### `acosh(x: NDArray): NDArray`
Element-wise inverse hyperbolic cosine.

```typescript
import { acosh, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 1.543, 3.762]);
const result = acosh(x); // [0, 1, 2]

// Input must be >= 1
```

#### `atanh(x: NDArray): NDArray`
Element-wise inverse hyperbolic tangent.

```typescript
import { atanh, fromArray } from '@naharashu/num.js';

const x = fromArray([-0.762, 0, 0.762]);
const result = atanh(x); // [-1, 0, 1]

// Input must be in (-1, 1)
```

## Exponential and Logarithmic

#### `exp(x: NDArray): NDArray`
Element-wise exponential (e^x).

```typescript
import { exp, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1, 2, 3]);
const result = exp(x); // [1, 2.718, 7.389, 20.086]
```

#### `exp2(x: NDArray): NDArray`
Element-wise base-2 exponential (2^x).

```typescript
import { exp2, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1, 2, 3, 4]);
const result = exp2(x); // [1, 2, 4, 8, 16]
```

#### `log(x: NDArray): NDArray`
Element-wise natural logarithm.

```typescript
import { log, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 2.718, 7.389, 20.086]);
const result = log(x); // [0, 1, 2, 3]

// Input must be > 0
```

#### `log2(x: NDArray): NDArray`
Element-wise base-2 logarithm.

```typescript
import { log2, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 2, 4, 8, 16]);
const result = log2(x); // [0, 1, 2, 3, 4]
```

#### `log10(x: NDArray): NDArray`
Element-wise base-10 logarithm.

```typescript
import { log10, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 10, 100, 1000]);
const result = log10(x); // [0, 1, 2, 3]
```

#### `sqrt(x: NDArray): NDArray`
Element-wise square root.

```typescript
import { sqrt, fromArray } from '@naharashu/num.js';

const x = fromArray([0, 1, 4, 9, 16]);
const result = sqrt(x); // [0, 1, 2, 3, 4]

// Input must be >= 0
```

## Comparison Operations

#### `equal(a: NDArray, b: NDArray | number): NDArray`
Element-wise equality comparison.

```typescript
import { equal, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([1, 2, 5, 4]);
const result = equal(a, b); // [1, 1, 0, 1] (1 = true, 0 = false)

// Scalar comparison
const scalar = equal(a, 2); // [0, 1, 0, 0]
```

#### `notEqual(a: NDArray, b: NDArray | number): NDArray`
Element-wise inequality comparison.

```typescript
import { notEqual, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([1, 2, 5, 4]);
const result = notEqual(a, b); // [0, 0, 1, 0]
```

#### `less(a: NDArray, b: NDArray | number): NDArray`
Element-wise less-than comparison.

```typescript
import { less, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([2, 2, 2, 2]);
const result = less(a, b); // [1, 0, 0, 0]
```

#### `lessEqual(a: NDArray, b: NDArray | number): NDArray`
Element-wise less-than-or-equal comparison.

```typescript
import { lessEqual, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([2, 2, 2, 2]);
const result = lessEqual(a, b); // [1, 1, 0, 0]
```

#### `greater(a: NDArray, b: NDArray | number): NDArray`
Element-wise greater-than comparison.

```typescript
import { greater, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([2, 2, 2, 2]);
const result = greater(a, b); // [0, 0, 1, 1]
```

#### `greaterEqual(a: NDArray, b: NDArray | number): NDArray`
Element-wise greater-than-or-equal comparison.

```typescript
import { greaterEqual, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 2, 3, 4]);
const b = fromArray([2, 2, 2, 2]);
const result = greaterEqual(a, b); // [0, 1, 1, 1]
```

## Logical Operations

#### `logicalAnd(a: NDArray, b: NDArray): NDArray`
Element-wise logical AND.

```typescript
import { logicalAnd, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 0, 1, 0]); // Truthy/falsy values
const b = fromArray([1, 1, 0, 0]);
const result = logicalAnd(a, b); // [1, 0, 0, 0]
```

#### `logicalOr(a: NDArray, b: NDArray): NDArray`
Element-wise logical OR.

```typescript
import { logicalOr, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 0, 1, 0]);
const b = fromArray([1, 1, 0, 0]);
const result = logicalOr(a, b); // [1, 1, 1, 0]
```

#### `logicalXor(a: NDArray, b: NDArray): NDArray`
Element-wise logical XOR.

```typescript
import { logicalXor, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 0, 1, 0]);
const b = fromArray([1, 1, 0, 0]);
const result = logicalXor(a, b); // [0, 1, 1, 0]
```

#### `logicalNot(x: NDArray): NDArray`
Element-wise logical NOT.

```typescript
import { logicalNot, fromArray } from '@naharashu/num.js';

const x = fromArray([1, 0, 2, -1]);
const result = logicalNot(x); // [0, 1, 0, 0]
```

## Utility Functions

#### `abs(x: NDArray): NDArray`
Element-wise absolute value.

```typescript
import { abs, fromArray } from '@naharashu/num.js';

const x = fromArray([-3, -1, 0, 1, 3]);
const result = abs(x); // [3, 1, 0, 1, 3]
```

#### `sign(x: NDArray): NDArray`
Element-wise sign function.

```typescript
import { sign, fromArray } from '@naharashu/num.js';

const x = fromArray([-3, -1, 0, 1, 3]);
const result = sign(x); // [-1, -1, 0, 1, 1]
```

#### `maximum(a: NDArray, b: NDArray | number): NDArray`
Element-wise maximum.

```typescript
import { maximum, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 5, 3]);
const b = fromArray([4, 2, 6]);
const result = maximum(a, b); // [4, 5, 6]

// Scalar maximum
const scalar = maximum(a, 3); // [3, 5, 3]
```

#### `minimum(a: NDArray, b: NDArray | number): NDArray`
Element-wise minimum.

```typescript
import { minimum, fromArray } from '@naharashu/num.js';

const a = fromArray([1, 5, 3]);
const b = fromArray([4, 2, 6]);
const result = minimum(a, b); // [1, 2, 3]

// Scalar minimum
const scalar = minimum(a, 3); // [1, 3, 3]
```

## Conditional Operations

#### `where(condition: NDArray, x: NDArray | number, y: NDArray | number): NDArray`
Element-wise conditional selection.

```typescript
import { where, fromArray } from '@naharashu/num.js';

const condition = fromArray([1, 0, 1, 0]); // Boolean mask
const x = fromArray([10, 20, 30, 40]);     // Values when true
const y = fromArray([1, 2, 3, 4]);         // Values when false

const result = where(condition, x, y); // [10, 2, 30, 4]

// Scalar values
const scalar = where(condition, 100, 0); // [100, 0, 100, 0]
```

#### `clip(x: NDArray, min: number, max: number): NDArray`
Clip values to a range.

```typescript
import { clip, fromArray } from '@naharashu/num.js';

const x = fromArray([-2, -1, 0, 1, 2, 3, 4, 5]);
const clipped = clip(x, 0, 3); // [0, 0, 0, 1, 2, 3, 3, 3]
```

## Reduction Operations

#### `any(arr: NDArray, axis?: number): boolean | NDArray`
Test whether any array element is true.

```typescript
import { any, fromArray } from '@naharashu/num.js';

const arr = fromArray([0, 0, 1, 0]);
const result = any(arr); // true

// Matrix operations
const matrix = fromArray([[0, 1, 0], [0, 0, 0]]);
const anyRows = any(matrix, 1); // [true, false]
const anyCols = any(matrix, 0); // [false, true, false]
```

#### `all(arr: NDArray, axis?: number): boolean | NDArray`
Test whether all array elements are true.

```typescript
import { all, fromArray } from '@naharashu/num.js';

const arr = fromArray([1, 1, 1, 1]);
const result = all(arr); // true

const mixed = fromArray([1, 1, 0, 1]);
const result2 = all(mixed); // false
```

## Broadcasting

Universal functions automatically handle broadcasting between arrays of different shapes:

```typescript
import { add, fromArray } from '@naharashu/num.js';

// Scalar broadcasting
const arr = fromArray([[1, 2, 3], [4, 5, 6]]);
const scalar = add(arr, 10); // Adds 10 to each element

// Vector broadcasting
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);
const vector = fromArray([10, 20, 30]);
const broadcast = add(matrix, vector); // Adds vector to each row

// Compatible shape broadcasting
const a = fromArray([[1], [2], [3]]);     // Shape: [3, 1]
const b = fromArray([10, 20]);            // Shape: [2]
const result = add(a, b);                 // Shape: [3, 2]
```

## Error Handling

Universal functions throw specific errors for invalid operations:

```typescript
import { InvalidParameterError, ShapeError } from '@naharashu/num.js';

try {
  const x = fromArray([2, -1, 0]);
  const result = sqrt(x); // Negative values not allowed
} catch (error) {
  if (error instanceof InvalidParameterError) {
    console.log('Invalid input for square root');
  }
}

try {
  const a = fromArray([[1, 2, 3]]);
  const b = fromArray([[1], [2]]);
  const result = add(a, b); // Incompatible shapes
} catch (error) {
  if (error instanceof ShapeError) {
    console.log('Broadcasting failed: incompatible shapes');
  }
}
```

## Performance Notes

### Optimization Tips

1. **Use ufuncs over loops**: Universal functions are optimized and faster than manual loops
2. **Leverage broadcasting**: Avoid explicit reshaping when broadcasting can handle it
3. **Chain operations**: Multiple ufunc calls are optimized for memory efficiency
4. **Choose appropriate dtypes**: Use appropriate numeric types for your data

### Memory Efficiency

Universal functions create new arrays by default, but you can optimize memory usage:

```typescript
// Memory-efficient chaining
const result = add(multiply(x, 2), 1); // Intermediate arrays are optimized

// Reuse arrays when possible
const temp = zeros([1000, 1000]);
// Use temp for intermediate calculations
```

---

*For more examples and advanced usage patterns, see the [Examples](../examples/ufuncs/) section.*
