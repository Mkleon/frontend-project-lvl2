import jsYaml from 'js-yaml';
import ini from 'ini';

const parsers = {
  json: JSON.parse,
  yml: jsYaml.safeLoad,
  ini: ini.parse,
};

export default (data, type) => parsers[type](data);
