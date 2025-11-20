# PowerShell script to convert PNG to ICO with multiple sizes
# This creates a proper Windows ICO file with multiple resolutions

Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\student\Downloads\mern-desktop\3.png"
$targetPath = "C:\Users\student\Downloads\mern-desktop\logo_only.ico"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Converting PNG to ICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source: $sourcePath" -ForegroundColor Yellow
Write-Host "Target: $targetPath" -ForegroundColor Yellow
Write-Host ""

# Check if source file exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "[ERROR] Source file not found: $sourcePath" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Loading PNG image..." -ForegroundColor Green
$originalImage = [System.Drawing.Image]::FromFile($sourcePath)
Write-Host "    Original size: $($originalImage.Width)x$($originalImage.Height)" -ForegroundColor Gray

# Create a memory stream to hold the ICO data
$memoryStream = New-Object System.IO.MemoryStream

# ICO header: Reserved(2) + Type(2) + Count(2)
$iconCount = 4  # We'll create 4 sizes: 16, 32, 48, 256
$iconDir = [byte[]](0, 0, 1, 0, [byte]$iconCount, 0)
$memoryStream.Write($iconDir, 0, $iconDir.Length)

# Icon sizes to generate
$sizes = @(256, 48, 32, 16)
$imageDataList = @()
$currentOffset = 6 + (16 * $iconCount)  # Header + directory entries

Write-Host "[*] Creating icon sizes..." -ForegroundColor Green

foreach ($size in $sizes) {
    Write-Host "    - ${size}x${size}" -ForegroundColor Gray
    
    # Create resized image
    $resizedImage = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($originalImage, 0, 0, $size, $size)
    $graphics.Dispose()
    
    # Save as PNG in memory
    $pngStream = New-Object System.IO.MemoryStream
    $resizedImage.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngData = $pngStream.ToArray()
    $pngStream.Dispose()
    $resizedImage.Dispose()
    
    # Store image data
    $imageDataList += @{
        Size = $size
        Data = $pngData
        Offset = $currentOffset
    }
    
    $currentOffset += $pngData.Length
}

Write-Host "[*] Writing ICO directory entries..." -ForegroundColor Green

# Write directory entries
foreach ($imageData in $imageDataList) {
    $size = $imageData.Size
    $data = $imageData.Data
    $offset = $imageData.Offset
    
    # ICO directory entry (16 bytes)
    $width = if ($size -eq 256) { 0 } else { $size }   # 0 means 256
    $height = if ($size -eq 256) { 0 } else { $size }
    
    $iconDirEntry = [byte[]](
        [byte]$width,      # Width
        [byte]$height,     # Height
        0,                 # Color count (0 for PNG)
        0,                 # Reserved
        1, 0,              # Color planes
        32, 0,             # Bits per pixel
        [BitConverter]::GetBytes($data.Length)[0],
        [BitConverter]::GetBytes($data.Length)[1],
        [BitConverter]::GetBytes($data.Length)[2],
        [BitConverter]::GetBytes($data.Length)[3],
        [BitConverter]::GetBytes($offset)[0],
        [BitConverter]::GetBytes($offset)[1],
        [BitConverter]::GetBytes($offset)[2],
        [BitConverter]::GetBytes($offset)[3]
    )
    
    $memoryStream.Write($iconDirEntry, 0, $iconDirEntry.Length)
}

Write-Host "[*] Writing image data..." -ForegroundColor Green

# Write image data
foreach ($imageData in $imageDataList) {
    $memoryStream.Write($imageData.Data, 0, $imageData.Data.Length)
}

# Write to file
Write-Host "[*] Saving ICO file..." -ForegroundColor Green
[System.IO.File]::WriteAllBytes($targetPath, $memoryStream.ToArray())

# Cleanup
$memoryStream.Dispose()
$originalImage.Dispose()

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Icon created: $targetPath" -ForegroundColor Cyan
Write-Host "File size: $([System.IO.FileInfo]::new($targetPath).Length) bytes" -ForegroundColor Cyan
Write-Host "Resolutions: 256x256, 48x48, 32x32, 16x16" -ForegroundColor Cyan
Write-Host ""
