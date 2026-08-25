const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./dev.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the dev.db database.');
});

db.serialize(() => {
  db.all(`SELECT id, name, imageUrl FROM Product`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    console.log(`Total products in SQLite: ${rows ? rows.length : 0}`);
    if (rows) {
      rows.forEach((row) => {
        console.log(`- ${row.name}: ${row.imageUrl}`);
      });
    }
  });
});

db.close();
