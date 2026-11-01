const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "books.db");

const initialBooks = [
  { id: 1, title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", price: 450, pages: 352 },
  { id: 2, title: "Clean Code", author: "Robert C. Martin", price: 550, pages: 464 },
  { id: 3, title: "You Don't Know JS Yet", author: "Kyle Simpson", price: 300, pages: 278 },
  { id: 4, title: "Eloquent JavaScript", author: "Marijn Haverbeke", price: 400, pages: 472 },
  { id: 5, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", price: 850, pages: 616 },
  { id: 6, title: "Introduction to Algorithms", author: "Thomas H. Cormen", price: 950, pages: 1312 },
  { id: 7, title: "JavaScript: The Good Parts", author: "Douglas Crockford", price: 250, pages: 176 },
  { id: 8, title: "Node.js Design Patterns", author: "Mario Casciaro", price: 620, pages: 520 },
  { id: 9, title: "Head First Design Patterns", author: "Eric Freeman", price: 580, pages: 694 },
  { id: 10, title: "Refactoring: Improving the Design of Existing Code", author: "Martin Fowler", price: 700, pages: 448 }
];

async function seedDatabase() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log("Connected to SQLite database at:", dbPath);

    // Create table if it doesn't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    // Clear existing records to ensure idempotent clean seed
    await db.run("DELETE FROM book");

    const insertQuery = `
      INSERT INTO book (id, title, author, price, pages)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const book of initialBooks) {
      await db.run(insertQuery, [book.id, book.title, book.author, book.price, book.pages]);
    }

    const countResult = await db.get("SELECT COUNT(*) as count FROM book");
    console.log(`Successfully seeded ${countResult.count} books into SQLite database!`);

    const books = await db.all("SELECT * FROM book");
    console.table(books);

    await db.close();
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
