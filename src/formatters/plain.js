import _ from 'lodash';

const stringify = (value) => {
  const types = [
    {
      convert: (elem) => `'${elem}'`,
      check: (elem) => typeof elem === 'string',
    },
    {
      convert: (elem) => _.identity(elem),
      check: (elem) => typeof elem === 'boolean' || typeof elem === 'number',
    },
    {
      convert: () => '[complex value]',
      check: (elem) => elem instanceof Object,
    },
  ];

  const type = types.find(({ check }) => check(value));

  return type.convert(value);
};

const decorators = {
  added: (name, valueBefore, valueAfter) => `Property '${name}' was added with value: ${stringify(valueAfter)}`,
  deleted: (name) => `Property '${name}' was deleted`,
  changed: (name, valueBefore, valueAfter) => `Property '${name}' was changed from ${stringify(valueBefore)} to ${stringify(valueAfter)}`,
  unchanged: () => null,
};

export default (tree) => {
  const iter = (acc, node, names) => {
    const elem = node.reduce((innerAcc, item) => {
      const {
        name, state, valueBefore, valueAfter, hasChildren, children,
      } = item;

      const newNames = [...names, name];
      const newItem = hasChildren ? iter([], children, newNames) : decorators[state](newNames.join('.'), valueBefore, valueAfter);

      return [...innerAcc, newItem];
    }, acc);

    return [_.compact(elem).join('\n')];
  };

  return iter([], tree, []).join('\n');
};
