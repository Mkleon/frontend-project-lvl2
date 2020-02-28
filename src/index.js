import _ from 'lodash';
import fs from 'fs';
import pathModule from 'path';
import getContent from './parsers';
import render from './formatters';

const getState = (name, firstConfig, secondConfig) => {
  const getItem = (prop) => (
    {
      value: { valueBefore: firstConfig[prop], valueAfter: secondConfig[prop] },
    }
  );

  const states = [
    {
      state: 'added',
      check: (prop) => !_.has(firstConfig, prop) && _.has(secondConfig, prop),
      getItem,
    },
    {
      state: 'deleted',
      check: (prop) => _.has(firstConfig, prop) && !_.has(secondConfig, prop),
      getItem,
    },
    {
      state: 'nested',
      check: (prop) => _.isObject(firstConfig[prop]) && _.isObject(secondConfig[prop]),
      getItem: (prop, fn) => ({ children: fn(firstConfig[prop], secondConfig[prop]) }),
    },
    {
      state: 'unchanged',
      check: (prop) => firstConfig[prop] === secondConfig[prop],
      getItem,
    },
    {
      state: 'changed',
      check: (prop) => firstConfig[prop] !== secondConfig[prop],
      getItem,
    },
  ];

  return states.find(({ check }) => check(name));
};

const buildAST = (firstConfig, secondConfig) => {
  const allUniqProps = _.union(_.keys(firstConfig), _.keys(secondConfig));
  const sortedProps = allUniqProps.slice().sort();

  const ast = sortedProps.map((name) => {
    const { state, getItem } = getState(name, firstConfig, secondConfig);
    const newItem = getItem(name, buildAST);

    return { name, state, ...newItem };
  });

  return ast;
};

export default (path1, path2, format) => {
  const data1 = fs.readFileSync(path1, 'utf8');
  const data2 = fs.readFileSync(path2, 'utf8');

  const type1 = pathModule.extname(path1).slice(1);
  const type2 = pathModule.extname(path2).slice(1);

  const config1 = getContent(data1, type1);
  const config2 = getContent(data2, type2);

  const ast = buildAST(config1, config2);

  return render(format, ast);
};
