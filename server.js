const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');

// Load ENV vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

// Routes files
const bootcamps = require('./routes/bootcamps');

const app = express();

// Body-parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;
const server = app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.yellow.bold)
);

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	// Close server and exit process
	server.close(() => process.exit(1));
});
