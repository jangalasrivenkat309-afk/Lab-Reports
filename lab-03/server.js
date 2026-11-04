// ==============================================================================
//  Lab 03 – REST API, Query Parameters, Validation & Debugging
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
//  Initialize Database & Start Server
// ==============================================================================
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the books table if it doesn't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📁 Database: ${dbPath}`);
      console.log(`======================================================`);
      console.log(`Available Endpoints:`);
      console.log(`  GET    /                 → Welcome & API docs`);
      console.log(`  GET    /books            → List books (search, sort, filter, paginate)`);
      console.log(`  GET    /books/:bookId    → Get single book`);
      console.log(`  POST   /books            → Add a new book`);
      console.log(`  PUT    /books/:bookId    → Update a book`);
      console.log(`  DELETE /books/:bookId    → Delete a book`);
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
    lab: "Lab 3: REST API, query parameters, validation & debugging",
    course: "Backend Development Fundamentals",
    faculty: "Joel Prashanth D",
    student: {
      name: "Srivenkat",
      registrationNumber: "252U1R80332",
      section: "113",
    },
    status: "API Online",
    endpoints: {
      "GET /books": "List all books with search, sort, filter & pagination",
      "GET /books/:bookId": "Get a single book by ID",
      "POST /books": "Add a new book (title, author, price, pages required)",
      "PUT /books/:bookId": "Update an existing book by ID",
      "DELETE /books/:bookId": "Delete a book by ID",
    },
    queryParameters: {
      search_q: "Partial title match (e.g. ?search_q=javascript)",
      order_by: "Column to sort by: title, author, price, pages (default: id)",
      order: "Sort direction: ASC or DESC (default: ASC)",
      limit: "Max number of results to return (default: 10)",
      offset: "Number of results to skip (default: 0)",
      min_price: "Minimum price filter (e.g. ?min_price=300)",
      max_price: "Maximum price filter (e.g. ?max_price=700)",
    },
  });
});

// ==============================================================================
//  GET /books – List books with search, sort, filter & pagination
//  Query params: search_q, order_by, order, limit, offset, min_price, max_price
// ==============================================================================
app.get("/books", async (req, res) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    // ---- Validate order_by against allowed columns to prevent SQL injection ----
    const allowedColumns = ["id", "title", "author", "price", "pages"];
    const safeOrderBy = allowedColumns.includes(order_by.toLowerCase())
      ? order_by.toLowerCase()
      : "id";

    // ---- Validate sort direction ----
    const safeOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // ---- Validate limit and offset are numbers ----
    const safeLimit = isNaN(Number(limit)) ? 10 : Number(limit);
    const safeOffset = isNaN(Number(offset)) ? 0 : Number(offset);

    // ---- Build the query dynamically ----
    let conditions = [];
    let params = [];

    // Search by title (partial match)
    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      params.push(`%${search_q}%`);
    }

    // Price range filter
    if (min_price !== undefined && max_price !== undefined) {
      // Both provided – use BETWEEN
      if (isNaN(Number(min_price)) || isNaN(Number(max_price))) {
        return res.status(400).json({
          message: "min_price and max_price must be valid numbers",
        });
      }
      conditions.push("price BETWEEN ? AND ?");
      params.push(Number(min_price), Number(max_price));
    } else {
      if (min_price !== undefined) {
        if (isNaN(Number(min_price))) {
          return res.status(400).json({
            message: "min_price must be a valid number",
          });
        }
        conditions.push("price >= ?");
        params.push(Number(min_price));
      }
      if (max_price !== undefined) {
        if (isNaN(Number(max_price))) {
          return res.status(400).json({
            message: "max_price must be a valid number",
          });
        }
        conditions.push("price <= ?");
        params.push(Number(max_price));
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT *
      FROM book
      ${whereClause}
      ORDER BY ${safeOrderBy} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(safeLimit, safeOffset);

    const books = await db.all(query, params);

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ==============================================================================
//  GET /books/:bookId – Get a single book by ID
// ==============================================================================
app.get("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);

    if (!book) {
      return res.status(404).json({
        message: `Book with ID ${bookId} not found`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(`Error fetching book ${req.params.bookId}:`, error.message);
    res.status(500).json({ message: error.message });
  }
});

// ==============================================================================
//  POST /books – Add a new book (with validation)
//  Required fields: title, author, price, pages
//  Validates: title & author must be non-empty strings, price must be numeric
// ==============================================================================
app.post("/books", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // --- Validation ---
    const errors = [];

    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      errors.push("author is required and must be a non-empty string");
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      errors.push("price is required and must be a valid number");
    }

    if (pages === undefined || pages === null || isNaN(Number(pages))) {
      errors.push("pages is required and must be a valid number");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join("; ") });
    }

    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), Number(price), Number(pages)]
    );

    res.status(201).json({
      message: "Book created successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ==============================================================================
//  PUT /books/:bookId – Update an existing book
// ==============================================================================
app.put("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Check if the book exists
    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${bookId} not found`,
      });
    }

    // Validate price if provided
    if (price !== undefined && isNaN(Number(price))) {
      return res.status(400).json({
        message: "price must be a valid number",
      });
    }

    // Validate pages if provided
    if (pages !== undefined && isNaN(Number(pages))) {
      return res.status(400).json({
        message: "pages must be a valid number",
      });
    }

    // Use existing values as fallback for partial updates
    const updatedTitle =
      title !== undefined ? title.trim() : existingBook.title;
    const updatedAuthor =
      author !== undefined ? author.trim() : existingBook.author;
    const updatedPrice =
      price !== undefined ? Number(price) : existingBook.price;
    const updatedPages =
      pages !== undefined ? Number(pages) : existingBook.pages;

    await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [updatedTitle, updatedAuthor, updatedPrice, updatedPages, bookId]
    );

    res.status(200).json({
      message: "Book updated successfully",
    });
  } catch (error) {
    console.error(`Error updating book ${req.params.bookId}:`, error.message);
    res.status(500).json({ message: error.message });
  }
});

// ==============================================================================
//  DELETE /books/:bookId – Delete a book
// ==============================================================================
app.delete("/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${bookId} not found`,
      });
    }

    await db.run("DELETE FROM book WHERE id = ?", [bookId]);

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting book ${req.params.bookId}:`, error.message);
    res.status(500).json({ message: error.message });
  }
});

// ==============================================================================
//  404 Fallback for Unknown Routes
// ==============================================================================
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Start everything
initializeDBAndServer();

module.exports = { app, initializeDBAndServer };
