const path = require('path');
const app = require('express')();
const morgan = require('morgan');
const tourRouter = require('./routes/tours');
const userRouter = require('./routes/users');
const reviewRouter = require('./routes/reviews');
const viewRouter = require('./routes/viewRoutes');
const rateLimit = require('express-rate-limiter');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'unsafe-inline'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
    },
  })
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware stack
//Middleware for setting security http headers
app.use(helmet());
//Middleware for parsing the data in req.body
app.use(require('express').json());

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Middleware for logging in the development
app.use(morgan('dev'));

//preventing parameter pollution with hpp(http parameter pollution)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//global middleware for limiting the ammount of requests from the same IP.
/* const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. please try again in an hour!',
});
 */
/* app.use('/api', limiter); */
//middleware for serving static files.
app.use(require('express').static(`${__dirname}/public`));

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Cant find the requested url ${req.originalUrl}`,
  }); */
  /* const err = new Error(`Cant find the requested url ${req.originalUrl}`);
  err.statusCode = 404;
  err.status = 'fail'; */
  next(new AppError(`Cant find the requested url ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
