# Rebuild static index.html from partials (SEO: content must be in initial HTML)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$header = Get-Content -Raw -Encoding UTF8 "header.html"
$about = Get-Content -Raw -Encoding UTF8 "about.html"
$product = Get-Content -Raw -Encoding UTF8 "product.html"
$footer = Get-Content -Raw -Encoding UTF8 "footer.html"

$templateHead = @'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خرید رنگ موی سگ و گربه Brooklyn | گیاهی و ایمن</title>
  <meta name="description" content="خرید رنگ موی سگ و گربه Brooklyn؛ گیاهی، بدون آمونیاک و Food-Grade. مناسب گرومینگ و خانه، با آموزش استفاده، نمونه کار و خرید امن از فروشگاه رسمی.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://www.brooklynpetcolor.ir/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="Brooklyn Pet Dye">
  <meta property="og:title" content="خرید رنگ موی سگ و گربه Brooklyn | گیاهی و ایمن">
  <meta property="og:description" content="رنگ موی گیاهی و ایمن مخصوص سگ و گربه Brooklyn. بدون آمونیاک، مناسب سالن گرومینگ و استفاده خانگی.">
  <meta property="og:url" content="https://www.brooklynpetcolor.ir/">
  <meta property="og:image" content="https://www.brooklynpetcolor.ir/productnum1.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="خرید رنگ موی سگ و گربه Brooklyn | گیاهی و ایمن">
  <meta name="twitter:description" content="رنگ موی گیاهی و ایمن مخصوص سگ و گربه Brooklyn. بدون آمونیاک، مناسب سالن گرومینگ و استفاده خانگی.">
  <meta name="twitter:image" content="https://www.brooklynpetcolor.ir/productnum1.png">
  <link rel="icon" type="image/png" sizes="32x32" href="BrooklynIcon.png">
  <link rel="icon" type="image/png" sizes="16x16" href="BrooklynIcon.png">
  <link rel="shortcut icon" href="BrooklynIcon.png" type="image/x-icon">
  <link rel="apple-touch-icon" sizes="180x180" href="BrooklynIcon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#F4C430">
  <meta name="msapplication-TileColor" content="#F4C430">
  <meta name="msapplication-TileImage" content="BrooklynIcon.png">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GHZB36CMJ7"></script>
  <script src="analytics.js"></script>
  <link rel="stylesheet" href="App.css">
  <link rel="stylesheet" href="offer-popup.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.brooklynpetcolor.ir/#organization",
        "name": "Brooklyn Pet Dye",
        "url": "https://www.brooklynpetcolor.ir/",
        "logo": "https://www.brooklynpetcolor.ir/BrooklynIcon.png",
        "email": "info@rangpet.com",
        "telephone": "+989928292995"
      },
      {
        "@type": "WebSite",
        "@id": "https://www.brooklynpetcolor.ir/#website",
        "url": "https://www.brooklynpetcolor.ir/",
        "name": "Brooklyn Pet Dye",
        "inLanguage": "fa-IR",
        "publisher": { "@id": "https://www.brooklynpetcolor.ir/#organization" }
      },
      {
        "@type": "Product",
        "@id": "https://www.brooklynpetcolor.ir/#product",
        "name": "رنگ موی حیوانات Brooklyn Pet Dye",
        "image": "https://www.brooklynpetcolor.ir/productnum1.png",
        "description": "رنگ موی گیاهی و ایمن مخصوص سگ و گربه Brooklyn؛ بدون آمونیاک، با پیگمنت‌های Food-Grade.",
        "brand": { "@type": "Brand", "name": "Brooklyn" },
        "offers": {
          "@type": "Offer",
          "url": "https://www.brooklynpetcolor.ir/",
          "priceCurrency": "IRR",
          "price": "1650000",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock",
          "seller": { "@id": "https://www.brooklynpetcolor.ir/#organization" }
        }
      }
    ]
  }
  </script>
  <style>
    #loader {
      position: fixed; top: 0; right: 0; bottom: 0; left: 0;
      background: #fff; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; transition: opacity 0.3s ease;
    }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #ddd;
      border-top-color: #1159FC; border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-text {
      margin-top: 12px; font-family: 'Yekan-Bakh', sans-serif;
      color: #333; font-size: 14px;
    }
    body.loading { overflow: hidden; }
  </style>
</head>
<body class="loading">
  <div id="loader">
    <div class="spinner"></div>
    <div class="loader-text">در حال بارگذاری محتوای علمی...</div>
  </div>
'@

$tail = @'

  <script src="offer-popup.js"></script>
  <script>
    window.addEventListener("DOMContentLoaded", function () {
      var loader = document.getElementById("loader");
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(function () {
          loader.style.display = "none";
          document.body.classList.remove("loading");
          if (window.BrooklynOffer) window.BrooklynOffer.init();
        }, 300);
      }
    });
  </script>
</body>
</html>
'@

$out = $templateHead + "`n" + $header + "`n" + $about + "`n" + $product + "`n" + $footer + "`n" + $tail
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot "index.html"), $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Built index.html successfully."
