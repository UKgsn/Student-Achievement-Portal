//For making connections
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'samp'
});

con.connect((err)=>{
    if(err) throw err;
    console.log("Database Connected");
});

module.exports.con = con;