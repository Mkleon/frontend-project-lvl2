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
      check: (key) => ((firstConfig[key] instanceof Object)
        && (secondConfig[key] instanceof Object))
        || ((!(firstConfig[key] instanceof Object)
              || !(secondConfig[key] instanceof Object))
            && (firstConfig[key] === secondConfig[key])),
    },
    {
      name: 'changed',
      check: (key) => (!(firstConfig[key] instanceof Object)
        || !(secondConfig[key] instanceof Object))
        && (firstConfig[key] !== secondConfig[key]),
    },
  ];

  const ast = [];

  allUniqKeys.forEach((key) => {
    const elem = {};
    elem.name = key;
    elem.state = states.find(({ check }) => check(key)).name;
    elem.valueOld = firstConfig[key];
    elem.valueNew = secondConfig[key];

    elem.children = (firstConfig[key] instanceof Object && secondConfig[key] instanceof Object)
      ? buildAST(elem.valueOld, elem.valueNew)
      : [];

    ast.push(elem);
  });

  return ast;
};

const renderJSON = (node) => {
  const spacesOnLevel = 2;

  const iter = (acc, item, level) => {
    const spaces = ' '.repeat((spacesOnLevel * level) + ((level - 1) * 2));
    const spacesBeforeOpenBracket = '';
    const spacesBeforeCloseBracket = level === 1 ? '' : (' '.repeat((spacesOnLevel * level) + ((level - 1) * 2) - spacesOnLevel));

    const text2 = item.reduce((accInner, itemInner) => {
      if (itemInner.state === 'added') {
        return [...accInner, `${spaces}+ ${itemInner.name}: ${itemInner.valueNew}`];
      }
      if (itemInner.state === 'deleted') {
        return [...accInner, `${spaces}- ${itemInner.name}: ${itemInner.valueOld}`];
      }
      if (itemInner.state === 'changed') {
        return [...accInner, `${spaces}+ ${itemInner.name}: ${itemInner.valueNew}`, `${spaces}- ${itemInner.name}: ${itemInner.valueOld}`];
      }
      return [...accInner, `${spaces}  ${itemInner.name}: ${(itemInner.children.length === 0) ? itemInner.valueOld : iter([], itemInner.children, level + 1)}`];
    }, acc);

    return [`${spacesBeforeOpenBracket}{`, ...text2, `${spacesBeforeCloseBracket}}`].join('\n');
  };

  const text = [iter([], node, 1)];

  return text.join('\n');
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

  // console.log(ast);
  const render = getRender(command.format);

  console.log(render(ast));

  return render(ast);
};
