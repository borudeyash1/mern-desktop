# Simple PowerShell script to convert JPG to ICO
Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\YASH\Project Management\client\src\images\logo_only.jpg"
$targetPath = "D:\YASH\MERN DESKTOP\logo_only.ico"

Write-Host "Converting $sourcePath to ICO format..."

# Load image
$img = [System.Drawing.Image]::FromFile($sourcePath)

# Create 256x256 bitmap (main size for Windows)
$bitmap = New-Object System.Drawing.Bitmap(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.DrawImage($img, 0, 0, 256, 256)
$graphics.Dispose()

# Get icon handle and save
$hIcon = $bitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

# Save to file
$fileStream = [System.IO.FileStream]::new($targetPath, [System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()

# Cleanup
$icon.Dispose()
$bitmap.Dispose()
$img.Dispose()

Write-Host "Icon created successfully!"
Write-Host "File: $targetPath"
Write-Host "Size: $([System.IO.FileInfo]::new($targetPath).Length) bytes"
