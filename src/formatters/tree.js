import _ from 'lodash';

const indent = 2;

const countOfSpaces = (level) => (indent * level) + ((level - 1) * 2);

const createSpaces = (level) => ' '.repeat(countOfSpaces(level));

const createSpacesBeforeBracket = (level) => (
  level === 1 ? '' : (' '.repeat(countOfSpaces(level) - indent))
);

const stringify = (value, spaces) => {
  const formats = [
    {
      check: (obj) => _.isObject(obj),
      format: (obj) => {
        const arr = Object.keys(obj).reduce((acc, item) => [...acc, `${spaces}      ${item}: ${obj[item]}`], []);
        return ['{', arr, `${spaces}  }`].join('\n');
      },
    },
    {
      check: (obj) => !_.isObject(obj),
      format: _.identity,
    },
  ];

  return formats.find(({ check }) => check(value)).format(value);
};

const commonDecorator = (sign, name, value, level) => `${createSpaces(level)}${sign} ${name}: ${stringify(value, createSpaces(level))}`;

const decorators = {
  added: ({ name, value }, level) => commonDecorator('+', name, value.valueAfter, level),
  deleted: ({ name, value }, level) => commonDecorator('-', name, value.valueBefore, level),
  changed: ({ name, value }, level) => [commonDecorator('+', name, value.valueAfter, level), commonDecorator('-', name, value.valueBefore, level)],
  unchanged: ({ name, value }, level) => commonDecorator(' ', name, value.valueBefore, level),
  nested: ({ name, children }, level, fn) => `${createSpaces(level)}  ${name}: ${fn(children, level + 1)}`,
};

export default (tree) => {
  const iter = (node, level = 1) => {
    const newItem = node.map((item) => decorators[item.state](item, level, iter)).flat();

    return ['{', ...newItem, `${createSpacesBeforeBracket(level)}}`].flat().join('\n');
  };

  return iter(tree);
};
