import fs from 'fs';
import gendiff from '../src';

const pathToFixtures = `${__dirname}/../__fixtures__`;

test('compare two JSON configs', () => {
  const firstConfig = `${pathToFixtures}/before.json`;
  const secondConfig = `${pathToFixtures}/after.json`;
  const emptyConfig = `${pathToFixtures}/empty.json`;

  const result1 = fs.readFileSync(`${pathToFixtures}/result1.txt`, 'utf8');
  const result2 = fs.readFileSync(`${pathToFixtures}/result2.txt`, 'utf8');

  expect(gendiff(firstConfig, secondConfig)).toEqual(result1);
  expect(gendiff(emptyConfig, emptyConfig)).toEqual('{\n}');
  expect(gendiff(firstConfig, firstConfig)).toEqual(result2);

  const result3 = fs.readFileSync(`${pathToFixtures}/result3.txt`, 'utf8');
  const result4 = fs.readFileSync(`${pathToFixtures}/result4.txt`, 'utf8');

  expect(gendiff(firstConfig, emptyConfig)).toEqual(result3);
  expect(gendiff(emptyConfig, firstConfig)).toEqual(result4);
});

test('compare two YML configs', () => {
  const firstConfigYML = `${pathToFixtures}/before.yml`;
  const secondConfigYML = `${pathToFixtures}/after.yml`;

  const resultYML1 = fs.readFileSync(`${pathToFixtures}/resultYML1.txt`, 'utf8');
  // const resultYML2 = fs.readFileSync(`${pathToFixtures}/resultYML2.txt`, 'utf8');

  expect(gendiff(firstConfigYML, secondConfigYML)).toEqual(resultYML1);
});
