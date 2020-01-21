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

export default (firstConfigPath, secondConfigPath) => {
  const contentFirstConfig = getContent(firstConfigPath);
  const contentSecondConfig = getContent(secondConfigPath);

  return compare(contentFirstConfig, contentSecondConfig);
};
