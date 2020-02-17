import treeFormatter from './tree';
import plainFormatter from './plain';
import jsonFormatter from './json';

const getFormatter = (type) => {
  const formatters = {
    tree: treeFormatter,
    plain: plainFormatter,
    json: jsonFormatter,
  };

  return formatters[type];
};

export default (type, tree) => {
  const formatter = getFormatter(type);

  return formatter(tree);
};
