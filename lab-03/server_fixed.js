// ==============================================================================
//  server_fixed.js – DEBUGGING EXERCISE SOLUTION (Lab 03)
//  All 4 bugs from server_broken.js have been fixed here.
//
//  Fix 1: Removed duplicate app.listen()            → no more EADDRINUSE
//  Fix 2: Changed "sqllite" to "sqlite"             → correct module path
//  Fix 3: Changed "books" to "book"                 → correct table name
//  Fix 4: Added "await" before db.get()             → gets actual data
// ==============================================================================

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");

// FIX 2: Correct import path → "sqlite" (not "sqllite")
const { open } = require("sqlite");

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

    // FIX 1: Only ONE app.listen() call
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

// FIX 3: Correct table name → "book" (not "books")
app.get("/books", async (req, res) => {
  try {
    const booksArray = await db.all("SELECT * FROM book ORDER BY id ASC");
    res.status(200).json(booksArray);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FIX 4: Added "await" before db.get()
app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

initializeDBAndServer();
