import _ from 'lodash';
import getContent from './parsers';

const buildAST = (firstConfig, secondConfig) => {
  const uniqProps = _.union([...Object.keys(firstConfig), ...Object.keys(secondConfig)]);
  const sortedProps = uniqProps.slice().sort();

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

  const createElement = (name) => {
    const valueBefore = firstConfig[name];
    const valueAfter = secondConfig[name];
    const hasChildren = firstConfig[name] instanceof Object && secondConfig[name] instanceof Object;

    return {
      name,
      state: states.find(({ check }) => check(name)).name,
      valueBefore,
      valueAfter,
      children: hasChildren ? buildAST(valueBefore, valueAfter) : [],
    };
  };

  const ast = sortedProps.reduce((acc, prop) => [...acc, createElement(prop)], []);

  return ast;
};

const renderJSON = (node) => {
  const indent = 2;

  const stringify = (obj, spaces) => {
    if (obj instanceof Object) {
      const arr = Object.keys(obj).reduce((acc, item) => [...acc, `${spaces}      ${item}: ${obj[item]}`], []);
      return ['{', arr, `${spaces}  }`].join('\n');
    }
    return obj;
  };

  const iter = (acc, item, level) => {
    const spaces = ' '.repeat((indent * level) + ((level - 1) * 2));
    const spacesBeforeCloseBracket = level === 1 ? '' : (' '.repeat((indent * level) + ((level - 1) * 2) - indent));

    const text2 = item.reduce((accInner, itemInner) => {
      if (itemInner.state === 'added') {
        return [...accInner, `${spaces}+ ${itemInner.name}: ${stringify(itemInner.valueAfter, spaces)}`];
      }
      if (itemInner.state === 'deleted') {
        return [...accInner, `${spaces}- ${itemInner.name}: ${stringify(itemInner.valueBefore, spaces)}`];
      }
      if (itemInner.state === 'changed') {
        return [...accInner, `${spaces}+ ${itemInner.name}: ${stringify(itemInner.valueAfter, spaces)}`, `${spaces}- ${itemInner.name}: ${stringify(itemInner.valueBefore, spaces)}`];
      }
      return [...accInner, `${spaces}  ${itemInner.name}: ${(itemInner.children.length === 0) ? itemInner.valueBefore : iter([], itemInner.children, level + 1)}`];
    }, acc);

    return ['{', ...text2, `${spacesBeforeCloseBracket}}`].join('\n');
  };

  const text = [iter([], node, 1)];

  return text.join('\n');
};


const renders = {
  json: renderJSON,
};

const getRender = (format) => renders[format];

export default (firstConfigPath, secondConfigPath, format) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  const ast = buildAST(contentFirstConfig, contentSecondConfig);

  const render = getRender(format);

  return render(ast);
};
