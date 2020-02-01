export default (tree) => {

  const stringify = (obj, spaces) => {
    if (obj instanceof Object) {
      const arr = Object.keys(obj).reduce((acc, item) => [...acc, `${spaces}      ${item}: ${obj[item]}`], []);
      return ['{', arr, `${spaces}  }`].join('\n');
    }
    return obj;
  };

  const operations = {
    add: '+',
    del: '-',
    unchange: ' ',
  };

  const iter = (acc, node, level = 1) => {
    const indent = 2;
    const spaces = ' '.repeat((indent * level) + ((level - 1) * 2));
    const spacesBeforeCloseBracket = level === 1 ? '' : (' '.repeat((indent * level) + ((level - 1) * 2) - indent));

    const elem = node.reduce((accInner, itemInner) => {
      const newItem = (itemInner.hasChildren)
        ? [`${spaces}${operations.unchange} ${itemInner.name}: ${iter([], itemInner.children, level + 1)}`]
        : Object.keys(itemInner.value).map((item) => (
          `${spaces}${operations[item]} ${itemInner.name}: ${stringify(itemInner.value[item], spaces)}`
        ));

      return [...accInner, ...newItem];
    }, acc);

    return ['{', ...elem, `${spacesBeforeCloseBracket}}`].join('\n');
  };

  const content = [iter([], tree)];

  return content.join('\n');
};
