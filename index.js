const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');
const globalErrorHandler = require('./controllers/errorController');
dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors())
app.use("/uploads", express.static("./uploads"))
app.use('/api/v1', routes)

mongoose.connect(process.env.MONGO_URI).then(
    console.log('database connected')

)
app.get('/',(req,res) => {
    res.send("Hello from the server!")
})
let port = process.env.PORT || 3000



app.listen(port, () => {
    console.log(`server is listening on port ${port}`)
});
app.use(globalErrorHandler);