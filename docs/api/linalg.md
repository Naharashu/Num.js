# Linear Algebra API Reference

The linear algebra module provides comprehensive matrix operations, decompositions, and solvers for numerical computing applications.

## Matrix Operations

### Basic Operations

**Note**: Matrix multiplication (`dot`) and transpose functions are not currently available in the linear algebra module. Available operations are listed below.

#### `trace(matrix: NDArray): number`
Sum of diagonal elements.

```typescript
import { trace, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
const tr = trace(matrix); // 15 (1 + 5 + 9)
```

### Matrix Properties

#### `det(matrix: NDArray): number`
Calculate the determinant of a square matrix.

```typescript
import { det, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 2], [3, 4]]);
const determinant = det(matrix); // -2

// For larger matrices
const matrix3x3 = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 10]]);
const det3x3 = det(matrix3x3); // -3
```

#### `rank(matrix: NDArray): number`
Calculate the rank of a matrix.

```typescript
import { rank, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
const matrixRank = rank(matrix); // 2 (rank-deficient)

const fullRank = fromArray([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
const identityRank = rank(fullRank); // 3 (full rank)
```

#### `cond(matrix: NDArray): number`
Calculate the condition number of a matrix.

```typescript
import { cond, fromArray } from '@naharashu/num.js';

const wellConditioned = fromArray([[1, 0], [0, 1]]);
const condNumber1 = cond(wellConditioned); // ~1 (well-conditioned)

const illConditioned = fromArray([[1, 1], [1, 1.0001]]);
const condNumber2 = cond(illConditioned); // Large number (ill-conditioned)
```

## Matrix Decompositions

### LU Decomposition

#### `luDecomposition(matrix: NDArray): { L: NDArray; U: NDArray; P: number[] }`
LU decomposition with partial pivoting.

```typescript
import { luDecomposition, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[2, 1, 1], [4, 3, 3], [8, 7, 9]]);
const { L, U, P } = luDecomposition(matrix);

// L is lower triangular, U is upper triangular
// P is the permutation vector
console.log('L:', L.toArray());
console.log('U:', U.toArray());
console.log('Permutation:', P);
```

### QR Decomposition

#### `QRDecomposition(matrix: NDArray): { Q: NDArray; R: NDArray }`
QR decomposition using Gram-Schmidt process.

```typescript
import { QRDecomposition, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 1, 0], [1, 0, 1], [0, 1, 1]]);
const { Q, R } = QRDecomposition(matrix);

// Q is orthogonal, R is upper triangular
// A = Q * R
const reconstructed = Q.dot(R); 
```

### Eigenvalue Decomposition

#### `EigenDecomposition(matrix: NDArray): { eigenvalues: NDArray; eigenvectors: NDArray }`
Compute eigenvalues and eigenvectors.

```typescript
import { EigenDecomposition, fromArray } from '@naharashu/num.js';

const symmetric = fromArray([[4, -2], [-2, 1]]);
const { eigenvalues, eigenvectors } = eigenDecomposition(symmetric);

console.log('Eigenvalues:', eigenvalues.toArray());
console.log('Eigenvectors:', eigenvectors.toArray());
```

### Singular Value Decomposition

#### `svd(matrix: NDArray): { U: NDArray; S: NDArray; Vt: NDArray }`
Singular Value Decomposition.

```typescript
import { svd, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 2, 3], [4, 5, 6]]);
const { U, S, Vt } = svd(matrix);

// A = U * diag(S) * Vt
// U: left singular vectors
// S: singular values
// Vt: right singular vectors (transposed)
```

## Matrix Inverse and Solving

### Matrix Inverse

#### `inv(matrix: NDArray): NDArray`
Calculate the inverse of a square matrix.

```typescript
import { inv, fromArray } from '@naharashu/num.js';

const matrix = fromArray([[1, 2], [3, 4]]);
const inverse = inv(matrix);

// Verify: A * A^(-1) = I
const identity = matrix.dot(inverse);
console.log(identity.toArray()); // [[1, 0], [0, 1]] (approximately)
```


### Linear System Solving

#### `solve(A: NDArray, b: NDArray): NDArray`
Solve the linear system Ax = b.

```typescript
import { solve, fromArray } from '@naharashu/num.js';

// Solve: 2x + y = 5, x + 3y = 7
const A = fromArray([[2, 1], [1, 3]]);
const b = fromArray([5, 7]);
const x = solve(A, b); // [1, 2]

// Verify solution
const verification = A.dot(x); // Should equal b
```


## Norms and Distances

### Vector Norms

#### `norm(vector: NDArray, ord?: number | 'fro'): number`
Calculate vector or matrix norm.

```typescript
import { norm, fromArray } from '@naharashu/num.js';

const vector = fromArray([3, 4]);

// L2 norm (Euclidean)
const l2 = norm(vector);        // 5
const l2Explicit = norm(vector, 2); // 5

// L1 norm (Manhattan)
const l1 = norm(vector, 1);     // 7

// Infinity norm
const linf = norm(vector, Infinity); // 4

// For matrices
const matrix = fromArray([[1, 2], [3, 4]]);
const frobenius = norm(matrix, 'fro'); // Frobenius norm
```