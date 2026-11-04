# Lab 03 – REST API, Query Parameters, Validation & Debugging

**Course:** Backend Development Fundamentals · Year II Term II · Aurora  
**Faculty:** Joel Prashanth D  
**Student:** Srivenkat (Reg No: 252U1R80332, Section: 113)

---

## Objective

Turn the Lab 2 CRUD routes into a clean REST API with search, sorting, price-range filtering, input validation, correct HTTP status codes, and practise debugging common Node.js/Express errors.

---

## Setup

```bash
cd lab-03
pnpm install          # install dependencies
node init_db.js       # seed the database with 10 sample books
node server.js        # start the server on port 3000
```

---

## API Endpoints

| Method | Endpoint         | Description                          | Status Codes |
|--------|------------------|--------------------------------------|--------------|
| GET    | `/`              | Welcome & API documentation          | 200          |
| GET    | `/books`         | List all books (with query params)   | 200          |
| GET    | `/books/:bookId` | Get a single book by ID              | 200, 404     |
| POST   | `/books`         | Add a new book                       | 201, 400     |
| PUT    | `/books/:bookId` | Update an existing book              | 200, 400, 404|
| DELETE | `/books/:bookId` | Delete a book                        | 200, 404     |

---

## Query Parameters for GET /books

| Parameter  | Type   | Default | Description                                |
|------------|--------|---------|--------------------------------------------|
| search_q   | string | ""      | Partial title match (uses SQL LIKE)        |
| order_by   | string | "id"    | Sort column: id, title, author, price, pages |
| order      | string | "ASC"   | Sort direction: ASC or DESC                |
| limit      | number | 10      | Maximum results to return                  |
| offset     | number | 0       | Number of results to skip (pagination)     |
| min_price  | number | —       | Minimum price filter                       |
| max_price  | number | —       | Maximum price filter                       |

### Example Queries

```
GET /books?search_q=javascript
GET /books?order_by=price&order=DESC
GET /books?min_price=400&max_price=700
GET /books?limit=5&offset=5
GET /books?search_q=design&order_by=pages&order=ASC&min_price=300
```

---

## Validation Rules

- **POST /books** requires `title`, `author`, `price`, and `pages`
- `title` and `author` must be non-empty strings
- `price` must be a valid number (rejects strings like "expensive")
- Missing or invalid fields return **400** with a clear JSON error message
- Non-existent book IDs return **404** on GET, PUT, and DELETE

---

## Debugging Exercise

The file `server_broken.js` contains **4 intentional bugs**:

| # | Bug                  | Error You'll See                           | Fix                                    |
|---|----------------------|--------------------------------------------|-----------------------------------------|
| 1 | Port conflict        | `EADDRINUSE: address already in use ::3000`| Remove the duplicate `app.listen()`    |
| 2 | Wrong import path    | `Cannot find module 'sqllite'`             | Change `"sqllite"` → `"sqlite"`       |
| 3 | Table-name typo      | `SQLITE_ERROR: no such table: books`       | Change `"books"` → `"book"` in query  |
| 4 | Missing `await`      | GET /:id returns a Promise object, not data| Add `await` before `db.get(...)`       |

The corrected version is in `server_fixed.js` for reference.

---

## Running Tests

Start the server in one terminal, then run the test script in another:

```bash
# Terminal 1
node server.js

# Terminal 2
node test_routes.js
```

The test script covers **25 test cases** across success and failure scenarios.

---

## Postman Test List

| #  | Test Case                          | Method | URL                                         | Expected Status |
|----|------------------------------------|--------|---------------------------------------------|-----------------|
| 1  | Home route                         | GET    | `localhost:3000/`                            | 200             |
| 2  | Get all books (default)            | GET    | `localhost:3000/books`                       | 200             |
| 3  | Search by title                    | GET    | `localhost:3000/books?search_q=javascript`   | 200             |
| 4  | Sort by price DESC                 | GET    | `localhost:3000/books?order_by=price&order=DESC` | 200         |
| 5  | Pagination                         | GET    | `localhost:3000/books?limit=3&offset=2`      | 200             |
| 6  | Price range filter                 | GET    | `localhost:3000/books?min_price=400&max_price=700` | 200       |
| 7  | Get single book                    | GET    | `localhost:3000/books/1`                     | 200             |
| 8  | Get non-existent book              | GET    | `localhost:3000/books/9999`                  | 404             |
| 9  | Create a new book                  | POST   | `localhost:3000/books`                       | 201             |
| 10 | Create book – missing title        | POST   | `localhost:3000/books`                       | 400             |
| 11 | Create book – missing author       | POST   | `localhost:3000/books`                       | 400             |
| 12 | Create book – non-numeric price    | POST   | `localhost:3000/books`                       | 400             |
| 13 | Create book – empty body           | POST   | `localhost:3000/books`                       | 400             |
| 14 | Update a book                      | PUT    | `localhost:3000/books/1`                     | 200             |
| 15 | Update non-existent book           | PUT    | `localhost:3000/books/9999`                  | 404             |
| 16 | Delete a book                      | DELETE | `localhost:3000/books/1`                     | 200             |
| 17 | Delete non-existent book           | DELETE | `localhost:3000/books/9999`                  | 404             |
| 18 | Unknown route                      | GET    | `localhost:3000/unknown`                     | 404             |

---

## Viva Questions & Answers

**Q1: Query parameter vs path parameter?**  
Path parameters identify a specific resource (`/books/5` → book with ID 5). Query parameters filter, sort, or modify the response (`/books?search_q=js&limit=5`). Path params are required for the route to match; query params are optional.

**Q2: What does stateless mean?**  
Each HTTP request is independent — the server doesn't remember anything about previous requests. Every request must carry all the information the server needs (authentication token, query parameters, etc.). This makes APIs scalable because any server instance can handle any request.

**Q3: Which status code for bad input vs a missing record?**  
**400 Bad Request** for invalid or missing input (e.g., missing title, non-numeric price). **404 Not Found** when the requested resource doesn't exist (e.g., book ID 9999).

---

## File Structure

```
lab-03/
├── server.js            ← Main API server (complete solution)
├── server_broken.js     ← Debugging exercise (4 bugs)
├── server_fixed.js      ← Debugging exercise (all bugs fixed)
├── init_db.js           ← Database seeder script
├── test_routes.js       ← Automated test script (25 tests)
├── books.db             ← SQLite database (created by init_db.js)
├── package.json         ← Project metadata & dependencies
├── pnpm-lock.yaml       ← Lock file
└── screenshots/         ← Postman screenshots (testing evidence)
```
