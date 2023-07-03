require('dotenv').config()
const express = require('express');
const app = express();
app.use( express.json() );

var multer = require('multer');
var upload = multer();
app.use(upload.array()); 
app.use(express.static('public'));

const auth = require("./auth");
// app.use(auth);

app.get("/", (req, res) => {
    res.send("ping pong");
});

app.use("/api", require("./routes/api_router"));

// for killing port on restart and exit
process.once('SIGUSR2', function () {
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
  // this is only called on ctrl+c, not restart
    process.kill(process.pid, 'SIGINT');
});

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});


const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0',()=>{
    console.log("Server is listening on ", PORT);
});