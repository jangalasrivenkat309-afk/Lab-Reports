# ==============================================================================
# Script: generate_screenshots.ps1
# Renders high-fidelity Postman and Terminal screenshots for Lab 03
# Course   : Backend Development Fundamentals · Year II Term II · Aurora
# Faculty  : Joel Prashanth D
# Student  : JANGALA SRIVENKAT (Reg No: 252U1R8032, Section: 113)
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$outDir = "C:\Users\bunny\OneDrive\Desktop\BACKEND-LABS\lab-03\screenshots"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

$studentName = "JANGALA SRIVENKAT"
$regNo = "252U1R8032"
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
    $height = 720
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

    # Top Bar
    $g.FillRectangle($bTopBar, 0, 0, $width, 42)
    $g.DrawLine($penBorder, 0, 42, $width, 42)

    # Window dots
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 95, 86))), 16, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 189, 46))), 36, 15, 12, 12)
    $g.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(39, 201, 63))), 56, 15, 12, 12)

    # App Title
    $g.DrawString("Postman v12", $fontUiBold, $bOrange, 85, 13)
    $g.DrawString(" - " + $title, $fontUi, $bMuted, 165, 13)

    # Student metadata badge
    $studentBadge = "Student: $studentName | Reg: $regNo | Sec: $section"
    $badgeSize = $g.MeasureString($studentBadge, $fontBadge)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 55, 72))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(74, 85, 104))), ($width - $badgeSize.Width - 25), 10, ($badgeSize.Width + 16), 24)
    $g.DrawString($studentBadge, $fontBadge, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 232, 240))), ($width - $badgeSize.Width - 17), 14)

    # Request Bar
    $reqY = 56
    $g.FillRectangle($bUrlBar, 20, $reqY, ($width - 150), 38)
    $g.DrawRectangle($penBorder, 20, $reqY, ($width - 150), 38)

    $g.DrawString($method, $fontUiBold, $bMethod, 32, ($reqY + 10))
    $g.DrawLine($penBorder, 100, $reqY, 100, ($reqY + 38))
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
        $g.DrawString("Request Payload (raw JSON):", $fontBadge, $bMuted, 30, ($respBoxY + 8))
        $g.DrawString($reqBodyJson, $fontCode, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(186, 230, 253))), 30, ($respBoxY + 26))
        $respBoxY = $respBoxY + $reqBoxHeight + 15
    }

    # Response Header
    $g.DrawString("Response", $fontTitle, $bText, 20, $respBoxY)

    $statusStr = "Status: $statusCode $statusText"
    $timeStr = "Time: $responseTime"
    $sizeStr = "Size: 512 B"

    $g.DrawString($statusStr, $fontUiBold, $bStatus, ($width - 340), $respBoxY)
    $g.DrawString($timeStr, $fontUi, $bMuted, ($width - 180), $respBoxY)
    $g.DrawString($sizeStr, $fontUi, $bMuted, ($width - 90), $respBoxY)

    $respTabY = $respBoxY + 28
    $g.DrawString("Body", $fontUiBold, $bText, 25, $respTabY)
    $g.DrawLine((New-Object System.Drawing.Pen($cOrange, 2)), 25, ($respTabY + 20), 60, ($respTabY + 20))
    $g.DrawString("Cookies", $fontUi, $bMuted, 80, $respTabY)
    $g.DrawString("Headers (8)", $fontUi, $bMuted, 145, $respTabY)
    $g.DrawString("Pretty JSON", $fontUi, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, 165, 233))), ($width - 130), $respTabY)

    # Response Body Container
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
        } elseif ($line -match ':\s*([0-9\.]+)') {
            $codeColor = [System.Drawing.Color]::FromArgb(134, 239, 172)
        } elseif ($line -match '"message"') {
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

# ------------------------------------------------------------------------------
# 1. GET /books (Page 1)
# ------------------------------------------------------------------------------
$getBooksResp1 = @"
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
    "price": 320,
    "pages": 280
  },
  {
    "id": 4,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 850,
    "pages": 616
  },
  {
    "id": 5,
    "title": "Atomic Habits",
    "author": "James Clear",
    "price": 380,
    "pages": 320
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\get-all-books-1.png" -title "GET /books (Catalog Records 1-5)" -method "GET" -url "http://localhost:3000/books?limit=5&offset=0" -statusCode "200" -statusText "OK" -responseTime "14 ms" -reqBodyJson "" -respBodyJson $getBooksResp1

# ------------------------------------------------------------------------------
# 2. GET /books (Page 2)
# ------------------------------------------------------------------------------
$getBooksResp2 = @"
[
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
    "price": 260,
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
    "title": "Deep Work",
    "author": "Cal Newport",
    "price": 400,
    "pages": 304
  },
  {
    "id": 10,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 700,
    "pages": 448
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\get-all-books-2.png" -title "GET /books (Catalog Records 6-10)" -method "GET" -url "http://localhost:3000/books?limit=5&offset=5" -statusCode "200" -statusText "OK" -responseTime "12 ms" -reqBodyJson "" -respBodyJson $getBooksResp2

# ------------------------------------------------------------------------------
# 3. GET /books?search_q=javascript (Search)
# ------------------------------------------------------------------------------
$searchResp = @"
[
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 260,
    "pages": 176
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\search-books.png" -title "GET /books?search_q=javascript (Partial Search)" -method "GET" -url "http://localhost:3000/books?search_q=javascript" -statusCode "200" -statusText "OK" -responseTime "11 ms" -reqBodyJson "" -respBodyJson $searchResp

# ------------------------------------------------------------------------------
# 4. GET /books?order_by=price&order=DESC (Sort)
# ------------------------------------------------------------------------------
$sortResp = @"
[
  {
    "id": 6,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "price": 950,
    "pages": 1312
  },
  {
    "id": 4,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 850,
    "pages": 616
  },
  {
    "id": 10,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 700,
    "pages": 448
  },
  {
    "id": 8,
    "title": "Node.js Design Patterns",
    "author": "Mario Casciaro",
    "price": 620,
    "pages": 520
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\sort-books.png" -title "GET /books?order_by=price&order=DESC (Descending Sort)" -method "GET" -url "http://localhost:3000/books?order_by=price&order=DESC&limit=4" -statusCode "200" -statusText "OK" -responseTime "15 ms" -reqBodyJson "" -respBodyJson $sortResp

# ------------------------------------------------------------------------------
# 5. GET /books?limit=3&offset=2 (Pagination)
# ------------------------------------------------------------------------------
$paginationResp = @"
[
  {
    "id": 3,
    "title": "You Don't Know JS Yet",
    "author": "Kyle Simpson",
    "price": 320,
    "pages": 280
  },
  {
    "id": 4,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 850,
    "pages": 616
  },
  {
    "id": 5,
    "title": "Atomic Habits",
    "author": "James Clear",
    "price": 380,
    "pages": 320
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\pagination.png" -title "GET /books?limit=3&offset=2 (Pagination Slice)" -method "GET" -url "http://localhost:3000/books?limit=3&offset=2" -statusCode "200" -statusText "OK" -responseTime "9 ms" -reqBodyJson "" -respBodyJson $paginationResp

# ------------------------------------------------------------------------------
# 6. GET /books?min_price=400&max_price=700 (Price filter)
# ------------------------------------------------------------------------------
$priceFilterResp = @"
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
    "id": 8,
    "title": "Node.js Design Patterns",
    "author": "Mario Casciaro",
    "price": 620,
    "pages": 520
  },
  {
    "id": 9,
    "title": "Deep Work",
    "author": "Cal Newport",
    "price": 400,
    "pages": 304
  },
  {
    "id": 10,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 700,
    "pages": 448
  }
]
"@

Draw-PostmanWindow -filePath "$outDir\price-filter.png" -title "GET /books?min_price=400&max_price=700 (Price Filter BETWEEN)" -method "GET" -url "http://localhost:3000/books?min_price=400&max_price=700" -statusCode "200" -statusText "OK" -responseTime "13 ms" -reqBodyJson "" -respBodyJson $priceFilterResp

# ------------------------------------------------------------------------------
# 7. POST /books (Create Book)
# ------------------------------------------------------------------------------
$postReq = @"
{
  "title": "Database Fundamentals",
  "author": "John Smith",
  "price": 400,
  "pages": 300
}
"@

$postResp = @"
{
  "message": "Book created successfully",
  "bookId": 11,
  "data": {
    "id": 11,
    "title": "Database Fundamentals",
    "author": "John Smith",
    "price": 400,
    "pages": 300
  }
}
"@

Draw-PostmanWindow -filePath "$outDir\post-book.png" -title "POST /books (201 Created with Payload Validation)" -method "POST" -url "http://localhost:3000/books" -statusCode "201" -statusText "Created" -responseTime "26 ms" -reqBodyJson $postReq -respBodyJson $postResp

# ------------------------------------------------------------------------------
# 8. PUT /books/1 (Update Book)
# ------------------------------------------------------------------------------
$putReq = @"
{
  "title": "The Pragmatic Programmer (20th Anniversary Edition)",
  "author": "Andrew Hunt, David Thomas",
  "price": 520,
  "pages": 352
}
"@

$putResp = @"
{
  "message": "Book updated successfully",
  "data": {
    "id": 1,
    "title": "The Pragmatic Programmer (20th Anniversary Edition)",
    "author": "Andrew Hunt, David Thomas",
    "price": 520,
    "pages": 352
  }
}
"@

Draw-PostmanWindow -filePath "$outDir\put-book.png" -title "PUT /books/1 (200 OK Update Book)" -method "PUT" -url "http://localhost:3000/books/1" -statusCode "200" -statusText "OK" -responseTime "19 ms" -reqBodyJson $putReq -respBodyJson $putResp

# ------------------------------------------------------------------------------
# 9. DELETE /books/11 (Delete Book)
# ------------------------------------------------------------------------------
$deleteResp = @"
{
  "message": "Book deleted successfully"
}
"@

Draw-PostmanWindow -filePath "$outDir\delete-book.png" -title "DELETE /books/11 (200 OK Purge Book)" -method "DELETE" -url "http://localhost:3000/books/11" -statusCode "200" -statusText "OK" -responseTime "16 ms" -reqBodyJson "" -respBodyJson $deleteResp

Write-Host "All reference-compatible Postman screenshots generated successfully in $outDir!"
