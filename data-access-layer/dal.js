const { Pool } = require("pg");

const pool=new Pool({
     connectionString: "postgres.bjafudzdwhkbxqeeueng:vacations@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
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