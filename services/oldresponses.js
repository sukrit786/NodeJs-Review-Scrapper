function sendCustomSuccessResponse(resp, data, code, message) {
  const response = {
    statusCode: code || constants.responseCodes.SUCCESS,
    message:
      message || constants.commonResponseMessages.SUCCESS,
    data: data || {},
  };
  resp.type("json");
  return resp.send(JSON.stringify(response));
}

function sendCustomErrorResponse(resp, code, message, data) {
  const response = {
    statusCode: code || constants.responseCodes.SOMETHING_WENT_WRONG,
    message:message||constants.commonResponseMessages.SOMETHING_WENT_WRONG,
    data: data || {},
  };

  resp.statusCode = code || constants.responseCodes.SOMETHING_WENT_WRONG;
  resp.type("json");

  return resp.send(JSON.stringify(response));
}


module.exports = {
  sendCustomErrorResponse,
  sendCustomSuccessResponse,
};
