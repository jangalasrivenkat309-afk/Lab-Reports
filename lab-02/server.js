// ==============================================================================
//  Lab 02 – SQLite Database & CRUD Routes
//  Course   : Backend Development Fundamentals · Year II Term II · Aurora
//  Faculty  : Joel Prashanth D
//  Student  : Srivenkat (Reg No: 252U1R80332, Section: 113)
// ==============================================================================

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Database file path
const dbPath = path.join(__dirname, "books.db");
const PORT = process.env.PORT || 3000;

let db = null;

// ==============================================================================
//  Task 3: Single initializeDBAndServer() async function
//  Opens database connection and starts listening ONLY after connection succeeds
// ==============================================================================
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure the table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📁 Connected to SQLite Database: ${dbPath}`);
      console.log(`======================================================`);
      console.log(`Available Endpoints:`);
      console.log(`  GET    /                 → Welcome & API Documentation`);
      console.log(`  GET    /books/           → Retrieve all books`);
      console.log(`  GET    /books/:bookId/   → Retrieve a single book`);
      console.log(`  POST   /books/           → Add a new book`);
      console.log(`  PUT    /books/:bookId/   → Update an existing book`);
      console.log(`  DELETE /books/:bookId/   → Delete a book`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error(`DB Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

// ==============================================================================
//  Home / Info Route
// ==============================================================================
app.get("/", (req, res) => {
  res.status(200).json({
    lab: "Lab 2: SQLite database and CRUD routes",
    course: "Backend Development Fundamentals",
    faculty: "Joel Prashanth D",
    student: {
      name: "Srivenkat",
      registrationNumber: "252U1R80332",
      section: "113",
    },
    status: "Database Connected & API Online",
    endpoints: {
      "GET /books/": "Retrieve list of all books in library",
      "GET /books/:bookId/": "Retrieve specific book by its ID",
      "POST /books/": "Insert new book (title, author, price, pages)",
      "PUT /books/:bookId/": "Update existing book details by ID",
      "DELETE /books/:bookId/": "Remove book from database by ID",
    },
  });
});

// ==============================================================================
//  ROUTE 1: GET /books/
//  Fetch all books from the database
// ==============================================================================
app.get("/books/", async (req, res) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        id ASC;
    `;
    const booksArray = await db.all(getBooksQuery);
    res.status(200).json(booksArray);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// ==============================================================================
//  ROUTE 2: GET /books/:bookId/
//  Fetch a single book by ID using parameterized query (?)
// ==============================================================================
app.get("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({
        error: "Book Not Found",
        message: `No book found with ID ${bookId}`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(`Error fetching book ${req.params.bookId}:`, error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// ==============================================================================
//  ROUTE 3: POST /books/
//  Insert a new book using parameterized query (?)
// ==============================================================================
app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // Basic payload validation
    if (!title || !author || price === undefined || pages === undefined) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing required fields: title, author, price, and pages are required.",
      });
    }

    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;

    const dbResponse = await db.run(addBookQuery, [title, author, price, pages]);
    const bookId = dbResponse.lastID;

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: bookId,
    });
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// ==============================================================================
//  ROUTE 4: PUT /books/:bookId/
//  Update an existing book by ID using parameterized query (?)
// ==============================================================================
app.put("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Check if book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({
        error: "Book Not Found",
        message: `Cannot update. No book found with ID ${bookId}`,
      });
    }

    // Use existing values as fallback if partial update is provided
    const updatedTitle = title !== undefined ? title : existingBook.title;
    const updatedAuthor = author !== undefined ? author : existingBook.author;
    const updatedPrice = price !== undefined ? price : existingBook.price;
    const updatedPages = pages !== undefined ? pages : existingBook.pages;

    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;

    await db.run(updateBookQuery, [
      updatedTitle,
      updatedAuthor,
      updatedPrice,
      updatedPages,
      bookId,
    ]);

    res.status(200).json({
      message: "Book Details Updated Successfully",
    });
  } catch (error) {
    console.error(`Error updating book ${req.params.bookId}:`, error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// ==============================================================================
//  ROUTE 5: DELETE /books/:bookId/
//  Remove a book by ID using parameterized query (?)
// ==============================================================================
app.delete("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({
        error: "Book Not Found",
        message: `Cannot delete. No book found with ID ${bookId}`,
      });
    }

    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;

    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    console.error(`Error deleting book ${req.params.bookId}:`, error.message);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// ==============================================================================
//  404 Fallback Handler for Unknown Routes
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    validRoutes: [
      "GET /books/",
      "GET /books/:bookId/",
      "POST /books/",
      "PUT /books/:bookId/",
      "DELETE /books/:bookId/",
    ],
  });
});

// Start DB connection and Express Server
initializeDBAndServer();

module.exports = { app, initializeDBAndServer };
