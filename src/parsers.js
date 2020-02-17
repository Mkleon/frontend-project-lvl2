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

const getParser = (dataType) => {
  const parser = parsers.find(({ format }) => dataType === format);

  return parser;
};

export default (data, dataType) => getParser(dataType).parse(data);
