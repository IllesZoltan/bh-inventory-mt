const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventory.db')

function database(namepm, categorypm) {
    if (namepm && categorypm) {
        db.serialize(function () {
            db.run("CREATE TABLE IF NOT EXISTS products ( name VARCHAR(100), category VARCHAR(60))")

            db.prepare('INSERT INTO products VALUES (?, ?)')
                .run(`${namepm}`, `${categorypm}`)
        });
    }
}

function stockdb(id, namepm, count) {
    if (id && namepm && count) {
        db.serialize(function () {
            db.run("CREATE TABLE IF NOT EXISTS stocks ( id VARCHAR (60), name VARCHAR(100), count VARCHAR(60))")

            db.prepare('INSERT INTO stocks VALUES (?, ?, ?)')
                .run(`${id}`, `${namepm}`, `${count}`)
        });
    }
}

function deletion(){
    db.serialize(() => {
        db.run('DELETE FROM stocks')
    })
    //stockdb("1","vasalo","12")
}


//deletion()
//database("mosogep", "haztartas")
//stockdb("1","vasalo","12")
