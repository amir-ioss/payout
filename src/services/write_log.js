const fs = require("fs");

function writeLog(logs) {
    date = formattedDateTime().formattedDate;
    time = formattedDateTime().formattedTime;
    log_file = "logs/" + date + ".log";
    logs = `\n'${date} ${time}'--------------------------------\n` + logs + "\n";

    // Save log to file.
    fs.appendFile(log_file, logs, "utf8", function (error) {
        if (error) {
            console.log("writeLog error : " + error);
        }
    });
}

function formattedDateTime(){
    const date = new Date();

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');

    const formattedTime = date.toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata'
    }).split(" ")[1];
    
    return {
        'formattedDate' : formattedDate,
        'formattedTime' : formattedTime
    }
}

module.exports = writeLog;