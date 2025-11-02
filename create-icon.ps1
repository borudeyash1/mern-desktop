# PowerShell script to convert JPG to ICO
Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\YASH\Project Management\client\src\images\logo_only.jpg"
$targetPath = "D:\YASH\MERN DESKTOP\logo_only.ico"

# Load the image
$img = [System.Drawing.Image]::FromFile($sourcePath)

# Create icon sizes (Windows uses multiple sizes)
$sizes = @(16, 32, 48, 64, 128, 256)

# Create a new icon
$icon = [System.Drawing.Icon]::FromHandle(([System.Drawing.Bitmap]$img).GetHicon())

# Save as ICO
$fileStream = [System.IO.File]::Create($targetPath)
$icon.Save($fileStream)
$fileStream.Close()

Write-Host "Icon created successfully at: $targetPath"
