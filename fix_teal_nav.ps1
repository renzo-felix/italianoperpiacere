$base = 'C:/Users/User/Desktop/proyectos/italianoperpiacere/entregables'

$navCssBlock = "/* NAV */`nnav{position:sticky;top:0;z-index:100;background:#ffffff;border-bottom:3px solid #78a6ba;box-shadow:0 2px 8px rgba(0,0,0,.07)}`n.nav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px}`n.nav-logo{display:flex;align-items:center;flex-shrink:0;padding:8px 0;text-decoration:none}`n.nav-logo img{height:38px;width:auto;display:block}`n.nav-links{display:flex;gap:2px;overflow-x:auto}`n.nav-links a{display:block;padding:11px 13px;font-size:.75rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#1a1a18;text-decoration:none;white-space:nowrap;border-bottom:3px solid transparent;margin-bottom:-3px;opacity:.5;transition:opacity .2s,border-color .2s,color .2s}`n.nav-links a:hover,.nav-links a.active{opacity:1;color:#3d7a94;border-bottom-color:#78a6ba}`n`n"

$logoHtml = '<a class="nav-logo" href="#"><img src="https://italianoperpiacere.com/web/image/website/1/logo/Italiano%20Per%20Piacere?unique=f5755ad" alt="Italiano Per Piacere" loading="lazy"></a>'

foreach ($m in @(2, 6, 10, 14)) {
    $path = "$base/modulo_$m/etapa3_gramatica.html"
    if (-not (Test-Path $path)) { Write-Host "SKIP: $path"; continue }
    $c = Get-Content $path -Raw -Encoding UTF8

    # Replace NAV CSS block
    $c = [regex]::Replace($c, '(?s)/\* NAV \*/.*?(?=/\*)', $navCssBlock)

    # Normalize nav opening tag
    $c = $c -replace '<nav class="sticky-nav"[^>]*>', '<nav>'
    $c = $c -replace '<nav id="main-nav"[^>]*>', '<nav>'

    # Remove old logo spans
    $c = $c -replace '<span class="logo">[^<]*</span>\s*', ''

    # Add logo and wrap links inside nav-inner + nav-links
    $navPattern = '(?s)(<nav>)\s*((?:<a[^>]*>.*?</a>\s*)+)(</nav>)'
    $c = [regex]::Replace($c, $navPattern, {
        param($match)
        $links = $match.Groups[2].Value.Trim()
        $nl = [System.Environment]::NewLine
        return "<nav>${nl}  <div class=""nav-inner"">${nl}    $logoHtml${nl}    <div class=""nav-links"">${nl}      $links${nl}    </div>${nl}  </div>${nl}</nav>"
    })

    # Fix JS selectors
    $c = $c.Replace("querySelectorAll('.sticky-nav a')", "querySelectorAll('.nav-links a')")
    $c = $c.Replace('querySelectorAll(".sticky-nav a")', 'querySelectorAll(".nav-links a")')
    $c = $c.Replace("querySelectorAll('nav a')", "querySelectorAll('.nav-links a')")
    $c = $c.Replace('querySelectorAll("nav a")', 'querySelectorAll(".nav-links a")')

    Set-Content $path -Value $c -Encoding UTF8 -NoNewline
    Write-Host "NAV updated: modulo_$m/etapa3_gramatica"
}

Write-Host "TEAL NAV DONE"
