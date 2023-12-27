const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs());
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
  res.render('index', { title: 'Express App' });
});

app.post('/submit', (req, res, next) => {
  const { name, email } = req.body;
  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  const values = [name, email];

  req.mysqlPool.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }

    console.log('Data stored');
    res.redirect('/');
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error!');
});

process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing MySQL Pool:', err);
      process.exit(1);
    }
    console.log('MySQL Pool closed');
    process.exit();
  });
});

app.get('/books', (req, res) => {
  const sql = "SELECT * FROM books"

  pool.query(sql, (err, data) => {
      if(err){
          console.log(err);
          return;
      };

      const books = data;
      console.log(books);

      res.render('books', { books })
  });
});

app.get('/books/:id', (req, res) => {
  const id = req.params.id

  const sql = `SELECT * FROM books WHERE ?? = ?`
  const data = ['id', id];

  pool.query(sql, data, (err, data) => {
    if (err) {
      console.log(err)
    }

    const book = data[0]

    console.log(data[0])

    res.render('book', { book })
  });
});

app.get('/books/edit/:id',(req, res) => {
  const id = req.params.id

  const sql = `SELECT * FROM books WHERE ?? = ?`
  const data = ['id', id];

  pool.query(sql, data, (err, data) => {
    if (err) {
      console.log(err)
    }

    const book = data[0]

    res.render('editbook', { book })
  });
});

app.post('/books/updatebook', (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const pageqty = req.body.pageqty;

  const sql = `UPDATE books SET ?? = ?, ?? = ? WHERE ?? = ?`
  const data = ['title', title, 'pageqty', pageqty, 'id', id];

  pool.query(sql, data, (err) => {
      if(err){
          console.log(err)
          return
      }

      res.redirect('/books')
  });
});

app.post('/books/remove/:id', (req, res) => {
  const id = req.params.id

  const sql = `DELETE FROM books WHERE ? = ??`
  const data = ['id', id];

  pool.query(sql, data, (err) => {
      if(err){
          console.log(err)
          return;
      }

      res.redirect('/books');
  })
});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
