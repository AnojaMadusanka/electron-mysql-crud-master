const mysql = require('promise-mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'newuser',
  password: 'password',
  database: 'modern_salon'
});

function getConnection() {
  return connection;
}

module.exports = { getConnection };