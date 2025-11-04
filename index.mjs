import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "s3lkt7lynu0uthj8.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "yil571kkht6sqhny",
    password: "rr3befy9nqxees47",
    database: "uq6us0wk88su4qpi",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', async(req, res) => {
   let authorsSql = `SELECT authorId, firstName, lastName FROM authors`
   const [authorRows] = await pool.query(authorsSql)
//    console.log(authorRows)
   
   let categorySql = `SELECT DISTINCT category FROM quotes`
   const [categoryRows] = await pool.query(categorySql)
//    console.log(categoryRows)

   res.render('home.ejs', {authorRows, categoryRows})
});

app.get('/searchByLikes', async(req, res) => {
    let sql = `SELECT authorId, likes, firstName, lastName, quote 
                FROM authors NATURAL JOIN quotes
                WHERE likes > ${req.query.bottomLikes} AND likes < ${req.query.topLikes}
                ORDER BY likes DESC;`
    // let min = req.query.bottomLikes
    // let max = req.query.topLikes
    // console.log(min, max)
    const [rows] = await pool.query(sql)
    
    res.render('like-results.ejs', {rows})
})

app.get('/searchByCategory', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName, quote 
                FROM authors
                NATURAL JOIN quotes 
                WHERE category LIKE '${req.query.categoryName}'`
    const [rows] = await pool.query(sql)
    res.render('results.ejs', {rows})
})

app.get('/searchByAuthor', async(req, res) => {
    let sql = `SELECT authorId, firstName, lastName, quote 
                FROM authors
                NATURAL JOIN quotes 
                WHERE authorId LIKE ${req.query.authorId}`
    // let author = req.query.authorId
    // console.log(author)
    // let sqlParams = [`%${author}%`]
    const [rows] = await pool.query(sql)

    res.render('results.ejs', {rows})
})

app.get('/searchByKeyword', async(req, res) => {
    
    let keyword = req.query.keyword
    // console.log(keyword)

    let sql = `SELECT authorId, firstName, lastName, quote 
                FROM authors
                NATURAL JOIN quotes 
                WHERE quote LIKE ?`
    let sqlParams = [`%${keyword}%`]
    const [rows] = await pool.query(sql, sqlParams)
    // console.log(rows)

    res.render('results.ejs', {rows})
})

// Local API to get specific Author information.
app.get('/api/authors/:authorId', async(req, res) => {
   let authorId = req.params.authorId
   let sql = `SELECT * FROM authors WHERE authorId = ?`
    const [rows] = await pool.query(sql, [authorId])
    // console.log(rows)
    res.send(rows)
});

// app.get("/dbTest", async(req, res) => {
//    try {
//         const [rows] = await pool.query("SELECT CURDATE()");
//         res.send(rows);
//     } catch (err) {
//         console.error("Database error:", err);
//         res.status(500).send("Database error!");
//     }
// });//dbTest

app.listen(3000, ()=>{
    

    console.log("Express server running")
})