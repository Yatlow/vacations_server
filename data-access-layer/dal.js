const { Pool } = require("pg");
require('dotenv').config();
console.log("DB URL:", process.env.DATABASE_URL);
const pool=new Pool({
     connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

function executeQueryAsync(sqlCmd,params=[]) {
    return new Promise((resolve, reject) => {
        pool.query(sqlCmd, params,(err, result)=> {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    executeQueryAsync
};