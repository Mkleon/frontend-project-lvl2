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

const getParser = (type) => {
  const parser = parsers.find(({ format }) => type === format);

  return parser;
};

export default (data, type) => getParser(type).parse(data);
