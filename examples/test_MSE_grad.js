// Test file for MSE_grad function
import { MSE_grad, MSE } from '../src/neiro.js';

console.log('=== Testing MSE_grad function ===\n');

// Test 1: Basic functionality test
console.log('Test 1: Basic functionality');
const y1 = [1, 2, 3, 4];
const y_pred1 = [1.1, 2.2, 2.8, 4.1];

const grad1 = MSE_grad(y1, y_pred1);
console.log(`y_true: [${y1.join(', ')}]`);
console.log(`y_pred: [${y_pred1.join(', ')}]`);
console.log(`MSE_grad result: ${grad1}`);
console.log(`Expected: positive value (since predictions > actual on average)`);
console.log('');

// Test 2: Perfect predictions (gradient should be 0)
console.log('Test 2: Perfect predictions (gradient = 0)');
const y2 = [1, 2, 3, 4];
const y_pred2 = [1, 2, 3, 4];

const grad2 = MSE_grad(y2, y_pred2);
console.log(`y_true: [${y2.join(', ')}]`);
console.log(`y_pred: [${y_pred2.join(', ')}]`);
console.log(`MSE_grad result: ${grad2}`);
console.log(`Expected: 0 (perfect predictions)`);
console.log('');

// Test 3: Underestimation (negative gradient)
console.log('Test 3: Underestimation (negative gradient)');
const y3 = [5, 6, 7, 8];
const y_pred3 = [4, 5, 6, 7];

const grad3 = MSE_grad(y3, y_pred3);
console.log(`y_true: [${y3.join(', ')}]`);
console.log(`y_pred: [${y_pred3.join(', ')}]`);
console.log(`MSE_grad result: ${grad3}`);
console.log(`Expected: negative value (predictions < actual)`);
console.log('');

// Test 4: Manual verification of gradient calculation
console.log('Test 4: Manual verification');
const y4 = [2, 4];
const y_pred4 = [1, 5];

const grad4 = MSE_grad(y4, y_pred4);
const mse4 = MSE(y4, y_pred4);

// Manual calculation: 
// MSE = ((2-1)^2 + (4-5)^2) / 2 = (1 + 1) / 2 = 1
// MSE_grad = (2/n) * sum(y_pred - y_true) = (2/2) * ((1-2) + (5-4)) = 1 * (-1 + 1) = 0

console.log(`y_true: [${y4.join(', ')}]`);
console.log(`y_pred: [${y_pred4.join(', ')}]`);
console.log(`MSE: ${mse4}`);
console.log(`MSE_grad result: ${grad4}`);
console.log(`Manual calculation: (2/2) * ((1-2) + (5-4)) = 1 * (-1 + 1) = 0`);
console.log('');

// Test 5: Single value test
console.log('Test 5: Single value test');
const y5 = [3];
const y_pred5 = [5];

const grad5 = MSE_grad(y5, y_pred5);
console.log(`y_true: [${y5.join(', ')}]`);
console.log(`y_pred: [${y_pred5.join(', ')}]`);
console.log(`MSE_grad result: ${grad5}`);
console.log(`Manual calculation: (2/1) * (5-3) = 2 * 2 = 4`);
console.log('');

// Test 6: Larger dataset
console.log('Test 6: Larger dataset');
const y6 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const y_pred6 = [1.2, 2.1, 3.3, 3.8, 5.2, 5.9, 7.1, 8.2, 8.8, 10.1];

const grad6 = MSE_grad(y6, y_pred6);
const mse6 = MSE(y6, y_pred6);
console.log(`Dataset size: ${y6.length}`);
console.log(`MSE: ${mse6.toFixed(4)}`);
console.log(`MSE_grad result: ${grad6.toFixed(4)}`);
console.log('');

console.log('=== All tests completed ===');