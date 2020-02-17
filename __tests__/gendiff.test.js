import fs from 'fs';
import gendiff from '../src';

const pathToFixtures = `${__dirname}/../__fixtures__`;
const exts = ['json', 'yml', 'ini'];

let resultTree;
let resultPlain;
let resultJSON;

beforeEach(() => {
  resultTree = fs.readFileSync(`${pathToFixtures}/result_tree.txt`, 'utf8');
  resultPlain = fs.readFileSync(`${pathToFixtures}/result_plain.txt`, 'utf8');
  resultJSON = fs.readFileSync(`${pathToFixtures}/result_json.txt`, 'utf8');
});

describe.each(exts)('compare two configs', (ext) => {
  const firstConfig = `${pathToFixtures}/before.${ext}`;
  const secondConfig = `${pathToFixtures}/after.${ext}`;

  test(`compare ${ext} files`, () => {
    expect(gendiff(firstConfig, secondConfig, 'tree')).toEqual(resultTree);
    expect(gendiff(firstConfig, secondConfig, 'plain')).toEqual(resultPlain);
    expect(gendiff(firstConfig, secondConfig, 'json')).toEqual(resultJSON);
  });
});
