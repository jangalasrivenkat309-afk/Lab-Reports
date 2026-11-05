# Lab 3: REST API, Query Parameters, Validation and Debugging

**Project:** Books Catalog REST API  
**Developer:** JANGALA SRIVENKAT (Reg No: 252U1R8032, Section: 113)  
**Course:** Backend Development Fundamentals (Year II Term II) · Aurora  
**Faculty:** Joel Prashanth D  
**Stack:** Node.js (ES Modules), Express.js, SQLite (`sqlite` + `sqlite3`)

---

## Architectural Evolution from Lab 2

This laboratory enhances the Lab 2 foundational CRUD routes into a standardized, production-grade REST API while preserving database backward compatibility with table `book` (`id, title, author, price, pages`). Key architectural additions include:
- Strict resource noun routing (`/books`, `/books/:bookId`).
- URL query parameter parsing with parameter sanitation and whitelisting.
- Pre-persistence validation schemas returning RFC-compliant `400 Bad Request` messages.
- Normalized JSON response envelopes with predictable success and error structures.

---

## Local Execution Instructions

1. Navigate to the `lab-03` directory:
   ```bash
   cd lab-03
   ```
2. Install necessary project packages:
   ```bash
   npm install
   ```
3. Launch the API server:
   ```bash
   npm start
   ```
4. Access the server locally at `http://localhost:3000/`.

---

## Endpoint Reference

| Method | Route | Description |
|:---|:---|:---|
| `GET` | `/` | API health check and endpoint documentation index |
| `GET` | `/books` | Query, filter, paginate, and sort book catalog |
| `GET` | `/books/:bookId` | Retrieve single book by primary key |
| `POST` | `/books` | Validate and insert a new book record |
| `PUT` | `/books/:bookId` | Update fields on an existing book |
| `DELETE` | `/books/:bookId` | Delete a book by ID |

---

## Query Parameters (`GET /books`)

- `search_q`: Partial title text search (SQL `LIKE %term%`)
- `order_by`: Allowed column to sort on (`id, title, author, price, pages`; default: `id`)
- `order`: Direction of ordering (`ASC` or `DESC`; default: `ASC`)
- `limit`: Maximum count of books to return (1 to 100; default: `10`)
- `offset`: Count of rows to bypass for pagination (default: `0`)
- `min_price`: Lower price filter threshold
- `max_price`: Upper price filter threshold

---

## Debugging Summary

- **EADDRINUSE:** Cleaned up duplicate network socket listeners.
- **Module Resolution:** Rectified typo in module import paths.
- **Database Schema:** Realigned pluralized table references with schema `book`.
- **Asynchronous Execution:** Added missing `await` statements to database promises.

---

## Repository

- **GitHub:** [https://github.com/jangalasrivenkat309-afk/Lab-Reports](https://github.com/jangalasrivenkat309-afk/Lab-Reports)
