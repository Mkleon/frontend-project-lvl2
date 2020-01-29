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
  const views = {
    added: (el) => [`+ ${el.name}: ${el.valueNew}`],
    deleted: (el) => [`- ${el.name}: ${el.valueOld}`],
    unchanged: (el) => [`  ${el.name}: ${(el.children.length === 0) ? el.valueOld : renderJSON(el.children)}`],
    changed: (el) => [`+ ${el.name}: ${el.valueNew}`, `- ${el.name}: ${el.valueOld}`],
  };

  const text = node.reduce((acc, item) => {
    const getView = views[item.state];
    const view = getView(item);

    return [...acc, ...view];
  }, []);

  return ['{', ...text, '}'].join('\n');
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
