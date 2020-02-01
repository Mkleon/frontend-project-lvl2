import jsonFormatter from './json';
import plainFormatter from './plain';

const formatters = [
  {
    name: 'json',
    formate: jsonFormatter,
  },
  {
    name: 'plain',
    formate: plainFormatter,
  },
];

const getFormatter = (type) => formatters.find(({ name }) => name === type);

export default (type, tree) => {
  const formatter = getFormatter(type);

  return formatter.formate(tree);
};
