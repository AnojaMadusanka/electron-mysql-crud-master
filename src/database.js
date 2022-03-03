const mysql = require('promise-mysql');

const connection = mysql.createConnection({
  host: 'db4free.net',
  user: 'salon_test',
  password: 'salon_test',
  database: 'salon_test'
});

function getConnection() {
  return connection;
}

module.exports = { getConnection };