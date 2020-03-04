const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventory.db')
const PORT = process.env.PORT || 3000;
const app = express();
const bodyparser = require('body-parser')

const url = 'http://localhost:3000/home'

app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

const items = [];
const stockArr = [];
let currentStock = [];
let nrOfProducts = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({ extended: true }))



/**********************************************
 * @HOME
 * 
 * List of products from a PRODUCTS database
 * 
 * -Linked button >> @Termékek <<
 * 
 ***********************************************/

app.get('/home', (req, res) => {
    items.length = 0;

    db.serialize(function () {
        db.all("SELECT rowid, name, category from products", function (err, results) {
            if (err != null) {
                res.send("Missing from database")
            }
            results.forEach(elem => {
                items.push(elem)
            })
            res.render('home', { items })
        });
    });
})



/************************************
 * 
 * @NEW_PRODUCT
 * 
 * Import new products
 * 
 * -Linked button >> @Új_Termék <<
 * 
 *************************************/

app.post('/newprod', (req, res) => {
    const nProd = req.body.names
    const nCateg = req.body.groups

    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS products ( name VARCHAR(100), category VARCHAR(60))")

        db.prepare('INSERT INTO products VALUES (?, ?)')
            .run(`${nProd}`, `${nCateg}`)

        res.redirect('/home')
    });

})




/************************************************************
 * @STOCKS
 * 
 * Attaches eventually new products from PRODUCTS database
 * for the further processing to the stock collection
 * 
 * -Linked button >> @Készletek <<
 * 
 ************************************************************/

app.get('/stocks', (req, response) => {
    items.length = 0;
    stockArr.length = 0;
    let ok = 0
    console.log();
    console.log('Database state:');

    //Reading STOCK database
    db.serialize(function () {
        db.all("SELECT id, name, count from stocks", function (err, results) {
            if (err != null) { res.send("Missing from database") }
            results.forEach(elem => {
                if (elem) {
                    stockArr.push(elem)
                }
            })
        });

        //Reading PRODUCTS database
        db.all("SELECT rowid, name FROM products", (err, res) => {
            if (err) res.send("Missing from database")
            res.forEach(elem => {
                if (elem) {
                    items.push(elem)
                    if (stockArr.length === 0) { ok++ }
                    stockArr.forEach(stEl => {

                        //Attaching new products to the stock collection
                        if (elem.name !== stEl.name) { ok++ }
                    })
                } else { ok = -1 }
                if (ok > 0) { stockArr.push(elem) }
                if (ok < 0) {
                    db.run('DELETE FROM stocks')
                }
            })
            if (stockArr.length > 0) {
                response.render('inventory', { stockArr })
            } else {
                response.send('There are no products to display !')
            }
        })
    });
})



/****************************************************
 * @ACTIVE_STOCK
 * 
 * Current selected product in a STOCKS collection
 * 
 * -Linked button >> Készletek - @Szerkesztés <<
 * 
 ****************************************************/

app.post('/active_stock', (req, res) => {
    let data = `${req.body.id},${req.body.name},${req.body.count}`
    currentStock = data.split(',')
    console.log('Current stock: ', currentStock, currentStock.length);
    console.log();

})



/*************************************************
 * @STOCK_UPDATE
 * 
 * Updates an existing product count
 * Inserts a new product to the STOCKS database
 * 
 * -Linked button >> Stock update form - @OK <<
 * 
 *************************************************/

app.post('/stock_update', (req, res) => {
    let cnt = req.body.count
    // let data = req.params.data
    // const dataArr = data.split(',')
    const newID = currentStock[0]


    if (currentStock[2] !== '') {
        console.log('With count - ', 'to update: ', currentStock[2])
        db.serialize(() => {
            //db.all(`INSERT OR REPLACE INTO stocks VALUES (${newID},${currentStock[1]},${cnt})`)
            db.all(`UPDATE stocks SET count = ${cnt} WHERE id = ${newID}`, (err, result) => {
                if (err) { result.send(`Error occured ${err}`); }
                res.redirect('/stocks')
            })
        })
    } else {
        console.log();
        console.log('Without count  - ', 'cnt: ', newID, currentStock[1], cnt);
        db.serialize(() => {
            db.run(`INSERT INTO stocks VALUES (2,"mosogep",4)`, (err, response) => {
                if (err) console.log('An error occured', err);
            })
            res.redirect('/stocks')
        })
    }
})



app.get('/toedit', (req, res) => {

})

app.get('/del', (req, res) => {
    let id = req.body.prod-Id
    db.serialize(() => {
        db.run(`DELETE FROM products WHERE rowid === ${id}`)
    })
})



app.post('/stock_newnr:data', (req, res) => {

})

app.listen(PORT, () => console.log(`App is started and listening on port ${PORT}`));

