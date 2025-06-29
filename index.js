import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import env from "dotenv";


const app = express();
const port = 4000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/",async(req,res)=>{
    try {
    const result = await db.query("SELECT * FROM readBooks ORDER BY read_date DESC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
});

app.get("/latest",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by read_date DESC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/oldest",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by read_date ASC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/high",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by rating DESC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/low",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by rating ASC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/ascending",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by title ASC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/descending",async(req,res)=>{
  try {
    const result = await db.query("select * from readBooks order by title DESC");
    const books = result.rows;
    res.render("index.ejs", { books: books });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
})

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.get("/edit/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await db.query("SELECT * FROM readBooks WHERE id = $1", [bookId]);
    const book = result.rows[0];
    res.render("edit.ejs", { book });
  } catch (err) {
    console.error(err);
    res.send("Failed to fetch book for editing.");
  }
});

app.get("/book/:id",async(req,res)=>{
  const bookId = req.params.id;

  try {
    const result = await db.query("SELECT * FROM readBooks WHERE id = $1", [bookId]);
    const book = result.rows[0];
    const response1=await axios.get("https://openlibrary.org/isbn/"+book.isbn+".json");
    //console.log(response1.data.works[0].key);
    const work=response1.data.works[0].key;
    const response2=await axios.get("https://openlibrary.org"+work+".json");
    // console.log(response2.data.authors[0].author.key);
    const authorKey=response2.data.authors[0].author.key;
    const authorId = authorKey.split("/").pop();
    // console.log(authorId);
    const authorImageUrl = "https://covers.openlibrary.org/a/olid/"+authorId+"-M.jpg";
    res.render("book.ejs", { book,authorImageUrl });
  } catch (err) {
    console.error(err);
    res.send("Failed to fetch book for editing.");
  }
})

// app.get("/author/:id",async(req,res)=>{
//   try {
//     const result = await db.query("SELECT * FROM readBooks WHERE id = $1", [bookId]);
//     const book = result.rows[0];
//     // console.log(book.isbn);
//     const response1=await axios.get("https://openlibrary.org/isbn/"+book.isbn+".json");
//     //console.log(response1.data.works[0].key);
//     const work=response1.data.works[0].key;
//     const response2=await axios.get("https://openlibrary.org"+work+".json");
//     // console.log(response2.data.authors[0].author.key);
//     const authorKey=response2.data.authors[0].author.key;
//     const authorId = authorKey.split("/").pop();
//     // console.log(authorId);
//     const response3=await axios.get("https://openlibrary.org"+authorKey+".json")
//     console.log(response3.data.bio.value);
//     // const authorDescription=response3.data.bio.value;
//     const authorImage=await axios.get("https://covers.openlibrary.org/a/olid/"+authorId+"-M.jpg");
//     res.render("author.ejs", { book });
//   } catch (err) {
//     console.error(err);
//     res.send("Failed to fetch book for editing.");
//   }
// })

app.get("/about",(req,res)=>{
  res.render("about.ejs");
})



app.post("/delete/:id",async(req,res)=>{
  const bookId = req.params.id;

  try {
    const result = await db.query("DELETE from readBooks where id=$1", [bookId]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Failed to fetch book for editing.");
  }
})

app.post("/add", async (req, res) => {
  const { title, author, rating, notes, read_date, isbn } = req.body;

  await db.query(
    "INSERT INTO readBooks (title, author, rating, notes, read_date, isbn) VALUES ($1, $2, $3, $4, $5, $6)",
    [title, author, rating, notes, read_date, isbn]
  );
  res.redirect("/");
});

app.post("/edit/:id", async (req, res) => {
  const bookId = req.params.id;
  const { title, author, rating, notes, read_date, isbn } = req.body;

  try {
    await db.query(
      "UPDATE readBooks SET title=$1, author=$2, rating=$3, notes=$4, read_date=$5, isbn=$6 WHERE id=$7",
      [title, author, rating, notes, read_date, isbn, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Failed to update the book.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
