const constants = require("../properties/constants");


class Responses {
    constructor(resp, data, code, message) {
        this.resp = resp;
        this.data = data;
        this.code = code;
        this.message = message;
    }
    sendCustomSuccessResponse() {
        const response = {
          statusCode: this.code || constants.responseCodes.SUCCESS,
          message: this.message || constants.commonResponseMessages.SUCCESS,
          data: this.data || {},
        };
        this.resp.type("json");
        return this.resp.send(JSON.stringify(response));
    }
    sendCustomErrorResponse() {
        const response = {
          statusCode: this.code || constants.responseCodes.SOMETHING_WENT_WRONG,
          message: this.message || constants.commonResponseMessages.SOMETHING_WENT_WRONG,
          data: this.data || {},
        };
      
        this.resp.statusCode = this.code || constants.responseCodes.SOMETHING_WENT_WRONG;
        this.resp.type("json");
      
        return this.resp.send(JSON.stringify(response));
    }
}

module.exports = Responses;