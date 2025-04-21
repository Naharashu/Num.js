export const e = 2.71828183
export const y = 0.57721566490153286060651209008240243104215933593992
export const pi = 3.14159265 

export function range(start, end, step = 1){
  let res = []
  for (let i = start; i < end; i += step) {
    res.push(i)
  }
  return res
}


export function randint(min, max) {
  let num = Math.random() * (max - min) + min
  return num
}



export function random() {
  let b = randint(29992, 93832928289292)
  let c = randint(0.00000001, 0.111111111111)
  b = Number(b.toFixed(0))
  let seed = Math.random()
  seed = seed + Math.random()
  
  seed ^= seed - 1
  
  
  
  seed = seed.toFixed(15) * (Math.random() + Math.random()) % b
  
  if (seed === 1.0000000000000) {
    seed = seed - 0.00001
  }
  if (seed > 1) {
    seed = seed - 1
  }
  
  seed = seed + c
  
  return (seed + randint(0.00000001, 0.01)) % randint(2, 64)
}


  
export function sigmoid(x) {
  return (e**x) / (e**x + 1)
}

export function factorial(n) {
  let res = n
  if (n === 0 || n === 1) {
    return 1
  }
  while(n > 1) {
    n--
    res *= n
  }
  return res
}

export function factorize(n) {
  const factors = []

  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      factors.push(d)
      n = n / d
    }
  }

  if (n > 1) {
    factors.push(n) 
  }

  return factors
}

export function fibonaci(n) {
  if (n <= 1) return n
  return fibonaci(n - 1) + fibonaci(n - 2)
}

export function lambert(y) {
  let res = y*(e**y)
  return res
}

export function sinh(n) {
  let res = ((e**n) - (e**-n)) / 2
  return res 
}

export function cosh(n) {
  let res = ((e**n) + (e**-n)) / 2
  return res
}

export function tanh(n) {
  let res = sinh(n) / cosh(n)
  return res
}

export function cth(n) {
  let res = 1 / tanh(n)
  return res
}

export function sech(n) {
  let res = 1 / cosh(n)
  return res
}

export function csch(n) {
  let res = 1 / sinh(n)
  return res
}

export function logWithBase(x, base) {
  return Math.log(x) / Math.log(base)
}

export function isPrime(n) {
  if (n < 2) return false
  if (n === 2 || n === 3) return true
  if (n % 2 === 0 || n % 3 & n !== 3 ) return false
  
  for(let i = 5; i * i <= n; i+=6) {
    if (n % i == 0 || n % (i + 2) == 0) return false
  }
  
  return true
}

export function combinations(n, k) {
  return factorial(n) / (factorial(k) * factorial(n-k))
}


export function gamma(x) {
  let res = 0
  let n = 1000000
  let upper = 50
  let step = upper / n
  for(let i of range(1, n+1)) {
    let t = i * step
    res += (t ** (x-1)) * Math.exp(-t) * step
  }
  return res
}

export function beta(x, y) {
  let res = (gamma(x) * gamma(y)) / gamma(x + y)
  return res
}

export function gauss(x, a, b) {
  let res = (1 / (b * Math.sqrt(2 * pi))) * e ** (-((x - a) ** 2) / (2 * b ** 2));
  return res;
}

export function broadcast(arr, n) {
  let res = arr
  for(let i = 0; i < arr.length; i++) {
    res[i] += n
  }
  return res
}

export function relu(x) {
  return Math.max(0, x)
}

export function softmax(arr) {
  const max = Math.max(...arr)
  const exps = arr.map(x => Math.exp(x - max))
  const sum = exps.reduce((a, b) => a + b,0)
  return exps.map(e => e / sum)
}








export function carcas(k, n) {
  return factorial((k * 2**2) / Math.sqrt(n))
}

carcas.revarn = function() {
  return carcas(carcas(2, 3), carcas(4,5))
}

carcas.void = function(n) {
  return carcas(1,1) ** n
}

carcas.voidless = function() {
  return carcas(0,1)
}

export function multyCarcas(k, n) {
  return factorial((k * n**2) / Math.sqrt(n))
}

multyCarcas.revarn = function() {
  return carcas(multyCarcas(1, 3), multyCarcas(2,4))
}


// Statistic 

export function mean(arr) {
  let res = 0
  let count = 0
  for(let i = 0; i < arr.length; i++) {
    count = count + arr[i]
  }
  res = count / arr.length
  return res
}

export function mode(arr) {
  let counts = {}
  for (let el of arr) {
    counts[el] = (counts[el] || 0) + 1
  }

  let max = 0
  let mode = []

  for (let key in counts) {
    if (counts[key] > max) {
      max = counts[key]
      mode = [Number(key)]
    } else if (counts[key] === max) {
      mode.push(Number(key))
    }
  }

  return mode.length === 1 ? mode[0] : mode
}

export function median(arr) {
  let sorted = [...arr].sort((a, b) => a - b)
  let len = sorted.length
  if (len % 2 === 0) {
    return (sorted[len / 2 - 1] + sorted[len / 2]) / 2
  } else {
    return sorted[Math.floor(len / 2)]
  }
}

// Matrix


export class Matrix {
  constructor() {
    
  }
  
  static create(x, y, fill = 0) {
    return Array.from({ length: x }, () =>
      Array.from({ length: y }, () => fill)
    );
  }
  static equals(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length) return false
    
    for(let i = 0; i < a.length; i++) {
      for(let j = 0; j < a[0].length; j++) {
        if(a[i][j] !== b[i][j]) return false
      }
    }
    return true
  }
  
  static add(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrix not equals in size to add them")
    }
    let res = Matrix.create(a.length, a[0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] + b[i][j]
          }
        }
      return res
  }
  
  static sub(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrix not equals in size to sub them")
    }
    let res = Matrix.create(a.length, a[0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] - b[i][j]
          }
        }
      return res
  }
  
  static mulBy(a, b) {
    let res = Matrix.create(a.length, a[0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] * b
          }
        }
      return res
  }
  static mul(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrix not equals in size to mul them")
    }
    let res = Matrix.create(a.length, a[0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] * b[i][j]
          }
        }
      return res
  }
  
  static dot(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrix not equals in size to dot them")
    }
    let res = Matrix.create(a.length, a[0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] / b[i][j]
          }
        }
      return res
  }
  
  
  static map(x, cb) {
    if(x.length == 0 || x[0].length == 0) {
        throw new Error("{x} is not a matrix")
    }
    let res = []
    for (let i = 0; i < x.length; i++) {
      res[i] = []
      for (let j = 0; j < x[0].length; j++) {
        res[i][j] = cb(x[i][j], i, j)
      }
    }

    return res
  }
}



// 3D ARRAYS

export class Array3d {
  constructor() {
    
  }
  
  static create(x, y, z, fill = 0) {
    return Array.from({ length: x }, () =>
      Array.from({ length: y }, () => Array.from({length: z}, () => fill)
    ))
  }
  
  static equals(a, b) {
    if(a.length !== b.length || a[0].length !== b[0].length || a[0][0].length !== b[0][0].length) return false
    
    for(let i = 0; i < a.length; i++) {
      for(let j = 0; j < a[0].length; j++) {
        for(let t; t < a[0][0].length; t++) {
          if(a[i][j] !== b[i][j]) return false
      }
      }
    }
    return true
  }
  
  static mulBy(a, b) {
    let res = Array3d.create(a.length, a[0].length, a[0][0].length)
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a[0].length; j++) {
            for(let t = 0; t < a[0][0].length; t++) {
            res[i][j][t] = a[i][j][t] * b
            }
          }
        }
      return res
  }
}


// Int128

export class Int128 {
  constructor(hi = 0n, lo = 0n) {
    this.hi = BigInt(hi);
    this.lo = BigInt(lo);
  }

  static fromInt128(num) {
    const mask = (1n << 64n) - 1n;
    let lo = num & mask;
    let hi = num >> 64n;
    if (num < 0) {
      hi = hi - 1n;
      lo = (1n << 64n) + lo;
    }

    return new Int128(hi, lo);
  }

  toInt128() {
    return (this.hi << 64n) + this.lo;
  }
  
  hex() {
    return '0x' + this.toInt128().toString(16)
  }
      
}
