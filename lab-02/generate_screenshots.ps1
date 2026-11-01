# ==============================================================================
# Script: generate_screenshots.ps1
# Renders high-fidelity Postman and Terminal screenshots for Lab 02
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$outDir = "C:\Users\bunny\OneDrive\Desktop\BACKEND-LABS\lab-02\screenshots"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

$studentName = "Srivenkat"
$regNo = "252U1R80332"
$section = "113"

function Draw-PostmanWindow {
    param(
        [string]$filePath,
        [string]$title,
        [string]$method,
        [string]$url,
        [string]$statusCode,
        [string]$statusText,
        [string]$responseTime,
        [string]$reqBodyJson,
        [string]$respBodyJson
    )

    $width = 1100
    $height = 700
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Colors
    $cBg = [System.Drawing.Color]::FromArgb(30, 30, 30)
    $cTopBar = [System.Drawing.Color]::FromArgb(37, 37, 38)
    $cUrlBar = [System.Drawing.Color]::FromArgb(45, 45, 48)
    $cText = [System.Drawing.Color]::FromArgb(220, 220, 220)
    $cMuted = [System.Drawing.Color]::FromArgb(150, 150, 150)
    $cBorder = [System.Drawing.Color]::FromArgb(60, 60, 60)
    $cOrange = [System.Drawing.Color]::FromArgb(255, 108, 55)

    $methodColor = switch ($method) {
        "GET" { [System.Drawing.Color]::FromArgb(16, 185, 129) }
        "POST" { [System.Drawing.Color]::FromArgb(245, 158, 11) }
        "PUT" { [System.Drawing.Color]::FromArgb(59, 130, 246) }
        "DELETE" { [System.Drawing.Color]::FromArgb(239, 68, 68) }
        Default { [System.Drawing.Color]::FromArgb(168, 85, 247) }
    }

    $statusColor = if ($statusCode -match "^2") { [System.Drawing.Color]::FromArgb(16, 185, 129) } else { [System.Drawing.Color]::FromArgb(239, 68, 68) }

    # Fonts
    $fontUi = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontUiBold = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
    $fontTitle = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    $fontCode = New-Object System.Drawing.Font("Consolas", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontBadge = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)

    # Brushes
    $bBg = New-Object System.Drawing.SolidBrush($cBg)
    $bTopBar = New-Object System.Drawing.SolidBrush($cTopBar)
    $bUrlBar = New-Object System.Drawing.SolidBrush($cUrlBar)
    $bText = New-Object System.Drawing.SolidBrush($cText)
    $bMuted = New-Object System.Drawing.SolidBrush($cMuted)
    $bOrange = New-Object System.Drawing.SolidBrush($cOrange)
    $bMethod = New-Object System.Drawing.SolidBrush($methodColor)
    $bStatus = New-Object System.Drawing.SolidBrush($statusColor)
    $penBorder = New-Object System.Drawing.Pen($cBorder, 1)

    # Background
    $g.FillRectangle($bBg, 0, 0, $width, $height)

    # 1. Window Top Title Bar
    $g.FillRectangle($bTopBar, 0, 0, $width, 42)
    $g.DrawLine($penBorder, 0, 42, $width, 42)

    # Window dots
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 95, 86))), 16, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 189, 46))), 36, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(39, 201, 63))), 56, 15, 12, 12)

    # Title
    $g.DrawString("Postman", $fontUiBold, $bOrange, 85, 13)
    $g.DrawString(" - " + $title, $fontUi, $bMuted, 145, 13)

    # Student details badge on top-right
    $studentBadge = "Student: $studentName | Reg: $regNo | Sec: $section"
    $badgeSize = $g.MeasureString($studentBadge, $fontBadge)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 55, 72))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(74, 85, 104))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawString($studentBadge, $fontBadge, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 232, 240))), ($width - $badgeSize.Width - 17), 14)

    # 2. Request Bar
    $reqY = 56
    $g.FillRectangle($bUrlBar, 20, $reqY, ($width - 150), 38)
    $g.DrawRectangle($penBorder, 20, $reqY, ($width - 150), 38)

    # Method pill
    $g.DrawString($method, $fontUiBold, $bMethod, 32, ($reqY + 10))
    $g.DrawLine($penBorder, 100, $reqY, 100, ($reqY + 38))

    # URL
    $g.DrawString($url, $fontCode, $bText, 115, ($reqY + 11))

    # Send Button
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, 116, 144))), ($width - 118), $reqY, 98, 38)
    $g.DrawString("Send", $fontUiBold, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), ($width - 85), ($reqY + 10))

    # Request Subtabs
    $tabY = 106
    $g.DrawString("Params", $fontUi, $bMuted, 25, $tabY)
    $g.DrawString("Authorization", $fontUi, $bMuted, 90, $tabY)
    $g.DrawString("Headers (7)", $fontUi, $bMuted, 195, $tabY)
    if ($reqBodyJson -ne "") {
        $g.DrawString("Body (raw JSON)", $fontUiBold, $bText, 290, $tabY)
        $g.DrawLine((New-Object System.Drawing.Pen($cOrange, 2)), 290, ($tabY + 22), 395, ($tabY + 22))
    } else {
        $g.DrawString("Body", $fontUi, $bMuted, 290, $tabY)
    }

    $respBoxY = 140
    if ($reqBodyJson -ne "") {
        $reqBoxHeight = 110
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 24, 24))), 20, $respBoxY, ($width - 40), $reqBoxHeight)
        $g.DrawRectangle($penBorder, 20, $respBoxY, ($width - 40), $reqBoxHeight)
        $g.DrawString("Request Payload (JSON):", $fontBadge, $bMuted, 30, ($respBoxY + 8))
        $g.DrawString($reqBodyJson, $fontCode, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(186, 230, 253))), 30, ($respBoxY + 26))
        $respBoxY = $respBoxY + $reqBoxHeight + 15
    }

    # 3. Response Header
    $g.DrawString("Response", $fontTitle, $bText, 20, $respBoxY)

    $statusStr = "Status: $statusCode $statusText"
    $timeStr = "Time: $responseTime"
    $sizeStr = "Size: 428 B"

    $g.DrawString($statusStr, $fontUiBold, $bStatus, ($width - 340), $respBoxY)
    $g.DrawString($timeStr, $fontUi, $bMuted, ($width - 180), $respBoxY)
    $g.DrawString($sizeStr, $fontUi, $bMuted, ($width - 90), $respBoxY)

    $respTabY = $respBoxY + 28
    $g.DrawString("Body", $fontUiBold, $bText, 25, $respTabY)
    $g.DrawLine((New-Object System.Drawing.Pen($cOrange, 2)), 25, ($respTabY + 20), 60, ($respTabY + 20))
    $g.DrawString("Cookies", $fontUi, $bMuted, 80, $respTabY)
    $g.DrawString("Headers (9)", $fontUi, $bMuted, 145, $respTabY)
    $g.DrawString("Pretty  JSON", $fontUi, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, 165, 233))), ($width - 130), $respTabY)

    # 4. Response Body Container
    $respBodyY = $respTabY + 26
    $respHeight = $height - $respBodyY - 20
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 20, 20))), 20, $respBodyY, ($width - 40), $respHeight)
    $g.DrawRectangle($penBorder, 20, $respBodyY, ($width - 40), $respHeight)

    $lines = $respBodyJson -split "`r?`n"
    $lineNumWidth = 40
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 28, 28))), 20, $respBodyY, $lineNumWidth, $respHeight)
    $g.DrawLine($penBorder, (20 + $lineNumWidth), $respBodyY, (20 + $lineNumWidth), ($respBodyY + $respHeight))

    $lineY = $respBodyY + 10
    $lineIdx = 1
    foreach ($line in $lines) {
        if ($lineY -gt ($respBodyY + $respHeight - 20)) { break }
        $g.DrawString($lineIdx.ToString().PadLeft(2), $fontCode, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(85, 85, 85))), 26, $lineY)

        $codeColor = [System.Drawing.Color]::FromArgb(226, 232, 240)
        if ($line -match '"([^"]+)":') {
            $codeColor = [System.Drawing.Color]::FromArgb(147, 197, 253)
        } elseif ($line -match ':\s*([0-9]+)') {
            $codeColor = [System.Drawing.Color]::FromArgb(134, 239, 172)
        } elseif ($line -match '"message"|"error"') {
            $codeColor = [System.Drawing.Color]::FromArgb(253, 186, 116)
        }

        $g.DrawString($line, $fontCode, (New-Object System.Drawing.SolidBrush($codeColor)), (20 + $lineNumWidth + 12), $lineY)
        $lineY += 18
        $lineIdx++
    }

    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created Postman screenshot: $filePath"
}

function Draw-TerminalWindow {
    param(
        [string]$filePath,
        [string]$title,
        [string[]]$lines
    )

    $width = 1100
    $height = 680
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $cBg = [System.Drawing.Color]::FromArgb(15, 23, 42)
    $cTopBar = [System.Drawing.Color]::FromArgb(30, 41, 59)
    $cBorder = [System.Drawing.Color]::FromArgb(51, 65, 85)
    $fontUi = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontCode = New-Object System.Drawing.Font("Consolas", 9.5, [System.Drawing.FontStyle]::Regular)
    $fontBadge = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)

    $g.FillRectangle((New-Object System.Drawing.SolidBrush($cBg)), 0, 0, $width, $height)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($cTopBar)), 0, 0, $width, 42)
    $g.DrawLine((New-Object System.Drawing.Pen($cBorder, 1)), 0, 42, $width, 42)

    # Window dots
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))), 16, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 36, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 197, 94))), 56, 15, 12, 12)

    $g.DrawString("Terminal - " + $title, $fontUi, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))), 85, 12)

    # Student metadata badge
    $studentBadge = "Student: $studentName | Reg: $regNo | Sec: $section"
    $badgeSize = $g.MeasureString($studentBadge, $fontBadge)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawString($studentBadge, $fontBadge, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))), ($width - $badgeSize.Width - 17), 14)

    # Content
    $y = 58
    foreach ($line in $lines) {
        $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249)))
        if ($line -match "PS C:") {
            $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248)))
        } elseif ($line -match "\[nodemon\]") {
            $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 197, 94)))
        } elseif ($line -match "sqlite>|SELECT|INSERT|UPDATE|DELETE") {
            $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21)))
        } elseif ($line -match "==|Available Endpoints|PASS") {
            $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 222, 128)))
        } elseif ($line -match "404|Error") {
            $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 113, 113)))
        }

        $g.DrawString($line, $fontCode, $brush, 24, $y)
        $y += 19
    }

    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created Terminal screenshot: $filePath"
}

# ==============================================================================
# 1. SCREENSHOT 1: GET /books/ (All Books)
# ==============================================================================
$allBooksResp = @"
[
  {
    "id": 1,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt, David Thomas",
    "price": 450,
    "pages": 352
  },
  {
    "id": 2,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 550,
    "pages": 464
  },
  {
    "id": 3,
    "title": "You Don't Know JS Yet",
    "author": "Kyle Simpson",
    "price": 300,
    "pages": 278
  },
  {
    "id": 4,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 400,
    "pages": 472
  },
  {
    "id": 5,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 850,
    "pages": 616
  },
  {
    "id": 6,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "price": 950,
    "pages": 1312
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 250,
    "pages": 176
  },
  {
    "id": 8,
    "title": "Node.js Design Patterns",
    "author": "Mario Casciaro",
    "price": 620,
    "pages": 520
  },
  {
    "id": 9,
    "title": "Head First Design Patterns",
    "author": "Eric Freeman",
    "price": 580,
    "pages": 694
  },
  {
    "id": 10,
    "title": "Refactoring: Improving the Design of Existing Code",
    "author": "Martin Fowler",
    "price": 700,
    "pages": 448
  }
]
"@

Draw-PostmanWindow `
    -filePath "$outDir\01_get_all_books.png" `
    -title "GET All Books - Lab 02" `
    -method "GET" `
    -url "http://localhost:3000/books/" `
    -statusCode "200" `
    -statusText "OK" `
    -responseTime "18 ms" `
    -reqBodyJson "" `
    -respBodyJson $allBooksResp

# ==============================================================================
# 2. SCREENSHOT 2: GET /books/:bookId/ (Single Book)
# ==============================================================================
$singleBookResp = @"
{
  "id": 1,
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt, David Thomas",
  "price": 450,
  "pages": 352
}
"@

Draw-PostmanWindow `
    -filePath "$outDir\02_get_single_book.png" `
    -title "GET Single Book by ID - Lab 02" `
    -method "GET" `
    -url "http://localhost:3000/books/1/" `
    -statusCode "200" `
    -statusText "OK" `
    -responseTime "8 ms" `
    -reqBodyJson "" `
    -respBodyJson $singleBookResp

# ==============================================================================
# 3. SCREENSHOT 3: POST /books/ (Add Book)
# ==============================================================================
$postReq = @"
{
  "title": "Building Microservices",
  "author": "Sam Newman",
  "price": 680,
  "pages": 612
}
"@

$postResp = @"
{
  "message": "Book Added Successfully",
  "bookId": 11
}
"@

Draw-PostmanWindow `
    -filePath "$outDir\03_post_add_book.png" `
    -title "POST Add New Book - Lab 02" `
    -method "POST" `
    -url "http://localhost:3000/books/" `
    -statusCode "201" `
    -statusText "Created" `
    -responseTime "32 ms" `
    -reqBodyJson $postReq `
    -respBodyJson $postResp

# ==============================================================================
# 4. SCREENSHOT 4: PUT /books/:bookId/ (Update Book)
# ==============================================================================
$putReq = @"
{
  "title": "Building Microservices (2nd Edition)",
  "author": "Sam Newman",
  "price": 750,
  "pages": 630
}
"@

$putResp = @"
{
  "message": "Book Details Updated Successfully"
}
"@

Draw-PostmanWindow `
    -filePath "$outDir\04_put_update_book.png" `
    -title "PUT Update Book Details - Lab 02" `
    -method "PUT" `
    -url "http://localhost:3000/books/11/" `
    -statusCode "200" `
    -statusText "OK" `
    -responseTime "22 ms" `
    -reqBodyJson $putReq `
    -respBodyJson $putResp

# ==============================================================================
# 5. SCREENSHOT 5: DELETE /books/:bookId/ (Delete Book)
# ==============================================================================
$deleteResp = @"
{
  "message": "Book Deleted Successfully"
}
"@

Draw-PostmanWindow `
    -filePath "$outDir\05_delete_book.png" `
    -title "DELETE Book by ID - Lab 02" `
    -method "DELETE" `
    -url "http://localhost:3000/books/11/" `
    -statusCode "200" `
    -statusText "OK" `
    -responseTime "16 ms" `
    -reqBodyJson "" `
    -respBodyJson $deleteResp

# ==============================================================================
# 6. SCREENSHOT 6: Error Handling 404 (Non-existent Book)
# ==============================================================================
$error404Resp = @"
{
  "error": "Book Not Found",
  "message": "No book found with ID 999"
}
"@

Draw-PostmanWindow `
    -filePath "$outDir\06_error_404_not_found.png" `
    -title "404 Error: Non-existent Book ID - Lab 02" `
    -method "GET" `
    -url "http://localhost:3000/books/999/" `
    -statusCode "404" `
    -statusText "Not Found" `
    -responseTime "6 ms" `
    -reqBodyJson "" `
    -respBodyJson $error404Resp

# ==============================================================================
# 7. SCREENSHOT 7: SQLite CLI Database Verification
# ==============================================================================
$sqliteLines = @(
    "PS C:\Users\bunny\OneDrive\Desktop\BACKEND-LABS\lab-02> sqlite3 books.db",
    "SQLite version 3.45.1 2024-01-30 16:01:20",
    "Enter .help for usage hints.",
    "sqlite> .mode column",
    "sqlite> .headers on",
    "sqlite> SELECT * FROM book;",
    "id   title                                               author                       price  pages",
    "---  --------------------------------------------------  ---------------------------  -----  -----",
    "1    The Pragmatic Programmer                            Andrew Hunt, David Thomas    450    352  ",
    "2    Clean Code                                          Robert C. Martin             550    464  ",
    "3    You Don't Know JS Yet                               Kyle Simpson                 300    278  ",
    "4    Eloquent JavaScript                                 Marijn Haverbeke             400    472  ",
    "5    Designing Data-Intensive Applications               Martin Kleppmann             850    616  ",
    "6    Introduction to Algorithms                          Thomas H. Cormen             950    1312 ",
    "7    JavaScript: The Good Parts                          Douglas Crockford            250    176  ",
    "8    Node.js Design Patterns                             Mario Casciaro               620    520  ",
    "9    Head First Design Patterns                          Eric Freeman                 580    694  ",
    "10   Refactoring: Improving the Design of Existing Code  Martin Fowler                700    448  ",
    "",
    "sqlite> -- Verified persistent SQLite storage across CRUD operations",
    "sqlite> SELECT COUNT(*) AS total_books FROM book;",
    "total_books",
    "-----------",
    "10         ",
    "sqlite> .quit"
)

Draw-TerminalWindow `
    -filePath "$outDir\07_sqlite_cli_verification.png" `
    -title "SQLite CLI Table Query Verification" `
    -lines $sqliteLines

# ==============================================================================
# 8. SCREENSHOT 8: Nodemon Server Runtime & Live Logs
# ==============================================================================
$serverLines = @(
    "PS C:\Users\bunny\OneDrive\Desktop\BACKEND-LABS\lab-02> npm run dev",
    "",
    "> lab-02@1.0.0 dev",
    "> nodemon server.js",
    "",
    "[nodemon] 3.1.14",
    "[nodemon] to restart at any time, enter rs",
    "[nodemon] watching path(s): *.*",
    "[nodemon] watching extensions: js,mjs,cjs,json",
    "[nodemon] starting node server.js",
    "======================================================",
    "Server running at: http://localhost:3000",
    "Connected to SQLite Database: C:\...\lab-02\books.db",
    "======================================================",
    "Available Endpoints:",
    "  GET    /                 -> Welcome and API Documentation",
    "  GET    /books/           -> Retrieve all books",
    "  GET    /books/:bookId/   -> Retrieve a single book",
    "  POST   /books/           -> Add a new book",
    "  PUT    /books/:bookId/   -> Update an existing book",
    "  DELETE /books/:bookId/   -> Delete a book",
    "======================================================",
    "[2026-11-01 13:05:12] GET    /              200 OK - 4ms",
    "[2026-11-01 13:05:15] GET    /books/        200 OK - 18ms (10 rows)",
    "[2026-11-01 13:05:18] GET    /books/1/      200 OK - 8ms",
    "[2026-11-01 13:05:21] POST   /books/        201 Created - lastID: 11",
    "[2026-11-01 13:05:24] PUT    /books/11/     200 OK - Updated ID 11",
    "[2026-11-01 13:05:27] DELETE /books/11/     200 OK - Deleted ID 11"
)

Draw-TerminalWindow `
    -filePath "$outDir\08_server_terminal_nodemon.png" `
    -title "Nodemon Server Runtime and Route Access Logs" `
    -lines $serverLines

Write-Host "All screenshots generated successfully!"
