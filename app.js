require('dotenv').config({ debug: false });
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const connectMongoSession = require("connect-mongo");
// const loggerGenerate = require("./logger");

const indexRouter = require('./routes/index.routes');
const { limiter } = require('./utils/rateLimit');
const { syncUserSession } = require("./utils/syncUserSession.session");
const { requestLogger, errorLogger } = require('./middleware/logger.middleware');
require("./utils/config.db")();
// require("./utils/admin.autoregister").AdminRegisterAuto();
// require("./utils/admin.autoregister").ControllerCreateAuto();
require("./utils/calculateTrading.income")
// require("./utils/autopull/autoslot");
// require("./utils/boostingpull/boostingslot");
// require("./utils/calculateRoyalty.income");
// require("./utils/mongoose.logger")();

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true, methods: ['POST', 'GET', 'DELETE', 'PATCH', 'PUT'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(xssClean());
app.use(mongoSanitize({}));
app.use(limiter)
app.set("trust proxy", 1);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



app.use(logger('dev'));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.EXPRESS_SESSION,
  name: process.env.SESSION_NAME ?? "sid",
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === "development",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE_MS || "3600000", 10),
  },
  store: connectMongoSession.create({
    mongoUrl: process.env.DATABASE_URL,
    collectionName: "userSessions",
    ttl: parseInt(process.env.SESSION_TTL_SEC || "3600", 10),
    autoRemove: "native",
    crypto: { secret: process.env.SESSION_CRYPTO_SECRET }
  })
}))
app.use(syncUserSession);
// Middleware: sabhi requests log karo
app.use(requestLogger);

app.use('/api', indexRouter);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Error logger middleware (sabhi routers ke liye common)
app.use(errorLogger);

module.exports = app;
