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
      check: (prop) => (firstConfig[prop] instanceof Object && secondConfig[prop] instanceof Object)
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

  const ast = sortedProps.reduce((acc, prop) => {
    const valueBefore = firstConfig[prop];
    const valueAfter = secondConfig[prop];
    const hasChildren = firstConfig[prop] instanceof Object && secondConfig[prop] instanceof Object;
    const state = getState(prop, firstConfig, secondConfig);

    const children = hasChildren ? buildAST(valueBefore, valueAfter) : [];

    const newItem = {
      name: prop,
      state: state.name,
      valueBefore,
      valueAfter,
      hasChildren,
      children,
    };

    return [...acc, newItem];
  }, []);

  return ast;
};

export default (path1, path2, format) => {
  const data1 = fs.readFileSync(path1, 'utf8');
  const data2 = fs.readFileSync(path2, 'utf8');

  const ext1 = pathModule.extname(path1).slice(1);
  const ext2 = pathModule.extname(path2).slice(1);

  const config1 = getContent(data1, ext1);
  const config2 = getContent(data2, ext2);

  const ast = buildAST(config1, config2);

  return render(format, ast);
};
