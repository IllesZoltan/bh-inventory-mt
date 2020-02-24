const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventory.db')
const PORT = process.env.PORT || 3000;
const app = express();

const url = 'http://localhost:3000'

app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

const items = [];
const stockArr = [];

app.use(express.static(path.join(__dirname, 'public')));

/*app.get('/', (req, res) => {
	res.render('home', { items});
});*/

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
            res.render('home', {items})
        });
    });
})


app.post('/newprod/:product', (req, res) => {
    const nProd = req.params.product
    const prodArr = nProd.split(',')

    console.log(prodArr);

})

// app.get('/inventory', (req,res) => {

//     db.serialize(function() {
//         db.all("SELECT rowid, name from products", function(err, results) {
//             if (err != null) {
//                 res.send("Missing from database")
//             }
// 			items.push(results)
//             res.render('inventory', {items:results})
//         });
//       });
// })

app.get('/stocks', (req, res) => {
    items.length = 0;
    stockArr.length = 0;

    db.serialize(function () {
        db.all("SELECT rowid, name, count from stocks", function (err, results) {
            if (err != null) {
                res.send("Missing from database")
            }
            results.forEach(elem => {
                stockArr.push(elem)
            })
        });
        
        db.all("SELECT rowid, name FROM products", (err, res) => {
            if (err) res.send("Missing from database")
            res.forEach(elem => {
                items.push(elem)
            })
            items.forEach(elem => {
                stockArr.forEach(sel => {
                    if(elem.rowid !== sel.rowid){
                        stockArr.push(elem)
                    }
                })
            })
        })
        res.render('inventory', {stockArr})
    });
})

app.put('/stock_update/:data', (req,res) => {
    const data = req.params.data
    const dataArr = data.split(',')
    const newID = dataArr[0]
    const newCnt = dataArr[2]

    stockArr.forEach(s_elem => {    
        if(s_elem.count){
            db.serialize(() => {
                db.all(`UPDATE stocks SET count = ${newCnt} WHERE id = ${newID}`, (err,result) => {
                    if(err) {result.send(`Error aqured ${err}`);}

                    res.redirect('/stocks')

                    console.log('mennyiség: ',s_elem.count);
                })
            })
        }
    })
})

app.post('/stock_newnr:data', (req, res) => {

})

app.listen(PORT, () => console.log(`App is started and listening on port ${PORT}`));
