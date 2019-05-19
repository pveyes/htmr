const Benchmark = require('benchmark');
const fs = require('fs');
const path = require('path');
const convert = require('../lib/index.js');

const suite = new Benchmark.Suite();

const simple = '<h1>It works!</h1>';
const real = fs.readFileSync(path.resolve(__dirname, 'test.html'), { encoding: 'utf-8' });

suite
  .add('simple', () => {
    convert(simple);
  })
  .add('real', () => {
    convert(real);
  })
  .on('cycle', event => {
    process.stdout.write(String(event.target) + '\n');
  })
  .run({
    minSamples: 100,
    delay: 2
  });
