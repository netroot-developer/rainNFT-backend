// const morgan = require("morgan");
// const fs = require("fs");
// const path = require("path");
// const logger = require("../logger");

// const logDir = path.join(__dirname, "..", "public", "logs");

// // Morgan stream (request logs -> combined.log)
// const accessLogStream = fs.createWriteStream(path.join(logDir, "combined.log"), { flags: "a" });

// const requestLogger = morgan("common", { stream: accessLogStream });

// // Custom error handler
// const errorLogger = (err, req, res, next) => {
// //   logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
//   res.status(500).json({ error: "Something went wrong" });
// };

// module.exports = { requestLogger, errorLogger };


const logger = require("../logger");

// Request logger (method, url, body, query, params, ip)
const requestLogger = (req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

  logger.info(
    `REQUEST: ${req.method} ${req.originalUrl} | IP: ${clientIp} | Query: ${JSON.stringify(req.query)} | Params: ${JSON.stringify(req.params)} | Body: ${JSON.stringify(req.body || {})}`
  );
  next();
};

// Error logger
const errorLogger = (err, req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

  logger.error(
    `ERROR: ${req.method} ${req.originalUrl} | IP: ${clientIp} | Message: ${err.message} | Stack: ${err.stack}`
  );
  res.status(500).json({ error: "Something went wrong" });
};

module.exports = { requestLogger, errorLogger };
