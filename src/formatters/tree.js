import _ from 'lodash';

const indent = 2;

const createSpaces = (level) => ' '.repeat((indent * level) + ((level - 1) * 2));

const createSpacesBeforeBracket = (level) => (
  level === 1 ? '' : (' '.repeat((indent * level) + ((level - 1) * 2) - indent))
);

const stringify = (value, spaces) => {
  const formats = [
    {
      check: (obj) => obj instanceof Object,
      format: (obj) => {
        const arr = Object.keys(obj).reduce((acc, item) => [...acc, `${spaces}      ${item}: ${obj[item]}`], []);
        return ['{', arr, `${spaces}  }`].join('\n');
      },
    },
    {
      check: (obj) => !(obj instanceof Object),
      format: (obj) => _.identity(obj),
    },
  ];

  return formats.find(({ check }) => check(value)).format(value);
};

const decorators = {
  added: (item, level) => `${createSpaces(level)}+ ${item.name}: ${stringify(item.valueAfter, createSpaces(level))}`,
  deleted: (item, level) => `${createSpaces(level)}- ${item.name}: ${stringify(item.valueBefore, createSpaces(level))}`,
  changed: (item, level) => `${createSpaces(level)}+ ${item.name}: ${stringify(item.valueAfter, createSpaces(level))}\n${createSpaces(level)}- ${item.name}: ${stringify(item.valueBefore, createSpaces(level))}`,
  unchanged: (item, level, fn) => (
    item.hasChildren
      ? `${createSpaces(level)}  ${item.name}: ${fn([], item.children, level + 1)}`
      : `${createSpaces(level)}  ${item.name}: ${stringify(item.valueBefore, createSpaces(level))}`
  ),
};

export default (tree) => {
  const iter = (acc, node, level = 1) => {
    const elem = node.reduce((innerAcc, item) => {
      const { state } = item;

      const newItem = decorators[state](item, level, iter);

      return [...innerAcc, newItem];
    }, acc);

    return ['{', ...elem, `${createSpacesBeforeBracket(level)}}`].join('\n');
  };

  return [iter([], tree)].join('\n');
};
