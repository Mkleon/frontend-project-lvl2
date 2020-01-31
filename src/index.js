import _ from 'lodash';
import getContent from './parsers';

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

const renderJSON = (tree) => {
  const indent = 2;

  const stringify = (obj, spaces) => {
    if (obj instanceof Object) {
      const arr = Object.keys(obj).reduce((acc, item) => [...acc, `${spaces}      ${item}: ${obj[item]}`], []);
      return ['{', arr, `${spaces}  }`].join('\n');
    }
    return obj;
  };

  const formatters = {
    add: '+ ',
    del: '- ',
    unchange: '  ',
  };

  const iter = (acc, node, level = 1) => {
    const spaces = ' '.repeat((indent * level) + ((level - 1) * 2));
    const spacesBeforeCloseBracket = level === 1 ? '' : (' '.repeat((indent * level) + ((level - 1) * 2) - indent));

    const elem = node.reduce((accInner, itemInner) => {
      const newItem = (itemInner.hasChildren)
        ? [`${spaces}${formatters.unchange}${itemInner.name}: ${iter([], itemInner.children, level + 1)}`]
        : Object.keys(itemInner.value).map((item) => (
          `${spaces}${formatters[item]}${itemInner.name}: ${stringify(itemInner.value[item], spaces)}`
        ));

      return [...accInner, ...newItem];
    }, acc);

    return ['{', ...elem, `${spacesBeforeCloseBracket}}`].join('\n');
  };

  const text = [iter([], tree, 1)];

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

  // console.log(ast);
  const render = getRender(format);
  // console.log(render(ast));
  return render(ast);
};
