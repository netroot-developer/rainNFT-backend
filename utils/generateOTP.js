/**
 * Generates a numeric OTP (One-Time Password) with a default length of 6 digits
 * and default expiry time of 10 minutes.
 *
 * @param {Object} [options={}] - Configuration object.
 * @param {number} [options.length=6] - Length of the OTP (default: 6 digits).
 * @param {number} [options.expiresIn=10] - Expiry time in minutes (default: 10 minutes).
 * @returns {{ otp: string, otpExpiry: Date }} - The generated OTP and its expiry time.
 */

function generateOTP({ length = 6, expiresIn = 10 } = {}) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  
    const otpExpiry = new Date(Date.now() + expiresIn * 60 * 1000); // expiry in minutes
  
    return {
      otp: otp.toString(),
      otpExpiry,
    };
  }

module.exports = {generateOTP};