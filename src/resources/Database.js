const mysql = require('mysql');

class Database {
    constructor(database = "Dev_Link") {
        this.connection = mysql.createConnection({
            host: process.env.MYSQL_IP,
            user: "Carson",
            password: process.env.MYSQL_PASS,
            database: database
        });
    }
    query(sql, limit = true) {
        return new Promise((resolve, reject) => {
            this.connection.query(`${sql}${limit && sql.includes('SELECT') ? ' LIMIT 1' : ''}`, (error, rows) => {
                if (error) return reject(error);
                if (rows.length < 1 && !limit) rows = undefined;
                (limit) ? resolve(rows[0]) : resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }
}

module.exports = Database;