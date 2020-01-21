import fs from 'fs';
import pathModule from 'path';
import jsYaml from 'js-yaml';

const parsers = [
  {
    format: '.json',
    parse: JSON.parse,
  },
  {
    format: '.yml',
    parse: jsYaml.safeLoad,
  },
];

const getParser = (ext) => {
  const parser = parsers.find(({ format }) => ext === format);

  return parser;
};

export default (path) => {
  const data = fs.readFileSync(path, 'utf8');
  const ext = pathModule.extname(path);

  return getParser(ext).parse(data);
};
