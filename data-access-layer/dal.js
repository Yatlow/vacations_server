const { Pool } = require("pg");

const pool=new Pool({
     connectionString: "postgresql://postgres:vacations@db.bjafudzdwhkbxqeeueng.supabase.co:5432/postgres",
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