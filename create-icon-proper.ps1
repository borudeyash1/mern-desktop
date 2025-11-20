# PowerShell script to convert JPG to proper ICO with multiple sizes
Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\student\Downloads\mern-desktop\3.svg"
$targetPath = "C:\Users\student\Downloads\mern-desktop\logo_only.ico"

Write-Host "Loading image from: $sourcePath"

# Load the original image
$originalImage = [System.Drawing.Image]::FromFile($sourcePath)

Write-Host "Original image size: $($originalImage.Width)x$($originalImage.Height)"

# Create a memory stream to hold the ICO data
$memoryStream = New-Object System.IO.MemoryStream

# ICO header
$iconDir = [byte[]](0, 0, 1, 0, 1, 0) # ICO header + 1 image
$memoryStream.Write($iconDir, 0, $iconDir.Length)

# Create 256x256 version (the main size Windows uses)
$size = 256
$resizedImage = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($originalImage, 0, 0, $size, $size)
$graphics.Dispose()

# Save as PNG in memory (ICO can contain PNG)
$pngStream = New-Object System.IO.MemoryStream
$resizedImage.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngData = $pngStream.ToArray()
$pngStream.Dispose()
$resizedImage.Dispose()

# Write ICO directory entry
$iconDirEntry = [byte[]](
    $size,  # Width (0 means 256)
    $size,  # Height (0 means 256)
    0,      # Color count
    0,      # Reserved
    1, 0,   # Color planes
    32, 0,  # Bits per pixel
    [BitConverter]::GetBytes($pngData.Length)[0],
    [BitConverter]::GetBytes($pngData.Length)[1],
    [BitConverter]::GetBytes($pngData.Length)[2],
    [BitConverter]::GetBytes($pngData.Length)[3],
    [BitConverter]::GetBytes(6 + 16)[0],  # Offset to image data
    [BitConverter]::GetBytes(6 + 16)[1],
    [BitConverter]::GetBytes(6 + 16)[2],
    [BitConverter]::GetBytes(6 + 16)[3]
)

$memoryStream.Write($iconDirEntry, 0, $iconDirEntry.Length)
$memoryStream.Write($pngData, 0, $pngData.Length)

# Write to file
[System.IO.File]::WriteAllBytes($targetPath, $memoryStream.ToArray())
$memoryStream.Dispose()
$originalImage.Dispose()

Write-Host "Icon created successfully at: $targetPath"
Write-Host "Icon file size: $([System.IO.FileInfo]::new($targetPath).Length) bytes"
