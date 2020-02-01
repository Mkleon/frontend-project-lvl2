import _ from 'lodash';
import getContent from './parsers';
import formatter from './formatters/index';

const buildAST = (firstConfig, secondConfig) => {
  const uniqProps = _.union([...Object.keys(firstConfig), ...Object.keys(secondConfig)]);
  const sortedProps = uniqProps.slice().sort();

  const states = [
    {
      name: 'added',
      check: (prop) => !_.has(firstConfig, prop) && _.has(secondConfig, prop),
      getValue: (prop) => ({ add: secondConfig[prop] }),
    },
    {
      name: 'deleted',
      check: (prop) => _.has(firstConfig, prop) && !_.has(secondConfig, prop),
      getValue: (prop) => ({ del: firstConfig[prop] }),
    },
    {
      name: 'unchanged',
      check: (prop) => (firstConfig[prop] instanceof Object && secondConfig[prop] instanceof Object)
        || firstConfig[prop] === secondConfig[prop],
      getValue: (prop) => ({ unchange: firstConfig[prop] }),
    },
    {
      name: 'changed',
      check: (prop) => firstConfig[prop] !== secondConfig[prop],
      getValue: (prop) => ({ add: secondConfig[prop], del: firstConfig[prop] }),
    },
  ];

  const createElement = (name) => {
    const valueBefore = firstConfig[name];
    const valueAfter = secondConfig[name];
    const hasChildren = firstConfig[name] instanceof Object && secondConfig[name] instanceof Object;
    const state = states.find(({ check }) => check(name));

    return {
      name,
      state: state.name,
      value: state.getValue(name),
      hasChildren,
      children: hasChildren ? buildAST(valueBefore, valueAfter) : [],
    };
  };

  const ast = sortedProps.reduce((acc, prop) => [...acc, createElement(prop)], []);

  return ast;
};

const render = (tree, format) => formatter(format, tree);

export default (firstConfigPath, secondConfigPath, format) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  const ast = buildAST(contentFirstConfig, contentSecondConfig);

  return render(ast, format);
};
