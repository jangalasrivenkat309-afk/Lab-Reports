// ==============================================================================
//  test_routes.js – Automated Test Script for Lab 03 API
//  Covers all success and failure cases using native http module
//  Course   : Backend Development Fundamentals · Year II Term II · Aurora
//  Student  : Srivenkat (Reg No: 252U1R80332, Section: 113)
// ==============================================================================

const http = require("http");

const BASE_URL = "http://localhost:3000";
let passed = 0;
let failed = 0;

// Helper: make an HTTP request and return { statusCode, body }
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Simple assertion helper
function assert(testName, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n==============================================================");
  console.log("  Lab 03 – API Test Suite");
  console.log("  Make sure the server is running on port 3000 before testing");
  console.log("==============================================================\n");

  // ------------------------------------------------------------------
  //  1. GET / – Home route
  // ------------------------------------------------------------------
  console.log("--- Test Group: Home Route ---");
  {
    const res = await request("GET", "/");
    assert("GET / returns 200", res.statusCode === 200);
    assert("GET / has lab info", res.body.lab && res.body.lab.includes("Lab 3"));
  }

  // ------------------------------------------------------------------
  //  2. GET /books – Fetch all books (default params)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: GET /books (default) ---");
  {
    const res = await request("GET", "/books");
    assert("GET /books returns 200", res.statusCode === 200);
    assert("GET /books returns an array", Array.isArray(res.body));
    assert("GET /books has books in it", res.body.length > 0);
  }

  // ------------------------------------------------------------------
  //  3. GET /books?search_q=javascript – Partial title search
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: Search (search_q) ---");
  {
    const res = await request("GET", "/books?search_q=javascript");
    assert("Search returns 200", res.statusCode === 200);
    assert("Search results are an array", Array.isArray(res.body));
    assert(
      "All results contain 'javascript' in title",
      res.body.every((b) =>
        b.title.toLowerCase().includes("javascript")
      )
    );
  }

  // ------------------------------------------------------------------
  //  4. GET /books?order_by=price&order=DESC – Sorting
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: Sorting (order_by, order) ---");
  {
    const res = await request("GET", "/books?order_by=price&order=DESC&limit=50");
    assert("Sort returns 200", res.statusCode === 200);
    let sorted = true;
    for (let i = 1; i < res.body.length; i++) {
      if (res.body[i].price > res.body[i - 1].price) {
        sorted = false;
        break;
      }
    }
    assert("Books are sorted by price descending", sorted);
  }

  // ------------------------------------------------------------------
  //  5. GET /books?limit=3&offset=2 – Pagination
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: Pagination (limit, offset) ---");
  {
    const res = await request("GET", "/books?limit=3&offset=2");
    assert("Pagination returns 200", res.statusCode === 200);
    assert("Pagination returns at most 3 books", res.body.length <= 3);
  }

  // ------------------------------------------------------------------
  //  6. GET /books?min_price=400&max_price=700 – Price range filter
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: Price Range Filter ---");
  {
    const res = await request("GET", "/books?min_price=400&max_price=700&limit=50");
    assert("Price filter returns 200", res.statusCode === 200);
    assert(
      "All books are within price range 400-700",
      res.body.every((b) => b.price >= 400 && b.price <= 700)
    );
  }

  // ------------------------------------------------------------------
  //  7. POST /books – Create a new book (success)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: POST /books (success) ---");
  let newBookId;
  {
    const res = await request("POST", "/books", {
      title: "Test Driven Development",
      author: "Kent Beck",
      price: 480,
      pages: 240,
    });
    assert("POST /books returns 201", res.statusCode === 201);
    assert("Response has bookId", res.body.bookId !== undefined);
    assert("Response has success message", res.body.message.includes("created"));
    newBookId = res.body.bookId;
  }

  // ------------------------------------------------------------------
  //  8. POST /books – Validation failures (400)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: POST /books Validation (400) ---");
  {
    // Missing title
    const res1 = await request("POST", "/books", {
      author: "Someone",
      price: 100,
      pages: 200,
    });
    assert("Missing title → 400", res1.statusCode === 400);

    // Missing author
    const res2 = await request("POST", "/books", {
      title: "Some Book",
      price: 100,
      pages: 200,
    });
    assert("Missing author → 400", res2.statusCode === 400);

    // Non-numeric price
    const res3 = await request("POST", "/books", {
      title: "Some Book",
      author: "Someone",
      price: "expensive",
      pages: 200,
    });
    assert("Non-numeric price → 400", res3.statusCode === 400);

    // Empty body
    const res4 = await request("POST", "/books", {});
    assert("Empty body → 400", res4.statusCode === 400);
  }

  // ------------------------------------------------------------------
  //  9. GET /books/:bookId – Fetch the book we just created
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: GET /books/:bookId (success) ---");
  {
    const res = await request("GET", `/books/${newBookId}`);
    assert("GET /books/:id returns 200", res.statusCode === 200);
    assert("Returned book has correct title", res.body.title === "Test Driven Development");
  }

  // ------------------------------------------------------------------
  //  10. GET /books/9999 – Book not found (404)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: GET /books/:bookId (404) ---");
  {
    const res = await request("GET", "/books/9999");
    assert("Non-existent book → 404", res.statusCode === 404);
    assert("404 has message field", res.body.message !== undefined);
  }

  // ------------------------------------------------------------------
  //  11. PUT /books/:bookId – Update a book (success)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: PUT /books/:bookId (success) ---");
  {
    const res = await request("PUT", `/books/${newBookId}`, {
      price: 520,
    });
    assert("PUT returns 200", res.statusCode === 200);
    assert("Response has success message", res.body.message.includes("updated"));

    // Verify the update
    const check = await request("GET", `/books/${newBookId}`);
    assert("Price was actually updated to 520", check.body.price === 520);
  }

  // ------------------------------------------------------------------
  //  12. PUT /books/9999 – Update non-existent book (404)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: PUT /books/:bookId (404) ---");
  {
    const res = await request("PUT", "/books/9999", { price: 100 });
    assert("Update non-existent book → 404", res.statusCode === 404);
  }

  // ------------------------------------------------------------------
  //  13. DELETE /books/:bookId – Delete the book we created (success)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: DELETE /books/:bookId (success) ---");
  {
    const res = await request("DELETE", `/books/${newBookId}`);
    assert("DELETE returns 200", res.statusCode === 200);
    assert("Response has success message", res.body.message.includes("deleted"));

    // Verify deletion
    const check = await request("GET", `/books/${newBookId}`);
    assert("Deleted book returns 404 on GET", check.statusCode === 404);
  }

  // ------------------------------------------------------------------
  //  14. DELETE /books/9999 – Delete non-existent book (404)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: DELETE /books/:bookId (404) ---");
  {
    const res = await request("DELETE", "/books/9999");
    assert("Delete non-existent book → 404", res.statusCode === 404);
  }

  // ------------------------------------------------------------------
  //  15. Unknown route (404 fallback)
  // ------------------------------------------------------------------
  console.log("\n--- Test Group: Unknown Route (404 fallback) ---");
  {
    const res = await request("GET", "/unknown/route");
    assert("Unknown route → 404", res.statusCode === 404);
    assert("404 has message", res.body.message !== undefined);
  }

  // ------------------------------------------------------------------
  //  Summary
  // ------------------------------------------------------------------
  console.log("\n==============================================================");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("==============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err.message);
  console.error("Make sure the server is running: node server.js");
  process.exit(1);
});
