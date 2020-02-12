import jsYaml from 'js-yaml';
import ini from 'ini';

const parsers = [
  {
    format: '.json',
    parse: JSON.parse,
  },
  {
    format: '.yml',
    parse: jsYaml.safeLoad,
  },
  {
    format: '.ini',
    parse: ini.parse,
  },
];

const getParser = (ext) => {
  const parser = parsers.find(({ format }) => ext === format);

  return parser;
};

export default (data, ext) => getParser(ext).parse(data);
