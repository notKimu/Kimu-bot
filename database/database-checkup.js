const mysql = require('mysql');

// DB Connection
console.log("Connecting with MySQL...")
var con = mysql.createPool({
    host: "localhost",
    user: "kami",
    password: process.env.DBPASS,
    database: "kamidb"
});

con.getConnection(function (err) {
    if (err) {
        console.log("[FATAL] There was an error connecting with MySQL.")
        throw err;
    };
});

console.log("Loading the MySQL modules:");

con.query('SELECT * FROM welcome;', function (err) {
    if (err) {
        console.log("[FATAL] The welcome module is missing!")
        throw err;
    };
    console.log("| Loaded the welcome module.")
});

con.query('SELECT * FROM log;', function (err) {
    if (err) {
        console.log("[FATAL] The log module is missing!")
        throw err;
    };
    console.log("| Loaded the log module.");
});

con.query('SELECT * FROM descriptionimg;', function (err) {
    if (err) {
        console.log("[FATAL] The descriptionimg module is missing!")
        throw err;
    };
    console.log("| Loaded the descriptionimg module.");
});

con.query('SELECT * FROM profileimg;', function (err) {
    if (err) {
        console.log("[FATAL] The profileimg module is missing!")
        throw err;
    };
    console.log("| Loaded the profileimg module.");
});

con.query('SELECT * FROM rankimg;', function (err) {
    if (err) {
        console.log("[FATAL] The rankimg module is missing!")
        throw err;
    };
    console.log("| Loaded the rankimg module.");
    console.log("Done. MySQL is running!");
    return;
});