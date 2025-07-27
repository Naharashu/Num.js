// * Experimental

import * as njs from './core.js'

export function sgd(weight, grad, learningRate) {
  return weight - learningRate * grad
}

export function adam(beta1, beta2, m, grad, η, epsilon, t, w, v) {
  m = beta1 * m + (1 - beta1) * grad
  v = beta2 * v + (1 - beta2) * grad**2

  let mHat = m / (1 - beta1**t)
  let vHat = v / (1 - beta2**t)

  w = w - η * mHat / (Math.sqrt(vHat) + epsilon)

  return {w, m, v}
}

export function randomWeights(size) {
  return Array.from({ length: size }, () => Math.random() - 0.5)
}

export function sigmoid_Derective(x) {
  let one = njs.sigmoid(x)
  return one * (1 - one)
}

export function silu(x) {
  return x * njs.sigmoid(x)
}

export function elu(x, a=1.0) {
  if (x > 0) {
    return x
  }
  else {
    return a * ((njs.e**x)-1)
  }
}

export function gelu(x) {
  return 0.5 * x * (1 + erf(x / Math.sqrt(2)))
}

export function hardSwish(x) {
  return x * Math.max(0, Math.min(1, (x + 3) / 6))
}

export function KLD(p, q) {
  let res = 0
  for(let i = 0; i < p.length; i++) {
    res += p[i] * Math.log(p[i] / q[i])
  }
  return res
}

export function focalLoss(y, ŷ, gamma = 2) {
  let loss = 0
  for (let i = 0; i < y.length; i++) {
    let pt = y[i] * ŷ[i] + (1 - y[i]) * (1 - ŷ[i])
    loss += -Math.pow(1 - pt, gamma) * Math.log(pt)
  }
  return loss / y.length
}

export function rmsprop(w, grad, cache, decayRate, lr, epsilon = 1e-8) {
  cache = decayRate * cache + (1 - decayRate) * grad ** 2
  w = w - lr * grad / (Math.sqrt(cache) + epsilon)
  return { w, cache }
}


export function mish(x) {
  return njs.tanh(njs.softplus(x))
}

export function squareplus(x, b) {
  return (x + Math.sqrt((x**2)+b)) / 2
}

export function leakyReLU(x, alpha = 0.01) {
  return x > 0 ? x : alpha * x
}

export function leakyReLU_Derivative(x, alpha = 0.01) {
  return x > 0 ? 1 : alpha
}

export function relu_Derective(x) {
  return x > 0 ? 1 : 0
}

export function forecast(w, x, b) {
  let y = njs.sigmoid(w * x + b)
  return y
}

export function MSE(y, ŷ) {
  if (!Array.isArray(y) || !Array.isArray(ŷ)) {
    console.log('y and ŷ must be arrays')
  }
  
  if (y.length !== ŷ.length) {
    console.log('y and ŷ must be same length ')
  }
  
  let n = y.length
  let a = 0
  for (let i = 0; i < y.length; i++){
    a += (y[i] - ŷ[i])**2
  }
  return a / n
}

export function MSE_grad(y,ŷ) {
  if (!Array.isArray(y) || !Array.isArray(ŷ)) {
    console.log('y and ŷ must be arrays')
  }
  if (y.length !== ŷ.length) {
    console.log('y and ŷ must be same length ')
  }
  let n = y.length
  let a = 0
  for (let i = 0; i < y.length; i++){
    a += (ŷ[i] - y[i])
  }
  return (2 / n) * a
}

export function BCE(y, ŷ) {
  if (!Array.isArray(y) || !Array.isArray(ŷ)) {
    console.log('y and ŷ must be arrays')
    return
  }
  if (y.length !== ŷ.length) {
    console.log('y and ŷ must be same length ')
  }
  let n = y.length
  let a = 0
  for (let i = 0; i < y.length; i++) {
    a += - (y[i] * Math.log(ŷ[i]) + (1 - y[i]) * Math.log(1 - ŷ[i]))
  }
  return a / n
}

export function BCE_grad(y, ŷ) {
  let grads = []
  for (let i = 0; i < y.length; i++) {
    grads.push(-(y[i] / ŷ[i]) + ((1 - y[i]) / (1 - ŷ[i])))
  }
  return grads
}

export function MAE(y, x) {
  if (!Array.isArray(y) || !Array.isArray(x)) {
    console.log('y and ŷ must be arrays')
  }
  
  if (y.length !== x.length) {
    console.log('y and x must be same length ')
  }
  
  let n = y.length
  let a = 0
  for (let i = 0; i < y.length; i++) {
    a += Math.abs(y[i] - x[i])
  }
  return a / n
}


export function normalize(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return data.map(value => (value - min) / (max - min));
}


export function L1(w, lambda) {
  let res = 0
  for(let i = 0; i < w.length; i++) {
    res += Math.abs((w[i]))
  }
  return lambda * res
}

export function L2(w, lambda) {
  let res = 0
  for(let i = 0; i < w.length; i++) {
    res += w[i] ** 2
  }
  return lambda * res
}

export function L3(w, lambda) {
  let res = 0
  for (let i = 0; i < w.length; i++) {
    res += Math.abs(w[i]) ** 3
  }
  return lambda * res
}

export function ElasticNet(w, lambda) {
  return L1(w, lambda) + L2(w, lambda)
}

export function CCE(y, p) {
  if (!Array.isArray(y) || !Array.isArray(p)) {
    console.log('y and p must be arrays')
  }
  
  if (y.length !== p.length) {
    console.log('y and ŷ must be same length ')
  }
  
  let n = y.length
  let a = 0
  for (let i = 0; i < y.length; i++){
    a += -(y[i] * Math.log(p[i]))
  }
  return a
}


export function HuberLoss(a, b, delta = 1.0) {
  let error = a - b
  if (Math.abs(error) <= delta) {
    return 0.5 * error ** 2
  } else {
    return delta * (Math.abs(error) - 0.5 * delta)
  }
}
export function erf(x) {
  
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911

  let sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  let t = 1.0 / (1.0 + p * x)
  let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}


export function swish(x, b=1.0) {
  return x / (1 + (njs.e ** -(b * x)))
}


export function dropout(layer, rate = 0.5) {
  return layer.map(x => (Math.random() < rate ? 0 : x / (1 - rate)))
}

export function softDropout(layer, rate = 0.5, scale = 0.2) {
  return layer.map(x => (Math.random() < rate ? x * scale : x))
}

export function lineDropout(layer, rate= 0.5) {
  return layer.map(x => (Math.random() < rate ? njs.relu(x) : x))
}

export function crazyDropout(layer, rate = 0.5) {
  return layer.map(x => (Math.random() < rate ? njs.sigmoid(x) ** elu(x): x))
}
