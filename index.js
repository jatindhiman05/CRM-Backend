const express = require('express');
const app = express();

global.app = app;

require('./middlewares')
app.use(require('./modules'));  
require('./startup')