import _ from 'lodash';

const stringify = (value) => {
  const types = [
    {
      convert: (elem) => (Number.isNaN(Number(elem)) ? `'${elem}'` : Number(elem)),
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
  added: (name, value) => `Property '${name}' was added with value: ${stringify(value.add)}`,
  deleted: (name) => `Property '${name}' was deleted`,
  changed: (name, value) => `Property '${name}' was changed from ${stringify(value.del)} to ${stringify(value.add)}`,
  unchanged: () => null,
};

export default (tree) => {
  const iter = (acc, node, names) => {
    const elem = node.reduce((innerAcc, item) => {
      const {
        name, state, value, hasChildren, children,
      } = item;

      const newNames = [...names, name];
      const newItem = hasChildren ? iter([], children, newNames) : decorators[state](newNames.join('.'), value);

      return [...innerAcc, newItem];
    }, acc);

    return _.compact(elem).join('\n');
  };

  const tr = [iter([], tree, [])];

  return tr.join('\n');
};
