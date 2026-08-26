Add-Type -AssemblyName System.Drawing

$outputDirectory = Join-Path $PSScriptRoot "..\public\images"
$assets = @(
  @{ Name = "utang-sun.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_02.jpg"; X = 30; Y = 195; Width = 155; Height = 175 },
  @{ Name = "utang-dance.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_02.jpg"; X = 475; Y = 860; Width = 175; Height = 180 },
  @{ Name = "utang-heart.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_03.jpg"; X = 20; Y = 790; Width = 180; Height = 175 },
  @{ Name = "utang-flower.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576.jpg"; X = 170; Y = 525; Width = 170; Height = 180 },
  @{ Name = "utang-cheer.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_03.jpg"; X = 470; Y = 990; Width = 185; Height = 175 },
  @{ Name = "utang-party.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576.jpg"; X = 330; Y = 700; Width = 145; Height = 170 },
  @{ Name = "utang-sparkle.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_01.jpg"; X = 165; Y = 1015; Width = 175; Height = 190 },
  @{ Name = "utang-stretch.png"; Source = "C:\Users\남태원\Downloads\KakaoTalk_20260826_111011576_01.jpg"; X = 480; Y = 380; Width = 160; Height = 160 }
)

function Test-BackgroundPixel {
  param([System.Drawing.Color]$Color, [System.Drawing.Color]$Reference)

  $red = [int]$Color.R - [int]$Reference.R
  $green = [int]$Color.G - [int]$Reference.G
  $blue = [int]$Color.B - [int]$Reference.B
  $distance = ($red * $red) + ($green * $green) + ($blue * $blue)
  $range =
    [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B)) -
    [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))

  return $distance -le 9000 -and $range -le 28
}

function Remove-ConnectedBackground {
  param([System.Drawing.Bitmap]$Bitmap)

  $width = $Bitmap.Width
  $height = $Bitmap.Height
  $reference = $Bitmap.GetPixel(0, 0)
  $visited = New-Object 'bool[,]' $width, $height
  $queue = [System.Collections.Generic.Queue[System.Drawing.Point]]::new()

  for ($x = 0; $x -lt $width; $x += 1) {
    $queue.Enqueue([System.Drawing.Point]::new($x, 0))
    $queue.Enqueue([System.Drawing.Point]::new($x, $height - 1))
  }
  for ($y = 0; $y -lt $height; $y += 1) {
    $queue.Enqueue([System.Drawing.Point]::new(0, $y))
    $queue.Enqueue([System.Drawing.Point]::new($width - 1, $y))
  }

  $directions = @(
    [System.Drawing.Point]::new(1, 0),
    [System.Drawing.Point]::new(-1, 0),
    [System.Drawing.Point]::new(0, 1),
    [System.Drawing.Point]::new(0, -1)
  )

  while ($queue.Count -gt 0) {
    $point = $queue.Dequeue()
    if (
      $point.X -lt 0 -or $point.X -ge $width -or
      $point.Y -lt 0 -or $point.Y -ge $height -or
      $visited[$point.X, $point.Y]
    ) { continue }

    $visited[$point.X, $point.Y] = $true
    $color = $Bitmap.GetPixel($point.X, $point.Y)
    if (-not (Test-BackgroundPixel -Color $color -Reference $reference)) {
      continue
    }

    $Bitmap.SetPixel(
      $point.X,
      $point.Y,
      [System.Drawing.Color]::FromArgb(0, $color.R, $color.G, $color.B)
    )
    foreach ($direction in $directions) {
      $queue.Enqueue([System.Drawing.Point]::new(
        $point.X + $direction.X,
        $point.Y + $direction.Y
      ))
    }
  }
}

function Get-TrimmedBitmap {
  param([System.Drawing.Bitmap]$Bitmap, [int]$Padding = 10)

  $minimumX = $Bitmap.Width
  $minimumY = $Bitmap.Height
  $maximumX = -1
  $maximumY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      if ($Bitmap.GetPixel($x, $y).A -gt 0) {
        $minimumX = [Math]::Min($minimumX, $x)
        $minimumY = [Math]::Min($minimumY, $y)
        $maximumX = [Math]::Max($maximumX, $x)
        $maximumY = [Math]::Max($maximumY, $y)
      }
    }
  }

  if ($maximumX -lt 0) { throw "No foreground pixels were found." }

  $left = [Math]::Max(0, $minimumX - $Padding)
  $top = [Math]::Max(0, $minimumY - $Padding)
  $right = [Math]::Min($Bitmap.Width - 1, $maximumX + $Padding)
  $bottom = [Math]::Min($Bitmap.Height - 1, $maximumY + $Padding)
  $rectangle = [System.Drawing.Rectangle]::new(
    $left,
    $top,
    $right - $left + 1,
    $bottom - $top + 1
  )

  return $Bitmap.Clone(
    $rectangle,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
}

foreach ($asset in $assets) {
  $source = [System.Drawing.Bitmap]::new($asset.Source)
  try {
    $rectangle = [System.Drawing.Rectangle]::new(
      $asset.X,
      $asset.Y,
      $asset.Width,
      $asset.Height
    )
    $cropped = $source.Clone(
      $rectangle,
      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    )
    try {
      Remove-ConnectedBackground -Bitmap $cropped
      $trimmed = Get-TrimmedBitmap -Bitmap $cropped
      try {
        $outputPath = Join-Path $outputDirectory $asset.Name
        $trimmed.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output $outputPath
      } finally {
        $trimmed.Dispose()
      }
    } finally {
      $cropped.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}
