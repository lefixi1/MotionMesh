import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "10.41UnizA",
  database: "bp",
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to database");
    connection.release();
  } catch (err) {
    console.log("Error connecting to database:", err);
  }
})();

export default db;
