import treeFormatter from './tree';
import plainFormatter from './plain';
import jsonFormatter from './json';

const formatters = [
  {
    name: 'tree',
    formate: treeFormatter,
  },
  {
    name: 'plain',
    formate: plainFormatter,
  },
  {
    name: 'json',
    formate: jsonFormatter,
  },
];

const getFormatter = (type) => formatters.find(({ name }) => name === type);

export default (type, tree) => {
  const formatter = getFormatter(type);

  return formatter.formate(tree);
};
