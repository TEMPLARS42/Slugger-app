const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
dotenv.config();
const mongoose = require('mongoose');
const cors = require("cors");
const routes = require('./routes/index');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
const dbURI = 'mongodb://127.0.0.1:27017/';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Routes
app.use('/', routes);

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
