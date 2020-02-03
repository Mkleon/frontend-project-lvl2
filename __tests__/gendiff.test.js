import fs from 'fs';
import gendiff from '../src';

const pathToFixtures = `${__dirname}/../__fixtures__`;
const exts = ['json', 'yml', 'ini'];

const resultTree = fs.readFileSync(`${pathToFixtures}/result.txt`, 'utf8');
const resultPlain = fs.readFileSync(`${pathToFixtures}/result plain.txt`, 'utf8');
const resultJSON = fs.readFileSync(`${pathToFixtures}/result json.json`, 'utf8');

describe.each(exts)('compare two configs', (ext) => {
  const firstConfig = `${pathToFixtures}/before.${ext}`;
  const secondConfig = `${pathToFixtures}/after.${ext}`;

  test(`compare ${ext} files`, () => {
    expect(gendiff(firstConfig, secondConfig, 'tree')).toEqual(resultTree);
    expect(gendiff(firstConfig, secondConfig, 'plain')).toEqual(resultPlain);
    expect(gendiff(firstConfig, secondConfig, 'json')).toEqual(resultJSON);
  });
});
