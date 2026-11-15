Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$bmp = New-Object System.Drawing.Bitmap 512,512
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0d3b4d'))
$pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#a2f0d3')),65
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddBezier(123,333,44,242,161,187,214,277)
$path.AddBezier(214,277,267,367,350,368,355,213)
$g.DrawPath($pen,$path)
$mint = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#baffdf'))
$dark = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#123d45'))
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#f0fff6'))
$gold = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#ffe3a0'))
$g.FillEllipse($mint,311,144,94,104)
$g.FillEllipse($white,323,169,24,28)
$g.FillEllipse($white,365,169,24,28)
$g.FillEllipse($dark,330,173,14,14)
$g.FillEllipse($dark,372,173,14,14)
$g.FillEllipse($white,336,173,4,4)
$g.FillEllipse($white,378,173,4,4)
$g.FillEllipse($gold,373,90,38,38)
$fin = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#58cbb2'))
$g.FillPolygon($fin,[System.Drawing.Point[]]@([System.Drawing.Point]::new(127,324),[System.Drawing.Point]::new(70,332),[System.Drawing.Point]::new(89,381),[System.Drawing.Point]::new(140,348)))
$g.FillPolygon($fin,[System.Drawing.Point[]]@([System.Drawing.Point]::new(236,309),[System.Drawing.Point]::new(221,247),[System.Drawing.Point]::new(279,287)))
foreach ($size in @(180,192,512)) {
  $out = New-Object System.Drawing.Bitmap $size,$size
  $og = [System.Drawing.Graphics]::FromImage($out)
  $og.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $og.DrawImage($bmp,0,0,$size,$size)
  $name = if ($size -eq 180) { 'apple-touch-icon.png' } else { "icon-$size.png" }
  $out.Save((Join-Path $root "assets\$name"),[System.Drawing.Imaging.ImageFormat]::Png)
  $og.Dispose()
  $out.Dispose()
}
$g.Dispose()
$bmp.Dispose()
