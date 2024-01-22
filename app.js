const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const mysql = require('mysql');
app.use(
    express.urlencoded({
        extended: true,
    }),
);
const port = 3000
app.use(express.json());

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nohelp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('error', (err) => {
  console.error('Pool Error:', err);
});

app.use((req, res, next) => {
  req.mysqlPool = pool;
  next();
});

app.get('/', (req, res) => { 
 res.render("home")
});
app.post('/books/insertbook', (req, res) =>{

const name = req.body.name;
const email = req.body.email;
const sql = 'INSERT INTO books (??,??) VALUES(?,?)';
const data = ['name', 'email', name, email];
pool.query(sql, data, (err) =>{
  if (err){
    console.log(error);
    return;
  };
    res.redirect('/');
});

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

