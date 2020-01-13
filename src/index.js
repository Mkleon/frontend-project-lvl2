import fs from 'fs';
import _ from 'lodash';

const getContent = (configPath) => {
  const fileContent = fs.readFileSync(configPath);

  return JSON.parse(fileContent);
};

export default (firstConfig, secondConfig) => {
  const contentFirstConfig = getContent(firstConfig);
  const contentSecondConfig = getContent(secondConfig);

  const addedProps = Object.keys(contentSecondConfig)
    .filter((item) => !_.has(contentFirstConfig, item))
    .map((item) => `+ ${item}: ${contentSecondConfig[item]}`);

  const deletedProps = Object.keys(contentFirstConfig)
    .filter((item) => !_.has(contentSecondConfig, item));

  const changedAndDeleted = Object.keys(contentFirstConfig).reduce((acc, item) => {
    if (deletedProps.includes(item)) {
      return [...acc, `- ${item}: ${contentFirstConfig[item]}`];
    }
    if (contentFirstConfig[item] === contentSecondConfig[item]) {
      return [...acc, `  ${item}: ${contentFirstConfig[item]}`];
    }
    return [...acc, `+ ${item}: ${contentSecondConfig[item]}\n- ${item}: ${contentFirstConfig[item]}`];
  }, []);

  const difference = _.concat(['{'], changedAndDeleted, addedProps, ['}']).join('\n');

  return difference;
};
