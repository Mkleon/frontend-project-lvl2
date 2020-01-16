import fs from 'fs';
import gendiff from '../src';

const firstConfig = `${__dirname}/__fixtures__/before.json`;
const secondConfig = `${__dirname}/__fixtures__/after.json`;
const emptyConfig = `${__dirname}/__fixtures__/empty.json`;

test('compare two JSON configs', () => {
  const result1 = fs.readFileSync(`${__dirname}/__fixtures__/result1.txt`, 'utf8');
  const result2 = fs.readFileSync(`${__dirname}/__fixtures__/result2.txt`, 'utf8');

  expect(gendiff(firstConfig, secondConfig)).toEqual(result1);
  expect(gendiff(emptyConfig, emptyConfig)).toEqual('{\n}');
  expect(gendiff(firstConfig, firstConfig)).toEqual(result2);
});

test('compare with empty config', () => {
  const result3 = fs.readFileSync(`${__dirname}/__fixtures__/result3.txt`, 'utf8');
  const result4 = fs.readFileSync(`${__dirname}/__fixtures__/result4.txt`, 'utf8');

  expect(gendiff(firstConfig, emptyConfig)).toEqual(result3);
  expect(gendiff(emptyConfig, firstConfig)).toEqual(result4);
});
