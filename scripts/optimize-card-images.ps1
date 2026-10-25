Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'src/assets'
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
foreach ($assetName in @('mapquiz', 'flagquiz2', 'rekords')) {
    $sourceImage = [System.Drawing.Image]::FromFile((Join-Path $assetDirectory ($assetName + '.jpg')))
    $targetWidth = [Math]::Min(1200, $sourceImage.Width)
    $targetHeight = [int][Math]::Round($sourceImage.Height * $targetWidth / $sourceImage.Width)
    $thumbnail = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($thumbnail)
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($sourceImage, 0, 0, $targetWidth, $targetHeight)
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
        $thumbnail.Save((Join-Path $assetDirectory ($assetName + '-card.jpg')), $encoder, $parameters)
    } finally {
        $parameters.Dispose()
        $graphics.Dispose()
        $thumbnail.Dispose()
        $sourceImage.Dispose()
    }
}
