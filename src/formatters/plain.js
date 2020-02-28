import _ from 'lodash';

const stringify = (value) => {
  const types = [
    {
      convert: (elem) => `'${elem}'`,
      check: (elem) => typeof elem === 'string',
    },
    {
      convert: _.identity,
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
  nested: (name, value, fn) => fn(value, name),
};

export default (tree) => {
  const iter = (node, names) => {
    const filteredNode = node.filter(({ state }) => state !== 'unchanged');

    const newItem = filteredNode.map((item) => {
      const { name, state, value } = item;
      const newNames = [...names, name];

      return decorators[state](newNames, value, iter);
    });

    return [newItem.join('\n')];
  };

  return iter(tree, []).join('\n');
};
