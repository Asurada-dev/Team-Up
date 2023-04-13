const moment = require('moment');
function formatMessage(userName, text) {
  return {
    userName,
    text,
    time: moment().format('HH:mm'),
  };
}

module.exports = formatMessage;
