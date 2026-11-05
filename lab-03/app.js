// ==============================================================================
//  Lab 03 - REST API, Query Parameters, Validation & Error Handling
//  Course   : Backend Development Fundamentals (Year II Term II) · Aurora
//  Faculty  : Joel Prashanth D
//  Student  : JANGALA SRIVENKAT
//  Reg No   : 252U1R8032
//  Section  : CSE(QE)-2A-113
// ==============================================================================

import express from "express";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Database configuration
const databaseFile = process.env.DB_PATH || path.join(__dirname, "books.db");
const SERVER_PORT = Number(process.env.PORT) || 3000;

let dbInstance = null;

// Allow-list for secure sorting to prevent SQL injection vulnerabilities
const VALID_SORT_FIELDS = new Set(["id", "title", "author", "price", "pages"]);

// Standardized JSON error response helper
const formatErrorResponse = (res, statusCode, errorMessage) => {
  return res.status(statusCode).json({ message: errorMessage });
};

// Numeric query parameter validation helpers
function validateNonNegativeNumber(inputValue, propertyLabel) {
  const parsedVal = Number(inputValue);
  if (inputValue === "" || !Number.isFinite(parsedVal) || parsedVal < 0) {
    return { isValid: false, message: `${propertyLabel} must be a valid non-negative number` };
  }
  return { isValid: true, value: parsedVal };
}

function validatePositiveInteger(inputValue, propertyLabel) {
  const parsedInt = Number(inputValue);
  if (!Number.isInteger(parsedInt) || parsedInt <= 0) {
    return { isValid: false, message: `${propertyLabel} must be a positive integer` };
  }
  return { isValid: true, value: parsedInt };
}

// ------------------------------------------------------------------------------
// Root / Health-Check Endpoint
// ------------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Lab 3 RESTful Books API is live and operational",
    developer: {
      studentName: "JANGALA SRIVENKAT",
      registrationNo: "252U1R8032",
      section: "113"
    },
    availableRoutes: {
      listBooks: "GET /books (supports search_q, order_by, order, limit, offset, min_price, max_price)",
      fetchBookById: "GET /books/:bookId",
      insertBook: "POST /books",
      modifyBook: "PUT /books/:bookId",
      removeBook: "DELETE /books/:bookId"
    }
  });
});

// ------------------------------------------------------------------------------
// GET /books - Retrieve books with search, sort, pagination & price filtering
// ------------------------------------------------------------------------------
app.get("/books", async (req, res) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = req.query;

    const sanitizedSortField = String(order_by).trim().toLowerCase();
    const sanitizedDirection = String(order).trim().toUpperCase();

    // Verify sort column against whitelist
    if (!VALID_SORT_FIELDS.has(sanitizedSortField)) {
      return formatErrorResponse(
        res,
        400,
        "Invalid order_by parameter. Allowed values: id, title, author, price, pages"
      );
    }

    // Verify sort direction
    if (sanitizedDirection !== "ASC" && sanitizedDirection !== "DESC") {
      return formatErrorResponse(
        res,
        400,
        "Invalid order parameter. Allowed values: ASC, DESC"
      );
    }

    // Validate limit and offset
    const validatedLimit = validatePositiveInteger(limit, "limit");
    if (!validatedLimit.isValid || validatedLimit.value > 100) {
      return formatErrorResponse(res, 400, "limit must be an integer between 1 and 100");
    }

    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return formatErrorResponse(res, 400, "offset must be a non-negative integer");
    }

    // Parse and validate price filters
    let lowerBoundPrice;
    let upperBoundPrice;

    if (min_price !== undefined) {
      const parsedMin = validateNonNegativeNumber(min_price, "min_price");
      if (!parsedMin.isValid) return formatErrorResponse(res, 400, parsedMin.message);
      lowerBoundPrice = parsedMin.value;
    }

    if (max_price !== undefined) {
      const parsedMax = validateNonNegativeNumber(max_price, "max_price");
      if (!parsedMax.isValid) return formatErrorResponse(res, 400, parsedMax.message);
      upperBoundPrice = parsedMax.value;
    }

    if (lowerBoundPrice !== undefined && upperBoundPrice !== undefined && lowerBoundPrice > upperBoundPrice) {
      return formatErrorResponse(res, 400, "min_price cannot exceed max_price");
    }

    // Dynamic SQL builder with parameterized queries
    const filterClauses = [];
    const queryParameters = [];

    const searchQueryTrimmed = String(search_q).trim();
    if (searchQueryTrimmed !== "") {
      filterClauses.push("title LIKE ?");
      queryParameters.push(`%${searchQueryTrimmed}%`);
    }

    if (lowerBoundPrice !== undefined && upperBoundPrice !== undefined) {
      filterClauses.push("price BETWEEN ? AND ?");
      queryParameters.push(lowerBoundPrice, upperBoundPrice);
    } else {
      if (lowerBoundPrice !== undefined) {
        filterClauses.push("price >= ?");
        queryParameters.push(lowerBoundPrice);
      }
      if (upperBoundPrice !== undefined) {
        filterClauses.push("price <= ?");
        queryParameters.push(upperBoundPrice);
      }
    }

    const whereString = filterClauses.length > 0 ? `WHERE ${filterClauses.join(" AND ")}` : "";
    const sqlQuery = `
      SELECT id, title, author, price, pages
      FROM book
      ${whereString}
      ORDER BY ${sanitizedSortField} ${sanitizedDirection}
      LIMIT ? OFFSET ?
    `;

    queryParameters.push(validatedLimit.value, parsedOffset);

    const bookList = await dbInstance.all(sqlQuery, queryParameters);
    return res.status(200).json(bookList);
  } catch (err) {
    console.error("GET /books runtime error:", err.message);
    return formatErrorResponse(res, 500, "Internal server error retrieving books");
  }
});

// ------------------------------------------------------------------------------
// GET /books/:bookId - Fetch a single book record by ID
// ------------------------------------------------------------------------------
app.get("/books/:bookId", async (req, res) => {
  try {
    const idCheck = validatePositiveInteger(req.params.bookId, "bookId");
    if (!idCheck.isValid) {
      return formatErrorResponse(res, 400, idCheck.message);
    }

    const foundBook = await dbInstance.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [idCheck.value]
    );

    if (!foundBook) {
      return formatErrorResponse(res, 404, `Book with ID ${idCheck.value} not found`);
    }

    return res.status(200).json(foundBook);
  } catch (err) {
    console.error("GET /books/:bookId error:", err.message);
    return formatErrorResponse(res, 500, "Internal server error fetching book");
  }
});

// ------------------------------------------------------------------------------
// POST /books - Insert a new book record with rigorous payload validation
// ------------------------------------------------------------------------------
app.post("/books", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body ?? {};

    const validationFaults = [];

    if (!title || typeof title !== "string" || title.trim() === "") {
      validationFaults.push("title is required and must be a non-empty string");
    }
    if (!author || typeof author !== "string" || author.trim() === "") {
      validationFaults.push("author is required and must be a non-empty string");
    }
    if (price === undefined || price === null || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      validationFaults.push("price is required and must be a valid non-negative number");
    }
    if (pages === undefined || pages === null || !Number.isInteger(pages) || pages <= 0) {
      validationFaults.push("pages is required and must be a positive integer");
    }

    if (validationFaults.length > 0) {
      return formatErrorResponse(res, 400, validationFaults.join("; "));
    }

    const executionResult = await dbInstance.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), price, pages]
    );

    const insertedBook = await dbInstance.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [executionResult.lastID]
    );

    return res.status(201).json({
      message: "Book created successfully",
      bookId: executionResult.lastID,
      data: insertedBook
    });
  } catch (err) {
    console.error("POST /books error:", err.message);
    return formatErrorResponse(res, 500, "Failed to create new book");
  }
});

// ------------------------------------------------------------------------------
// PUT /books/:bookId - Update an existing book record
// ------------------------------------------------------------------------------
app.put("/books/:bookId", async (req, res) => {
  try {
    const idCheck = validatePositiveInteger(req.params.bookId, "bookId");
    if (!idCheck.isValid) {
      return formatErrorResponse(res, 400, idCheck.message);
    }

    const existingRecord = await dbInstance.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [idCheck.value]
    );

    if (!existingRecord) {
      return formatErrorResponse(res, 404, `Book with ID ${idCheck.value} not found`);
    }

    const { title, author, price, pages } = req.body ?? {};

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return formatErrorResponse(res, 400, "title must be a non-empty string");
    }
    if (author !== undefined && (typeof author !== "string" || author.trim() === "")) {
      return formatErrorResponse(res, 400, "author must be a non-empty string");
    }
    if (price !== undefined && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) {
      return formatErrorResponse(res, 400, "price must be a valid non-negative number");
    }
    if (pages !== undefined && (!Number.isInteger(pages) || pages <= 0)) {
      return formatErrorResponse(res, 400, "pages must be a positive integer");
    }

    const newTitle = title !== undefined ? title.trim() : existingRecord.title;
    const newAuthor = author !== undefined ? author.trim() : existingRecord.author;
    const newPrice = price !== undefined ? price : existingRecord.price;
    const newPages = pages !== undefined ? pages : existingRecord.pages;

    await dbInstance.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [newTitle, newAuthor, newPrice, newPages, idCheck.value]
    );

    const updatedRecord = await dbInstance.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [idCheck.value]
    );

    return res.status(200).json({
      message: "Book updated successfully",
      data: updatedRecord
    });
  } catch (err) {
    console.error("PUT /books/:bookId error:", err.message);
    return formatErrorResponse(res, 500, "Failed to update book details");
  }
});

// ------------------------------------------------------------------------------
// DELETE /books/:bookId - Remove an existing book record
// ------------------------------------------------------------------------------
app.delete("/books/:bookId", async (req, res) => {
  try {
    const idCheck = validatePositiveInteger(req.params.bookId, "bookId");
    if (!idCheck.isValid) {
      return formatErrorResponse(res, 400, idCheck.message);
    }

    const existingRecord = await dbInstance.get(
      "SELECT id FROM book WHERE id = ?",
      [idCheck.value]
    );

    if (!existingRecord) {
      return formatErrorResponse(res, 404, `Book with ID ${idCheck.value} not found`);
    }

    await dbInstance.run("DELETE FROM book WHERE id = ?", [idCheck.value]);

    return res.status(200).json({
      message: "Book deleted successfully"
    });
  } catch (err) {
    console.error("DELETE /books/:bookId error:", err.message);
    return formatErrorResponse(res, 500, "Failed to delete book record");
  }
});

// ------------------------------------------------------------------------------
// Global 404 Handler for Unrecognized Endpoints
// ------------------------------------------------------------------------------
app.use((req, res) => {
  return formatErrorResponse(res, 404, `Endpoint ${req.method} ${req.originalUrl} not found`);
});

// ------------------------------------------------------------------------------
// Global Error Handler (e.g. Malformed JSON payload)
// ------------------------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return formatErrorResponse(res, 400, "Invalid JSON payload in request body");
  }
  console.error("Unhandled exception:", err);
  return formatErrorResponse(res, 500, "Internal server error");
});

// ------------------------------------------------------------------------------
// Database Connection & Server Initialization
// ------------------------------------------------------------------------------
export async function initializeDatabaseAndServer() {
  try {
    dbInstance = await open({
      filename: databaseFile,
      driver: sqlite3.Database
    });

    // Create table schema
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    // Pre-populate with sample catalog if empty
    const rowCountRecord = await dbInstance.get("SELECT COUNT(*) AS total FROM book");
    if (rowCountRecord.total === 0) {
      const initialCatalog = [
        ["The Pragmatic Programmer", "Andrew Hunt, David Thomas", 450, 352],
        ["Clean Code", "Robert C. Martin", 550, 464],
        ["You Don't Know JS Yet", "Kyle Simpson", 320, 280],
        ["Designing Data-Intensive Applications", "Martin Kleppmann", 850, 616],
        ["Atomic Habits", "James Clear", 380, 320],
        ["Introduction to Algorithms", "Thomas H. Cormen", 950, 1312],
        ["JavaScript: The Good Parts", "Douglas Crockford", 260, 176],
        ["Node.js Design Patterns", "Mario Casciaro", 620, 520],
        ["Deep Work", "Cal Newport", 400, 304],
        ["Refactoring", "Martin Fowler", 700, 448]
      ];

      const insertStmt = await dbInstance.prepare(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)"
      );
      try {
        for (const bookItem of initialCatalog) {
          await insertStmt.run(bookItem);
        }
      } finally {
        await insertStmt.finalize();
      }
      console.log("Database initialized and catalog seeded with 10 books.");
    }

    app.listen(SERVER_PORT, "0.0.0.0", () => {
      console.log(`\n======================================================`);
      console.log(`🚀 REST API Server running at http://localhost:${SERVER_PORT}`);
      console.log(`📁 Connected to SQLite Database: ${databaseFile}`);
      console.log(`👤 Student: JANGALA SRIVENKAT (252U1R8032, Section 113)`);
      console.log(`======================================================\n`);
    });
  } catch (initializationError) {
    console.error("FATAL: Failed to initialize database or server:", initializationError.message);
    process.exit(1);
  }
}

// Automatically start server on direct execution
initializeDatabaseAndServer();

export default app;
