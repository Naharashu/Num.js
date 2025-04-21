import * as njs from '../src/core.js'

console.log(
  njs.fibonaci(12), // 144
)

console.log(
  njs.factorial(4) // 24
)

console.log(
  njs.sigmoid(5) // 0.9933071490945585
)

let x = [2, 5, 0, 1]

console.log(
  njs.softmax(x) //  [0.046320417980785254, 0.9303704656505482, 0.006268786887067859, 0.017040329481598906]
)

console.log(
  njs.isPrime(3) // true
  )
