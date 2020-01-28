import _ from 'lodash';
import getContent from './parsers';

const compare = (firstConfig, secondConfig) => {
  const addedProps = Object.keys(secondConfig)
    .filter((item) => !_.has(firstConfig, item))
    .map((item) => `+ ${item}: ${secondConfig[item]}`);

  const deletedProps = Object.keys(firstConfig)
    .filter((item) => !_.has(secondConfig, item));

  const changedAndDeleted = Object.keys(firstConfig).reduce((acc, item) => {
    if (deletedProps.includes(item)) {
      return [...acc, `- ${item}: ${firstConfig[item]}`];
    }
    if (firstConfig[item] === secondConfig[item]) {
      return [...acc, `  ${item}: ${firstConfig[item]}`];
    }
    return [...acc, `+ ${item}: ${secondConfig[item]}\n- ${item}: ${firstConfig[item]}`];
  }, []);

  const difference = _.concat(['{'], changedAndDeleted, addedProps, ['}']).join('\n');

  return difference;
};

const buildAST = (firstConfig, secondConfig) => {
  const allKeys = [...Object.keys(firstConfig), ...Object.keys(secondConfig)];
  const allUniqKeys = new Set(allKeys);

  const states = [
    {
      name: 'added',
      check: (key) => firstConfig[key] === undefined && secondConfig[key] !== undefined,
    },
    {
      name: 'deleted',
      check: (key) => firstConfig[key] !== undefined && secondConfig[key] === undefined,
    },
    {
      name: 'unchanged',
      check: (key) => (
        (firstConfig[key] !== undefined && secondConfig[key] !== undefined)
        && (firstConfig[key] === secondConfig[key])),
    },
    {
      name: 'changed',
      check: (key) => (
        (firstConfig[key] !== undefined && secondConfig[key] !== undefined)
        && (firstConfig[key] !== secondConfig[key])),
    },
  ];

  const ast = [];

  allUniqKeys.forEach((item) => {
    const elem = {};
    elem.name = item;

    const state = states.find(({ check }) => check(item));
    elem.state = state.name;

    ast.push(elem);
  });

  return console.log(ast);
};

export default (firstConfigPath, secondConfigPath) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  buildAST(contentFirstConfig, contentSecondConfig);

  return compare(contentFirstConfig, contentSecondConfig);
};
