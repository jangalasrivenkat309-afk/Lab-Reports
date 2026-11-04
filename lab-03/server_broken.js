// ==============================================================================
//  server_broken.js – DEBUGGING EXERCISE (Lab 03)
//  This file has 4 intentional bugs. Fix them all to get the server running.
//
//  Bug 1: Port conflict       → EADDRINUSE (two listen calls on same port)
//  Bug 2: Wrong import path   → "Cannot find module './sqllite'" (typo)
//  Bug 3: Table-name typo     → "no such table: books" (should be "book")
//  Bug 4: Missing await       → db.all() returns a Promise, not data
// ==============================================================================

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");

// BUG 2: Wrong import path – "sqllite" instead of "sqlite"
const { open } = require("sqllite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
const PORT = 3000;

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // BUG 1: Port conflict – server is started TWICE on the same port
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    app.listen(PORT, () => {
      console.log(`Second listener on same port – this will crash!`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// BUG 3: Table-name typo – uses "books" instead of "book"
app.get("/books", async (req, res) => {
  try {
    const booksArray = await db.all("SELECT * FROM books ORDER BY id ASC");
    res.status(200).json(booksArray);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// BUG 4: Missing await – db.get() returns a Promise, not the actual row
app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = db.get("SELECT * FROM book WHERE id = ?", [bookId]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

initializeDBAndServer();
