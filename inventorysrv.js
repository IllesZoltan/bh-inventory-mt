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
const groups = [];
const stockArr = [];
let currentStock = [];
let nrOfProducts = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({ extended: true }))











// PRODUCTS 
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


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
    let orderby = req.query.orderby
    let order = req.query.order
    let ob = `${orderby} ${order}`



    db.serialize(function () {

        db.all('SELECT id, name, description, category FROM products ORDER BY id', function (err, results) {
            if (err != null) {
                console.log("Missing from product database")
                res.render('home', { items })
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
    const nID = req.body.ids
    const nProd = req.body.names
    const nDesc = req.body.descriptions
    const nCateg = req.body.groups

    db.serialize(() => {
        db.prepare('INSERT INTO products VALUES (?, ?, ?, ?)')
            .run(`${nID}`, `${nProd}`, `${nDesc}`, `${nCateg}`)

        res.redirect('/home')
    });
})


/***************************************
 * 
 * @EDIT_PRODUCTS
 * 
 * Edit products Name and/or Category
 * 
 * -Linked button >> Termékek - @Szerkeszt <<
 * 
 ***************************************/

app.post('/toedit', (req, res) => {
    let id = req.body.pId
    let name = req.body.pNm
    let description = req.body.pDes
    let category = req.body.pCtg

    console.log(id, name, description, category);


    if (id && name && category) {
        db.serialize(() => {
            db.prepare('UPDATE products SET name = ?, description = ?, category = ? WHERE id = ?')
                .run(`${name}`, `${description}`, `${category}`, `${id}`)

            res.redirect('/home')
        })
    } else {
        console.log('Missing data !');
        res.redirect('/home');
    }
})

/***************************************
 * 
 * @DELETE_PRODUCTS
 * 
 * Delete selected product
 * 
 * -Linked button >> Termékek - @Töröl <<
 * 
 ***************************************/

app.post('/del', (req, res) => {
    let id = parseInt(req.body.pId)

    db.serialize(() => {
        db.run(`DELETE FROM products WHERE id == ${id}`)
        res.redirect('/home')
    })
})


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>







//GROUPS
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


/************************************
 * @GROUPS
 * 
 * List of the groups
 * 
 * -Linked button >> @Csoportok <<
 * 
 ************************************/

app.get('/groups', (req, res) => {
    groups.length = 0;
    db.serialize(() => {
        db.all('SELECT id, maingroup FROM groups', (err, gres) => {
            if (err) {
                console.log(`A group error accured ${err}`);
                res.render('groups', {groups});
            }
            gres.forEach(elem => {
                groups.push(elem)
                res.render('groups', {groups});
            })
        })
    })
})



/************************************
 * 
 * @NEW_GROUP
 * 
 * Import new group
 * 
 * -Linked button >> @Új_Csoport <<
 * 
 *************************************/

app.post('/newgroup', (req,res) => {
    let nId = parseInt(req.body.gids)
    let nName = req.body.gnames

    console.log(nId,nName);

    db.serialize(() => {
        db.prepare('INSERT INTO groups VALUES (?, ?)')
            .run(`${nId}`, `${nName}`)

        res.redirect('/groups')
    });
})



/*************************************************
 * 
 * @EDIT_GROUP
 * 
 * Edit product name
 * 
 * -Linked button >> Csoportok - @Szerkeszt <<
 * 
 *************************************************/

app.post('/gredit', (req,res) => {
    let id = req.body.grId
    let name = req.body.gNm

    if (id && name) {
        db.serialize(() => {
            db.prepare('UPDATE groups SET maingroup = ? WHERE id = ?')
                .run(`${name}`, `${id}`)

            res.redirect('/groups')
        })
    } else {
        console.log('Missing data !');
        res.redirect('/groups');
    }
})



/************************************************
 * 
 * @DELETE_GROUP
 * 
 * Delete selected group
 * 
 * -Linked button >> Csoportok - @Töröl <<
 * 
 ************************************************/

app.post('/grdel', (req,res) => {
    let id = req.body.gId

    db.serialize(() => {
        db.run(`DELETE FROM groups WHERE id == ${id}`)
         res.redirect('/groups')
    })
})




app.get('/newstock', (req, res) => {
    db.serialize(function () {
        db.prepare('INSERT INTO stocks VALUES (?, ?, ?)')
            .run(`${id}`, `${namepm}`, `${count}`)
    });
})


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



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

    //Reading STOCK database
    db.serialize(function () {
        db.all("SELECT products.rowid, products.name, products.description, stocks.count FROM products LEFT JOIN stocks ON (stocks.id = products.rowid)", function (err, reslt) {

            if (err) {
                console.log(`A stock error accured ${err}`);
                response.render('inventory', { stockArr })
            }
            else {
                //console.log('Stock !!!', reslt);

                reslt.forEach(stElem => {
                    //console.log('stock status: ', stElem);
                    if (stElem) {
                        stockArr.push(stElem)
                    }
                })
                //console.log('initial stockArr: ', stockArr);
            }
            response.render('inventory', { stockArr })
        });

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
    let cnt = req.body.nCount
    const newID = currentStock[0]


    //if (currentStock[2] !== '') {

    console.log('current stock[1]: ', cnt, currentStock[1]);

    db.serialize(() => {
        //db.all(`INSERT OR REPLACE INTO stocks VALUES (${newID},${currentStock[1]},${cnt})`)
        db.all(`UPDATE stocks SET count = ${cnt} WHERE id = ${newID}`, (err, result) => {
            if (err) { console.log(`Error occured ${err}`); }
            res.redirect('/stocks')
        })
    })

})







app.post('/stock_newnr:data', (req, res) => {

})

app.listen(PORT, () => console.log(`App is started and listening on port ${PORT}`));













   //} else {
    //     db.serialize(() => {
    //         db.prepare(`INSERT INTO stocks VALUES (?,?,?)`, (err, response) => {
    //             if (err) console.log('An error occured', err);
    //         })
    //         res.redirect('/stocks')
    //     })
    // }


    //1. select * from products -> foreach -> select count(*) from inventory where id = $product->id
    //result.push(product->id, product->name, inventory->count())

    // select 
    //     products.id,
    //     products.name,
    //     inventory.count
    // from
    //     products 
    //     left join inventory on (inventory.id = products.id)



        //Reading PRODUCTS database
        // db.all("SELECT rowid, name FROM products", (err, res) => {
        //     if (err) {
        //         console.log("Missing from P database");

        //     } else {
        //         res.forEach(elem => {
        //             if (elem) {
        //                 items.push(elem)
        //                 if (stockArr.length === 0) { ok++ }
        //                 let containsStock = false;
        //                 stockArr.forEach(stEl => {

        //                     //Attaching new products to the stock collection
        //                     if (elem.name === stEl.name) { containsStock = true; }
        //                 })
        //                 if(containsStock) {ok = 1;}
        //             } else { ok = -1 }
        //             if (ok > 0) {
        //                 ok = 0
        //                 stockArr.push(elem)
        //                 console.log('add to stock elem: ', elem);
        //                 //db.prepare('INSERT INTO stocks VALUES (?,?,?)')
        //                 //.run(`${elem.rowid}`, `${elem.name}`, "")
        //             }
        //             if (ok < 0) {
        //                 db.run('DELETE FROM stocks')
        //             }
        //         })
        //         if (stockArr.length > 0) {
        //             console.log('stockArr: ', stockArr);
        //             response.render('inventory', { stockArr })
        //         } else {
        //             response.render('inventory', { stockArr })
        //         }
        //     }
        // })