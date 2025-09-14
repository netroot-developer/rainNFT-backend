const emailExistence = require("email-existence");

/**
 * Check if email exists via SMTP
 * @param {string} email - Email address to check
 * @returns {Promise<{ isError: any, isMail: boolean }>}
 */

function checkEmail(email) {
    if(!email) return {
        isError: null,
        isMail: null,
      }
  return new Promise((resolve) => {
    emailExistence.check(email, function (error, response) {
      resolve({
        isError: error,
        isMail: response,
      });
    });
  });
}
module.exports = {checkEmail};
