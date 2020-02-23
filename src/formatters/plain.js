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
  added: (name, value) => `Property '${name.join('.')}' was added with value: ${stringify(value.valueAfter)}`,
  deleted: (name) => `Property '${name.join('.')}' was deleted`,
  changed: (name, value) => `Property '${name.join('.')}' was changed from ${stringify(value.valueBefore)} to ${stringify(value.valueAfter)}`,
  unchanged: () => null,
  nested: (name, value, fn) => fn([], value, name),
};

export default (tree) => {
  const iter = (acc, node, names) => {
    const elem = node.reduce((innerAcc, item) => {
      const { name, state, value } = item;

      const newNames = [...names, name];
      const newItem = decorators[state](newNames, value, iter);

      return [...innerAcc, newItem];
    }, acc);

    return [_.compact(elem).join('\n')];
  };

  return iter([], tree, []).join('\n');
};
