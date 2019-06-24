const setting = require('./config/setting');
const express = require('express');
const app = express();
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//routes start
const authentication = require('./routes/authentication')(router);
//routes end

//dababase connection
mongoose
    .connect(setting.dbUrl,{ useNewUrlParser: true })
    .then(() => {
        console.log(`Database connected at ${setting.dbUrl}`)
    })
    .catch(err => {
        console.log(err)
    })

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(morgan('dev'));

app.use('/auth',authentication);

app.listen(setting.PORT,()=>{
    console.log(`server is running at: ${setting.PORT}`);
})