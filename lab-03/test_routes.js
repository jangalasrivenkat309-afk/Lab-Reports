// ==============================================================================
//  test_routes.js - Automated Verification Suite for Lab 03 REST API
//  Student : JANGALA SRIVENKAT (252U1R8032, Section: 113)
// ==============================================================================

import http from "http";

const BASE_URL = "http://localhost:3000";
let passedCount = 0;
let failedCount = 0;

function executeRequest(method, endpointPath, requestPayload = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(endpointPath, BASE_URL);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const clientReq = http.request(requestOptions, (serverResponse) => {
      let accumulatedBody = "";
      serverResponse.on("data", (chunk) => (accumulatedBody += chunk));
      serverResponse.on("end", () => {
        try {
          resolve({
            statusCode: serverResponse.statusCode,
            body: JSON.parse(accumulatedBody),
          });
        } catch {
          resolve({
            statusCode: serverResponse.statusCode,
            body: accumulatedBody,
          });
        }
      });
    });

    clientReq.on("error", reject);

    if (requestPayload) {
      clientReq.write(JSON.stringify(requestPayload));
    }
    clientReq.end();
  });
}

function verifyCondition(testTitle, assertionResult) {
  if (assertionResult) {
    console.log(`  [PASS] ${testTitle}`);
    passedCount++;
  } else {
    console.log(`  [FAIL] ${testTitle}`);
    failedCount++;
  }
}

async function startTestSuite() {
  console.log("\n==============================================================");
  console.log("  Lab 03 - Automated API Test Runner");
  console.log("  Target: JANGALA SRIVENKAT (252U1R8032) - Books REST API");
  console.log("==============================================================\n");

  // 1. Root Route
  console.log("--- 1. Root & Health Check ---");
  {
    const res = await executeRequest("GET", "/");
    verifyCondition("GET / responds with 200 OK", res.statusCode === 200);
    verifyCondition("GET / identifies developer", res.body?.developer?.studentName === "JANGALA SRIVENKAT");
  }

  // 2. GET /books
  console.log("\n--- 2. GET /books (Default Collection) ---");
  {
    const res = await executeRequest("GET", "/books");
    verifyCondition("GET /books returns 200 OK", res.statusCode === 200);
    verifyCondition("Response is an array of books", Array.isArray(res.body));
    verifyCondition("Catalog is populated", res.body.length > 0);
  }

  // 3. Search Query Parameter
  console.log("\n--- 3. Search by Title (search_q) ---");
  {
    const res = await executeRequest("GET", "/books?search_q=javascript");
    verifyCondition("Search query responds with 200 OK", res.statusCode === 200);
    verifyCondition(
      "Returned books match title query 'javascript'",
      res.body.every((b) => b.title.toLowerCase().includes("javascript"))
    );
  }

  // 4. Sorting Query Parameters
  console.log("\n--- 4. Sorting (order_by & order) ---");
  {
    const res = await executeRequest("GET", "/books?order_by=price&order=DESC&limit=50");
    verifyCondition("Sort request responds with 200 OK", res.statusCode === 200);
    let isDescending = true;
    for (let i = 1; i < res.body.length; i++) {
      if (res.body[i].price > res.body[i - 1].price) {
        isDescending = false;
        break;
      }
    }
    verifyCondition("Books sorted by price DESC successfully", isDescending);
  }

  // 5. Pagination
  console.log("\n--- 5. Pagination (limit & offset) ---");
  {
    const res = await executeRequest("GET", "/books?limit=3&offset=2");
    verifyCondition("Pagination request responds with 200 OK", res.statusCode === 200);
    verifyCondition("Limit constrained to 3 records", res.body.length <= 3);
  }

  // 6. Price Filtering
  console.log("\n--- 6. Price Range Filter (min_price & max_price) ---");
  {
    const res = await executeRequest("GET", "/books?min_price=400&max_price=700&limit=50");
    verifyCondition("Price range filter responds with 200 OK", res.statusCode === 200);
    verifyCondition(
      "All returned items satisfy 400 <= price <= 700",
      res.body.every((b) => b.price >= 400 && b.price <= 700)
    );
  }

  // 7. POST /books - Valid Insertion
  console.log("\n--- 7. POST /books (Valid Record) ---");
  let newRecordId;
  {
    const res = await executeRequest("POST", "/books", {
      title: "Clean Architecture Principles",
      author: "Robert C. Martin",
      price: 650,
      pages: 430,
    });
    verifyCondition("POST /books responds with 201 Created", res.statusCode === 201);
    verifyCondition("Response returns generated bookId", res.body.bookId !== undefined);
    newRecordId = res.body.bookId;
  }

  // 8. POST /books - Input Validation Checks
  console.log("\n--- 8. POST /books Validation Errors (400 Bad Request) ---");
  {
    const resMissingTitle = await executeRequest("POST", "/books", {
      author: "Martin Fowler",
      price: 500,
      pages: 300,
    });
    verifyCondition("Rejects payload missing title with 400", resMissingTitle.statusCode === 400);

    const resMissingAuthor = await executeRequest("POST", "/books", {
      title: "Refactoring UI",
      price: 500,
      pages: 300,
    });
    verifyCondition("Rejects payload missing author with 400", resMissingAuthor.statusCode === 400);

    const resBadPrice = await executeRequest("POST", "/books", {
      title: "Design Patterns",
      author: "GoF",
      price: "free",
      pages: 400,
    });
    verifyCondition("Rejects non-numeric price with 400", resBadPrice.statusCode === 400);
  }

  // 9. GET /books/:bookId
  console.log("\n--- 9. Single Book Lookup ---");
  {
    const res = await executeRequest("GET", `/books/${newRecordId}`);
    verifyCondition("GET /books/:bookId responds with 200 OK", res.statusCode === 200);
    verifyCondition("Retrieved book title matches inserted record", res.body.title === "Clean Architecture Principles");

    const resNotFound = await executeRequest("GET", "/books/99999");
    verifyCondition("Non-existent ID responds with 404 Not Found", resNotFound.statusCode === 404);
  }

  // 10. PUT /books/:bookId
  console.log("\n--- 10. PUT Update Record ---");
  {
    const res = await executeRequest("PUT", `/books/${newRecordId}`, { price: 690 });
    verifyCondition("PUT /books/:bookId responds with 200 OK", res.statusCode === 200);

    const resNotFound = await executeRequest("PUT", "/books/99999", { price: 100 });
    verifyCondition("Updating non-existent ID returns 404", resNotFound.statusCode === 404);
  }

  // 11. DELETE /books/:bookId
  console.log("\n--- 11. DELETE Record ---");
  {
    const res = await executeRequest("DELETE", `/books/${newRecordId}`);
    verifyCondition("DELETE /books/:bookId responds with 200 OK", res.statusCode === 200);

    const resNotFound = await executeRequest("DELETE", "/books/99999");
    verifyCondition("Deleting non-existent ID returns 404", resNotFound.statusCode === 404);
  }

  // Summary
  console.log("\n==============================================================");
  console.log(`  Final Results: ${passedCount} passed, ${failedCount} failed`);
  console.log("==============================================================\n");

  if (failedCount > 0) process.exit(1);
}

startTestSuite().catch((err) => {
  console.error("Test execution failed:", err.message);
  process.exit(1);
});
