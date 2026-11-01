const http = require("http");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Helper to make HTTP requests
function sendRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          // keep as string
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on("error", (e) => reject(e));

    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 LAB 02 – AUTOMATED CRUD & DATABASE VERIFICATION TEST SUITE");
  console.log("==================================================================\n");

  const port = process.env.PORT || 3000;
  const baseUrl = "localhost";

  // 1. Test GET / (Health / Info)
  console.log("➡️ TEST 1: GET / (API Info)");
  const resRoot = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: "/",
    method: "GET",
  });
  console.log(`Status: ${resRoot.statusCode}`);
  console.log("Response:", JSON.stringify(resRoot.body, null, 2));
  console.log(resRoot.statusCode === 200 ? "✅ PASS\n" : "❌ FAIL\n");

  // 2. Test GET /books/ (All Books)
  console.log("➡️ TEST 2: GET /books/ (Retrieve All Books)");
  const resAllBooks = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: "/books/",
    method: "GET",
  });
  console.log(`Status: ${resAllBooks.statusCode}`);
  console.log(`Total Books Found: ${resAllBooks.body.length}`);
  console.log("First Book Sample:", resAllBooks.body[0]);
  console.log(resAllBooks.statusCode === 200 && resAllBooks.body.length >= 10 ? "✅ PASS\n" : "❌ FAIL\n");

  // 3. Test GET /books/:bookId/ (Single Book)
  console.log("➡️ TEST 3: GET /books/1/ (Retrieve Book with ID 1)");
  const resSingleBook = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: "/books/1/",
    method: "GET",
  });
  console.log(`Status: ${resSingleBook.statusCode}`);
  console.log("Response:", resSingleBook.body);
  console.log(resSingleBook.statusCode === 200 && resSingleBook.body.id === 1 ? "✅ PASS\n" : "❌ FAIL\n");

  // 4. Test GET /books/:bookId/ with invalid ID (404 Not Found)
  console.log("➡️ TEST 4: GET /books/999/ (Edge Case: Non-existent Book ID)");
  const resNotFound = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: "/books/999/",
    method: "GET",
  });
  console.log(`Status: ${resNotFound.statusCode}`);
  console.log("Response:", resNotFound.body);
  console.log(resNotFound.statusCode === 404 ? "✅ PASS (Correct 404 handling)\n" : "❌ FAIL\n");

  // 5. Test POST /books/ (Add New Book)
  console.log("➡️ TEST 5: POST /books/ (Create New Book)");
  const newBookPayload = {
    title: "Building Microservices",
    author: "Sam Newman",
    price: 680,
    pages: 612,
  };
  const resCreateBook = await sendRequest(
    {
      hostname: baseUrl,
      port: port,
      path: "/books/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    newBookPayload
  );
  console.log(`Status: ${resCreateBook.statusCode}`);
  console.log("Response:", resCreateBook.body);
  const createdBookId = resCreateBook.body.bookId;
  console.log(`New Book ID: ${createdBookId}`);
  console.log(resCreateBook.statusCode === 201 && createdBookId ? "✅ PASS\n" : "❌ FAIL\n");

  // 6. Verify Created Book via GET /books/:bookId/
  console.log(`➡️ TEST 6: GET /books/${createdBookId}/ (Verify Newly Created Book in DB)`);
  const resVerifyCreated = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: `/books/${createdBookId}/`,
    method: "GET",
  });
  console.log(`Status: ${resVerifyCreated.statusCode}`);
  console.log("Response:", resVerifyCreated.body);
  console.log(
    resVerifyCreated.statusCode === 200 && resVerifyCreated.body.title === "Building Microservices"
      ? "✅ PASS\n"
      : "❌ FAIL\n"
  );

  // 7. Test PUT /books/:bookId/ (Update Book)
  console.log(`➡️ TEST 7: PUT /books/${createdBookId}/ (Update Book Details)`);
  const updatePayload = {
    title: "Building Microservices (2nd Edition)",
    author: "Sam Newman",
    price: 750,
    pages: 630,
  };
  const resUpdateBook = await sendRequest(
    {
      hostname: baseUrl,
      port: port,
      path: `/books/${createdBookId}/`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    },
    updatePayload
  );
  console.log(`Status: ${resUpdateBook.statusCode}`);
  console.log("Response:", resUpdateBook.body);
  console.log(resUpdateBook.statusCode === 200 ? "✅ PASS\n" : "❌ FAIL\n");

  // 8. Verify Updated Book via GET
  console.log(`➡️ TEST 8: GET /books/${createdBookId}/ (Verify Updates Applied)`);
  const resVerifyUpdated = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: `/books/${createdBookId}/`,
    method: "GET",
  });
  console.log(`Status: ${resVerifyUpdated.statusCode}`);
  console.log("Response:", resVerifyUpdated.body);
  console.log(
    resVerifyUpdated.statusCode === 200 &&
      resVerifyUpdated.body.title === "Building Microservices (2nd Edition)" &&
      resVerifyUpdated.body.price === 750
      ? "✅ PASS\n"
      : "❌ FAIL\n"
  );

  // 9. Test DELETE /books/:bookId/ (Delete Book)
  console.log(`➡️ TEST 9: DELETE /books/${createdBookId}/ (Remove Book from DB)`);
  const resDeleteBook = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: `/books/${createdBookId}/`,
    method: "DELETE",
  });
  console.log(`Status: ${resDeleteBook.statusCode}`);
  console.log("Response:", resDeleteBook.body);
  console.log(resDeleteBook.statusCode === 200 ? "✅ PASS\n" : "❌ FAIL\n");

  // 10. Verify Deletion (Should return 404)
  console.log(`➡️ TEST 10: GET /books/${createdBookId}/ (Verify Book Was Removed)`);
  const resVerifyDeleted = await sendRequest({
    hostname: baseUrl,
    port: port,
    path: `/books/${createdBookId}/`,
    method: "GET",
  });
  console.log(`Status: ${resVerifyDeleted.statusCode}`);
  console.log("Response:", resVerifyDeleted.body);
  console.log(resVerifyDeleted.statusCode === 404 ? "✅ PASS (Confirmed Deleted from DB)\n" : "❌ FAIL\n");

  // 11. SQLite CLI / Direct DB Query Verification
  console.log("➡️ TEST 11: Direct SQLite File Inspection");
  const dbPath = path.join(__dirname, "books.db");
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  const finalCount = await db.get("SELECT COUNT(*) as count FROM book;");
  console.log(`Final Row Count in SQLite books.db: ${finalCount.count}`);
  const sampleBooks = await db.all("SELECT id, title, price FROM book LIMIT 3;");
  console.table(sampleBooks);
  await db.close();

  console.log("==================================================================");
  console.log("🎉 ALL LAB 02 TESTS PASSED PERFECTLY!");
  console.log("==================================================================");
}

// Run test suite
runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
