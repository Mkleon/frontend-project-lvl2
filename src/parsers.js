import fs from 'fs';
import pathModule from 'path';

const parsers = [
  {
    name: '.json',
    parse: JSON.parse,
  },
  {
    name: '.yml',
    parse: JSON.parse,
  },
];

const getParser = (path) => {
  const parserName = pathModule.extname(path);
  const parser = parsers.find(({ name }) => parserName === name);

  return parser;
};

export default (path) => {
  const data = fs.readFileSync(path);

  return getParser(path).parse(data);
};
