const fs = require('fs');
const path = require('path');

function decodeBaseValue(value, base) {
  return BigInt(parseInt(value, base));
}

function lagrangeInterpolation(roots, k) {
  let secret = BigInt(0);
  for (let i = 0; i < k; i++) {
    let xi = BigInt(roots[i].x);
    let yi = BigInt(roots[i].y);
    let num = BigInt(1);
    let den = BigInt(1);
    for (let j = 0; j < k; j++) {
      if (i !== j) {
        let xj = BigInt(roots[j].x);
        num *= xj;
        den *= (xj - xi);
      }
    }
    secret += (yi * num) / den; 
  }
  return Number(secret); 
}

function processTestCase(testCaseFile, outputFile, callback) {
  fs.readFile(testCaseFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      callback(err);
      return;
    }
    let json;
    try {
      json = JSON.parse(data);
    } catch (e) {
      console.error('Invalid JSON:', e);
      callback(e);
      return;
    }
    const roots = [];
    for (let i = 1; i <= json.keys.n; i++) {
      const key = i.toString();
      if (json[key]) {
        const base = parseInt(json[key].base);
        const value = json[key].value;
        const y = decodeBaseValue(value, base);
        const x = i;
        roots.push({ x, y });
      }
    }
    const secret = lagrangeInterpolation(roots, json.keys.k);
    fs.writeFile(outputFile, `The constant term (c) is: ${secret}\n`, (err) => {
      if (err) {
        console.error('Error writing the file:', err);
        callback(err);
        return;
      }
      console.log(`Result for ${testCaseFile} saved in ${outputFile}`);
      callback(null, secret);
    });
  });
}

const testCases = [
  { input: path.join(__dirname, 'input', 'test-case-1.json'), output: path.join(__dirname, 'output', 'result-1.txt') },
  { input: path.join(__dirname, 'input', 'test-case-2.json'), output: path.join(__dirname, 'output', 'result-2.txt') }
];

let results = [];
let completed = 0;
testCases.forEach(({ input, output }) => {
  processTestCase(input, output, (err, secret) => {
    if (err) return;
    results.push({ file: input, secret });
    if (++completed === testCases.length) {
      console.log('All test cases processed:');
      results.forEach(r => console.log(`${r.file}: c = ${r.secret}`));
    }
  });
});