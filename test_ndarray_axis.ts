import { NDArray } from './src/ndarray/ndarray.js';

// Test NDArray axis functionality
const arr = new NDArray([[1, 2, 3], [4, 5, 6]], [2, 3]);

console.log('NDArray shape:', arr.shape);
console.log('Sum all:', arr.sum());
console.log('Sum axis 0 (columns):', arr.sum(0));
console.log('Sum axis 1 (rows):', arr.sum(1));

console.log('Mean all:', arr.mean());
console.log('Mean axis 0 (columns):', arr.mean(0));
console.log('Mean axis 1 (rows):', arr.mean(1));

console.log('Min all:', arr.min());
console.log('Min axis 0 (columns):', arr.min(0));
console.log('Min axis 1 (rows):', arr.min(1));

console.log('Max all:', arr.max());
console.log('Max axis 0 (columns):', arr.max(0));
console.log('Max axis 1 (rows):', arr.max(1));

console.log('Std all:', arr.std());
console.log('Std axis 0 (columns):', arr.std(0));
console.log('Std axis 1 (rows):', arr.std(1));