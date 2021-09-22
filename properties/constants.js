const responseCodes = {
    COMMON_ERROR_CODE: 400,
    SOMETHING_WENT_WRONG: 400,
    INVALID_PARAMS: 400,
    AUTHENTICATION_ERROR: 401,
    SUCCESS: 200,
};

const commonResponseMessages = {
    SOMETHING_WENT_WRONG: "SOMETHING_WENT_WRONG_WITH_PUPPETEER_EVALUATIONS",
    INVALID_PARAMS: "INVALID_PARAMS",
    SUCCESS: "SUCCESS",
    INVALID_URL:"INVALID_URL",
    NO_REVIEWS_FOUND:"NO_REVIEWS_FOUND",
    ERROR_FETCHING_REVIEWS:"ERROR_FETCHING_REVIEWS"
};

module.exports = {
    responseCodes,
    commonResponseMessages
}

// These constants can further be mapped to messages.json
// {
//   "en": {
//     "SOMETHING_WENT_WRONG" : "Something went wront, Please try again !" ,
//     "SUCCESS" : "Execution Successful" ,
//     "ERROR_FETCHING_REVIEWS" : "There was some error in fetching reviews" ,
//   }
// }