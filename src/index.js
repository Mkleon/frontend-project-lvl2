import _ from 'lodash';
import getContent from './parsers';

const buildAST = (firstConfig, secondConfig) => {
  const allKeys = [...Object.keys(firstConfig), ...Object.keys(secondConfig)];
  const allUniqKeys = new Set(allKeys);

  const states = [
    {
      name: 'added',
      check: (key) => !_.has(firstConfig, key) && _.has(secondConfig, key),
    },
    {
      name: 'deleted',
      check: (key) => _.has(firstConfig, key) && !_.has(secondConfig, key),
    },
    {
      name: 'unchanged',
      check: (key) => firstConfig[key] === secondConfig[key],
    },
    {
      name: 'changed',
      check: (key) => firstConfig[key] !== secondConfig[key],
    },
  ];

  const ast = [];

  allUniqKeys.forEach((key) => {
    const elem = {};
    elem.name = key;

    const state = states.find(({ check }) => check(key));
    elem.state = state.name;
    elem.valueOld = firstConfig[key];
    elem.valueNew = secondConfig[key];

    elem.children = (firstConfig[key] instanceof Object && secondConfig[key] instanceof Object)
      ? buildAST(elem.valueOld, elem.valueNew)
      : [];

    ast.push(elem);
  });

  return ast;
};

const renderJSON = (ast) => {
  return console.log(ast);
};

const renders = {
  json: renderJSON,
};

const getRender = (format) => {
  return renders[format];
};

export default (firstConfigPath, secondConfigPath, command) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  const ast = buildAST(contentFirstConfig, contentSecondConfig);

  const render = getRender(command.format);

  return render(ast);
};
