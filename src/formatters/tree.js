import _ from 'lodash';

const indent = 2;

const countOfSpacies = (level) => (indent * level) + ((level - 1) * 2);

const createSpaces = (level) => ' '.repeat(countOfSpacies(level));

const createSpacesBeforeBracket = (level) => (
  level === 1 ? '' : (' '.repeat(countOfSpacies(level) - indent))
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
  added: ({ name, value }, level) => `${createSpaces(level)}+ ${name}: ${stringify(value.valueAfter, createSpaces(level))}`,
  deleted: ({ name, value }, level) => `${createSpaces(level)}- ${name}: ${stringify(value.valueBefore, createSpaces(level))}`,
  changed: ({ name, value }, level) => `${createSpaces(level)}+ ${name}: ${stringify(value.valueAfter, createSpaces(level))}\n${createSpaces(level)}- ${name}: ${stringify(value.valueBefore, createSpaces(level))}`,
  unchanged: ({ name, value }, level) => `${createSpaces(level)}  ${name}: ${stringify(value.valueBefore, createSpaces(level))}`,
  nested: ({ name, value }, level, fn) => `${createSpaces(level)}  ${name}: ${fn([], value, level + 1)}`,
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
