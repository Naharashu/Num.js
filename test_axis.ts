import { sum, mean, min, max, standardDeviation } from './src/core/statistics.js';

// Test axis functionality
const matrix = [[1, 2, 3], [4, 5, 6]];

console.log('Matrix:', matrix);
console.log('Sum all:', sum(matrix));
console.log('Sum axis 0 (columns):', sum(matrix, { axis: 0 }));
console.log('Sum axis 1 (rows):', sum(matrix, { axis: 1 }));

console.log('Mean all:', mean(matrix));
console.log('Mean axis 0 (columns):', mean(matrix, { axis: 0 }));
console.log('Mean axis 1 (rows):', mean(matrix, { axis: 1 }));

console.log('Min all:', min(matrix));
console.log('Min axis 0 (columns):', min(matrix, { axis: 0 }));
console.log('Min axis 1 (rows):', min(matrix, { axis: 1 }));

console.log('Max all:', max(matrix));
console.log('Max axis 0 (columns):', max(matrix, { axis: 0 }));
console.log('Max axis 1 (rows):', max(matrix, { axis: 1 }));

console.log('Std all:', standardDeviation(matrix));
console.log('Std axis 0 (columns):', standardDeviation(matrix, { axis: 0 }));
console.log('Std axis 1 (rows):', standardDeviation(matrix, { axis: 1 }));