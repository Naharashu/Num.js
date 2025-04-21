import * as njs from '../src/core.js'
import { Matrix } from './num.js'

let a = Matrix.create(2,2,2)
let b = Matrix.create(2,2,2) 

console.log(
  Matrix.sub(a, b) // return new matrix with zeros
)

console.log(
  Matrix.add(a, b) // return new matrix with added a and b nums added
  )

console.log(
  Matrix.map(a, (a) => a * 2) // return matrix a multiplied by 2
  )
