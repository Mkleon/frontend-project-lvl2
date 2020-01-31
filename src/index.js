import _ from 'lodash';
import getContent from './parsers';

const buildAST = (firstConfig, secondConfig) => {
  const uniqProps = _.union([...Object.keys(firstConfig), ...Object.keys(secondConfig)]);
  const sortedProps = uniqProps.slice().sort();

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

  const ast = sortedProps.reduce((acc, key) => {
    const elem = {};
    elem.name = key;
    elem.state = states.find(({ check }) => check(key)).name;
    elem.valueOld = firstConfig[key];
    elem.valueNew = secondConfig[key];

    elem.children = (firstConfig[key] instanceof Object && secondConfig[key] instanceof Object)
      ? buildAST(elem.valueOld, elem.valueNew)
      : [];

    return [...acc, elem];
  }, []);

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
        return [...accInner, `${spaces}+ ${itemInner.name}: ${stringify(itemInner.valueNew, spaces)}`];
      }
      if (itemInner.state === 'deleted') {
        return [...accInner, `${spaces}- ${itemInner.name}: ${stringify(itemInner.valueOld, spaces)}`];
      }
      if (itemInner.state === 'changed') {
        return [...accInner, `${spaces}+ ${itemInner.name}: ${stringify(itemInner.valueNew, spaces)}`, `${spaces}- ${itemInner.name}: ${stringify(itemInner.valueOld, spaces)}`];
      }
      return [...accInner, `${spaces}  ${itemInner.name}: ${(itemInner.children.length === 0) ? itemInner.valueOld : iter([], itemInner.children, level + 1)}`];
    }, acc);

    return ['{', ...text2, `${spacesBeforeCloseBracket}}`].join('\n');
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

export default (firstConfigPath, secondConfigPath, format) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  const ast = buildAST(contentFirstConfig, contentSecondConfig);

  const render = getRender(format);

  return render(ast);
};
