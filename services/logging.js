const moment = require("moment");

let debugging_enabled = true;
if (process.env.NODE_ENV === "live") {
  debugging_enabled = false;
}

function log(keyword, log) {
  if (debugging_enabled) {
    try {
      log = JSON.stringify(log);
    } catch (exception) {}
    console.log(
      "–>" +
        moment(new Date()).format("YYYY-MM-DD hh:mm:ss.SSS") +
        " :----: " +
        keyword +
        " :=: " +
        log
    );
  }
}

function logError(keyword, error) {
  if (debugging_enabled) {
    console.error(keyword, error);
  }
}

module.exports = {
  log,
  logError,
};
