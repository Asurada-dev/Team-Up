require('dotenv').config();
require('express-async-errors');

// express framework
const express = require('express');
const app = express();

//packages
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
// routers
// const userRouter = require('./routes/userRoutes.js');
const authRouter = require('./routes/auth_routes.js');
const userRouter = require('./routes/user_routes.js');
const movieRouter = require('./routes/movie_routes.js');
const activityRouter = require('./routes/activity_routes.js');
const moviePageRouter = require('./routes/movie_page_routes.js');
const activityPageRouter = require('./routes/activity_page_routes.js');
const authPageRouter = require('./routes/auth_page_routes.js');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());
const { authenticateUser } = require('./middlewares/authentication');
// middleware
const errorHandlerMiddleware = require('./middlewares/error_handler');
const notFoundMiddleware = require('./middlewares/not_found');

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// back-end
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/movie', movieRouter);
app.use('/api/v1/activity', activityRouter);

// front-end
app.use('/auth', authPageRouter);
app.use('/movie', authenticateUser, moviePageRouter);
app.use('/activity', authenticateUser, activityPageRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening ${port}`);
});
