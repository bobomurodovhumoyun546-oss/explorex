Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'src/assets'
foreach ($assetName in @('logo', 'logo2')) {
    $sourceImage = [System.Drawing.Image]::FromFile((Join-Path $assetDirectory ($assetName + '.jpg')))
    $targetHeight = [int][Math]::Round($sourceImage.Height * 400.0 / $sourceImage.Width)
    $thumbnail = New-Object System.Drawing.Bitmap(400, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($thumbnail)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($sourceImage, 0, 0, 400, $targetHeight)
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
    $thumbnail.Save((Join-Path $assetDirectory ($assetName + '-small.jpg')), $encoder, $parameters)
    $parameters.Dispose()
    $graphics.Dispose()
    $thumbnail.Dispose()
    $sourceImage.Dispose()
}
