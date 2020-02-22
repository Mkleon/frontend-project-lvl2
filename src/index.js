import _ from 'lodash';
import fs from 'fs';
import pathModule from 'path';
import getContent from './parsers';
import render from './formatters';

const getState = (name, firstConfig, secondConfig) => {
  const states = [
    {
      name: 'added',
      check: (prop) => !_.has(firstConfig, prop) && _.has(secondConfig, prop),
    },
    {
      name: 'deleted',
      check: (prop) => _.has(firstConfig, prop) && !_.has(secondConfig, prop),
    },
    {
      name: 'unchanged',
      check: (prop) => (_.isObject(firstConfig[prop]) && _.isObject(secondConfig[prop]))
        || firstConfig[prop] === secondConfig[prop],
    },
    {
      name: 'changed',
      check: (prop) => firstConfig[prop] !== secondConfig[prop],
    },
  ];

  return states.find(({ check }) => check(name));
};

const buildAST = (firstConfig, secondConfig) => {
  const allUniqProps = _.union(_.keys(firstConfig), _.keys(secondConfig));
  const sortedProps = allUniqProps.slice().sort();

  const ast = sortedProps.map((name) => {
    const valueBefore = firstConfig[name];
    const valueAfter = secondConfig[name];
    const hasChildren = _.isObject(firstConfig[name]) && _.isObject(secondConfig[name]);
    const state = getState(name, firstConfig, secondConfig);

    const children = hasChildren ? buildAST(valueBefore, valueAfter) : [];

    return {
      name,
      state: state.name,
      valueBefore,
      valueAfter,
      hasChildren,
      children,
    };
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
