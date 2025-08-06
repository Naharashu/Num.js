# Getting Started with Num.js

Welcome to **Num.js** - a powerful TypeScript numerical computing library that brings NumPy-like functionality to JavaScript/TypeScript environments.

## 🎯 What is Num.js?

Num.js is a high-performance numerical computing library designed for:
- **Scientific Computing**: Mathematical operations, linear algebra, statistics
- **Machine Learning**: Neural networks, data preprocessing, mathematical foundations
- **Data Analysis**: Statistical analysis, array manipulation, data transformations
- **TypeScript Integration**: Full type safety with precise numeric types

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install @naharashu/num.js

# Using yarn
yarn add @naharashu/num.js

# Using pnpm
pnpm add @naharashu/num.js
```

### Basic Usage

```typescript
import { NDArray, zeros, ones, arange, fromArray } from '@naharashu/num.js';

// Create arrays using factory functions
const arr1 = zeros([3, 3]);           // 3x3 matrix of zeros
const arr2 = ones([2, 4]);            // 2x4 matrix of ones
const arr3 = arange(0, 10, 2);        // [0, 2, 4, 6, 8]

// Array operations using factory functions
const a = fromArray([[1, 2], [3, 4]]);
const b = fromArray([[5, 6], [7, 8]]);

const sum = a.add(b);                 // Element-wise addition
const product = a.multiply(b);        // Element-wise multiplication

console.log(sum.toArray());          // [[6, 8], [10, 12]]
```

## 🏗️ Core Concepts

### NDArray - The Foundation

The `NDArray` class is the core data structure, similar to NumPy's ndarray:

```typescript
import { NDArray, fromArray } from '@naharashu/num.js';

// Create from JavaScript arrays using factory function
const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);

// Access properties
console.log(matrix.shape);    // [2, 3]
console.log(matrix.ndim);     // 2
console.log(matrix.size);     // 6
console.log(matrix.dtype);    // 'float64'

// Indexing and slicing
const element = matrix.get(0, 1);             // 2
const row = matrix.slice(0);                  // First row
const column = matrix.slice([0, 2], 1);       // Second column (all rows, column 1)
```

### Type Safety

Num.js provides full TypeScript support with precise numeric types:

```typescript
import { NDArray, NumericArray, NumericMatrix, zeros, ones } from '@naharashu/num.js';

// Typed arrays
const vector: NumericArray = [1, 2, 3, 4, 5];
const matrix: NumericMatrix = [[1, 2], [3, 4]];

// Generic NDArray with dtype using factory functions
const arr = zeros<'float32'>([3, 3], { dtype: 'float32' });  // Float32 array
const intArr = ones<'int32'>([2, 2], { dtype: 'int32' });    // Int32 array
```

## 📊 Common Use Cases

### Mathematical Operations

```typescript
import { sin, cos, exp, log, sqrt, arange } from '@naharashu/num.js';

const x = arange(0, Math.PI, 0.1);
const y = sin(x);                    // Element-wise sine
const negX = x.multiply(-1);
const z = exp(negX);                 // e^(-x)
```

### Linear Algebra

```typescript
import { inv, det, trace, norm, fromArray } from '@naharashu/num.js';

const A = fromArray([[1, 2], [3, 4]]);

// Available linear algebra operations
const inverse = inv(A);              // Matrix inverse
const determinant = det(A);          // Determinant
const traceValue = trace(A);         // Matrix trace
const normValue = norm(A);           // Matrix norm
```

### Statistics

```typescript
import { mean, std, variance, correlation } from '@naharashu/num.js';

// Statistics functions work with NumericArray, not NDArray
const data: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const average = mean(data);                    // 5.5
const stdDev = std(data);        // Standard deviation
const varianceValue = variance(data);          // Variance
const corr = correlation(data, data);          // Correlation
```

### Neural Networks

```typescript
import { relu, sigmoid, mse } from '@naharashu/num.js';

// Activation functions work with single numbers
const value1 = 0.5;
const value2 = -0.2;

// Apply activation functions to individual values
const activated1 = relu(value1);         // 0.5 (ReLU activation)
const activated2 = relu(value2);         // 0 (ReLU clips negative)
const sigmoidOutput = sigmoid(value1);   // ~0.622 (Sigmoid activation)

// Loss calculation with arrays
const predicted: number[] = [0.8, 0.6, 0.4, 0.2];
const actual: number[] = [1.0, 0.5, 0.3, 0.1];
const loss = mse(actual, predicted);     // Mean squared error
```

## 🎯 For Different Audiences

### New Developers
- Start with the [Basic Examples](./examples/basic-usage.md)
- Learn about [NDArray fundamentals](./api/ndarray.md)
- Practice with [Interactive tutorials](./examples/tutorials/)

### Experienced Developers
- Review the [API Reference](./api/)
- Check [Performance guidelines](./advanced/performance.md)
- Explore [Advanced features](./advanced/)

### Data Scientists
- See [NumPy migration guide](./migration/numpy.md)
- Review [Statistical functions](./api/statistics.md)
- Check [Machine learning examples](./examples/ml/)

### DevOps/Integration Teams
- Review [Installation requirements](./installation.md)
- Check [Performance benchmarks](./benchmarks/performance.md)
- See [Build and deployment](./deployment.md)

## 🔗 Next Steps

1. **[Explore Examples](./examples/)** - See practical use cases
2. **[API Reference](./api/)** - Detailed function documentation
3. **[Architecture Guide](./architecture.md)** - Understand the library design
4. **[Contributing](./contributing.md)** - Help improve the library

## 💡 Need Help?

- 📖 Check the [FAQ](./faq.md)
- 🐛 Report issues on [GitHub](https://github.com/naharashu/num.js/issues)


Thanks RedWilly for rewriting library in TypeScripy ❤️

---

*Ready to dive deeper? Continue with [Basic Examples](./examples/basic-usage.md) or jump to the [API Reference](./api/).*
