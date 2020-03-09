const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventory.db')

function database(idpm, namepm, descript, categorypm) {
    if (namepm && categorypm) {
        db.serialize(function () {
            db.run("CREATE TABLE IF NOT EXISTS products ( id INT, name VARCHAR(100), description TEXT, category VARCHAR(60))")

            db.prepare('INSERT INTO products VALUES (?, ?, ?, ?)')
                .run(`${idpm}`, `${namepm}`, `${descript}`, `${categorypm}`)
        });
    }
}

function stockdb(id, count) {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS stocks ( id INT, count INT)")

        if (id && count) {
            db.prepare('INSERT INTO stocks VALUES (?, ?)')
                .run(`${id}`, `${count}`)
        }
    });
}

function groupdb(id, grp) {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS groups ( id INT, maingroup VARCHAR(100))")

        if (id && grp) {
            db.prepare('INSERT INTO groups VALUES (?, ?)')
                .run(`${id}`, `${grp}`)
        }
    });
}

function deletion() {
    db.serialize(() => {
        db.run('DELETE FROM groups')
    })
}



 deletion()
// database(1, "Mosógép", "Bosch", "Háztartás")
// stockdb()
 groupdb(1,"Háztartás")
