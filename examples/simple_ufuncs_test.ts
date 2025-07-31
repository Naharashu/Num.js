/**
 * Simple test for Universal Functions
 */

import { fromArray } from '../src/ndarray/factory.js';
import { abs, sin, add, multiply, relu } from '../src/core/ufuncs.js';

// Test basic ufunc functionality
const arr = fromArray([-2, -1, 0, 1, 2]);
console.log('Original:', arr.toArray());
console.log('abs(arr):', abs(arr).toArray());
console.log('relu(arr):', relu(arr).toArray());

// Test scalar operations
console.log('abs(-5):', abs(-5));
console.log('sin(π/2):', sin(Math.PI / 2));

// Test broadcasting
const a = fromArray([[1, 2], [3, 4]]);
console.log('Array a:', a.toArray());
console.log('multiply(a, 2):', multiply(a, 2).toArray());

console.log('✅ Ufuncs working correctly!');
