# API Reference

Complete API documentation for all Num.js modules and functions.

## 📚 Module Documentation

### Core Modules
- **[NDArray](./ndarray.md)** - N-dimensional array operations and methods
- **[Factory Functions](./factory.md)** - Array creation utilities (zeros, ones, arange, etc.)
- **[Universal Functions](./ufuncs.md)** - Element-wise mathematical operations
- **[Statistics](./statistics.md)** - Statistical analysis functions
- **[Linear Algebra](./linalg.md)** - Matrix operations and decompositions
- **[Neural Networks](./neural.md)** - Neural network components and utilities

### Type Definitions
- **[Common Types](./types.md)** - Shared type definitions and interfaces
- **[Error Types](./errors.md)** - Custom error classes and handling

## 🔍 Quick Reference

### Array Creation
```typescript
import { zeros, ones, arange, eye, fromArray } from '@naharashu/num.js';

zeros([3, 3])                    // 3x3 matrix of zeros
ones([2, 4])                     // 2x4 matrix of ones
arange(0, 10, 2)                 // [0, 2, 4, 6, 8]
eye(3)                           // 3x3 identity matrix
fromArray([[1, 2], [3, 4]])      // NDArray from JavaScript array
```

### Mathematical Operations
```typescript
import { sin, cos, exp, log, add, multiply } from '@naharashu/num.js';

sin(x)                           // Element-wise sine
cos(x)                           // Element-wise cosine
exp(x)                           // Element-wise exponential
add(a, b)                        // Element-wise addition
multiply(a, b)                   // Element-wise multiplication
```

### Linear Algebra


### Statistics
```typescript
import { mean, std, variance, correlation } from '@naharashu/num.js';

mean(data)                       // Arithmetic mean
std(data)                        // Standard deviation
variance(data)                   // Variance
correlation(x, y)                // Correlation coefficient
```

## 📖 Documentation Conventions

### Function Signatures
```typescript
function functionName<T>(
  parameter: ParameterType,
  options?: OptionsType
): ReturnType
```

### Parameter Documentation
- **Required parameters** are listed first
- **Optional parameters** are marked with `?`
- **Generic types** are documented with constraints
- **Default values** are specified in descriptions

### Return Types
- All functions specify precise return types
- Generic return types maintain input type relationships
- Error conditions are documented with thrown error types

### Examples
Each function includes:
- Basic usage examples
- Advanced use cases
- Common patterns and best practices
- Error handling examples

## 🎯 Navigation Tips

### By Category
- **Array Operations**: NDArray methods and factory functions
- **Mathematical Functions**: Universal functions and mathematical operations
- **Data Analysis**: Statistics and data manipulation
- **Linear Algebra**: Matrix operations and decompositions
- **Machine Learning**: Neural network components

### By Use Case
- **Getting Started**: Basic array creation and manipulation
- **Data Processing**: Statistical analysis and transformations
- **Scientific Computing**: Advanced mathematical operations
- **Machine Learning**: Neural network development
- **Performance**: Optimized operations and memory management

---

*Choose a module above to explore detailed API documentation, or see [Examples](../examples/) for practical usage patterns.*
