$base = 'C:/Users/User/Desktop/proyectos/italianoperpiacere/entregables'

# Color groups: module numbers -> palette
$groups = @(
    @{ modules=@(1,5,9,13); heroColor='#fde4e1'; navBorder='#cc4736'; activeColor='#a8382a'; activeBorder='#cc4736'; thBg='#fbc8c2'; thColor='#7a1f14'; navCssColor='#cc4736'; label='RED' },
    @{ modules=@(3,7,11,15); heroColor='#c8e8de'; navBorder='#528e74'; activeColor='#3d6b58'; activeBorder='#528e74'; thBg='#a8d4c4'; thColor='#2a4d3c'; navCssColor='#528e74'; label='GREEN' },
    @{ modules=@(0,4,8,12,16); heroColor='#fef9e8'; navBorder='#EFCF7F'; activeColor='#c8940a'; activeBorder='#EFCF7F'; thBg='#fde8a0'; thColor='#7a5500'; navCssColor='#EFCF7F'; label='AMBER' }
)

foreach ($g in $groups) {
    $hc = $g.heroColor
    $nb = $g.navBorder
    $ac = $g.activeColor
    $ab = $g.activeBorder
    $tb = $g.thBg
    $tc = $g.thColor
    $nc = $g.navCssColor
    $lbl = $g.label

    $navCssBlock = "/* NAV */`nnav{position:sticky;top:0;z-index:100;background:#ffffff;border-bottom:3px solid $nc;box-shadow:0 2px 8px rgba(0,0,0,.07)}`n.nav-inner{max-width:960px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px}`n.nav-logo{display:flex;align-items:center;flex-shrink:0;padding:8px 0;text-decoration:none}`n.nav-logo img{height:38px;width:auto;display:block}`n.nav-links{display:flex;gap:2px;overflow-x:auto}`n.nav-links a{display:block;padding:11px 13px;font-size:.75rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#1a1a18;text-decoration:none;white-space:nowrap;border-bottom:3px solid transparent;margin-bottom:-3px;opacity:.5;transition:opacity .2s,border-color .2s,color .2s}`n.nav-links a:hover,.nav-links a.active{opacity:1;color:$ac;border-bottom-color:$ab}`n`n"
    $logoHtml = '<a class="nav-logo" href="#"><img src="https://italianoperpiacere.com/web/image/website/1/logo/Italiano%20Per%20Piacere?unique=f5755ad" alt="Italiano Per Piacere" loading="lazy"></a>'

    foreach ($m in $g.modules) {
        foreach ($etapa in @('etapa2_descubrimiento','etapa3_gramatica')) {
            $path = "$base/modulo_$m/$etapa.html"
            if (-not (Test-Path $path)) { Write-Host "SKIP: modulo_$m/$etapa"; continue }
            $c = Get-Content $path -Raw -Encoding UTF8

            # --- Colors: hero/page-header background ---
            $c = [regex]::Replace($c, 'background:\s*var\(--(teal|green|amber|red|hero|hdr|mod)\)', "background:$hc")

            # --- Hero text to dark ---
            $c = [regex]::Replace($c, '(?<=\.hero\s+h1\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')
            $c = [regex]::Replace($c, '(?<=\.hero-sub\s*\{[^}]{0,300})color:\s*(rgba\(255,255,255[^)]+\)|var\(--white\)|#fff|#ffffff)', 'color:#1a1a18;opacity:.75')
            $c = [regex]::Replace($c, '(?<=\.hero\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')

            # --- page-header text to dark ---
            $c = [regex]::Replace($c, '(?<=\.page-header\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')
            $c = [regex]::Replace($c, '(?<=\.page-header\s+h1\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')
            $c = [regex]::Replace($c, '(?<=\.page-header\s+p\s*\{[^}]{0,300})color:\s*(rgba\(255,255,255[^)]+\)|var\(--white\)|#fff)', 'color:#1a1a18;opacity:.75')
            $c = [regex]::Replace($c, '(?<=\.page-header\s+\.badge\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')
            $c = [regex]::Replace($c, '(?<=\.badge\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')

            # --- hero-bg-circles -> hide ---
            $c = $c -replace '(\.hero-bg-circle\s*\{)', '${1}display:none;'

            # --- scroll-hint color ---
            $c = [regex]::Replace($c, '(?<=\.scroll-hint\s*\{[^}]{0,300})color:\s*(rgba\(255,255,255[^)]+\)|var\(--white\)|#fff)', 'color:rgba(0,0,0,.4)')

            # --- table th ---
            $c = [regex]::Replace($c, '(?<=(?:\.verb-table|\.article-table|\.gtable|\.conj-table|\.table-wrap table)\s+th\s*\{[^}]{0,300})background:\s*[^;]+', "background:$tb")
            $c = [regex]::Replace($c, '(?<=(?:\.verb-table|\.article-table|\.gtable|\.conj-table|\.table-wrap table)\s+th\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', "color:$tc")

            # --- footer dark bg ---
            $c = [regex]::Replace($c, '(?<=footer\s*\{[^}]{0,300})background:\s*(var\(--black\)|#1a1a18|var\(--green\)|var\(--teal\)|var\(--red\)|var\(--amber\))', 'background:#ffffff')
            $c = [regex]::Replace($c, '(?<=footer\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')

            # --- culture-strip dark bg ---
            $c = [regex]::Replace($c, '(?<=\.culture-strip\s*\{[^}]{0,300})background:\s*(var\(--black\)|#1a1a18)', "background:$hc")
            $c = [regex]::Replace($c, '(?<=\.culture-strip\s*\{[^}]{0,300})color:\s*(var\(--white\)|#fff|#ffffff)', 'color:#1a1a18')

            # For etapa3: update nav CSS and HTML
            if ($etapa -eq 'etapa3_gramatica') {
                # Replace NAV CSS
                $c = [regex]::Replace($c, '(?s)/\* NAV \*/.*?(?=/\*)', $navCssBlock)

                # Normalize nav tag
                $c = $c -replace '<nav class="sticky-nav"[^>]*>', '<nav>'
                $c = $c -replace '<nav id="[^"]*"[^>]*>', '<nav>'

                # Remove old logo spans
                $c = $c -replace '<span class="logo">[^<]*</span>\s*', ''

                # Wrap links in nav-inner + nav-links + logo
                $navPattern = '(?s)(<nav>)\s*((?:<a[^>]*>.*?</a>\s*)+)(</nav>)'
                $c = [regex]::Replace($c, $navPattern, {
                    param($match)
                    $links = $match.Groups[2].Value.Trim()
                    $nl = [System.Environment]::NewLine
                    return "<nav>${nl}  <div class=""nav-inner"">${nl}    $logoHtml${nl}    <div class=""nav-links"">${nl}      $links${nl}    </div>${nl}  </div>${nl}</nav>"
                })

                # Fix JS
                $c = $c.Replace("querySelectorAll('.sticky-nav a')", "querySelectorAll('.nav-links a')")
                $c = $c.Replace('querySelectorAll(".sticky-nav a")', 'querySelectorAll(".nav-links a")')
                $c = $c.Replace("querySelectorAll('nav a')", "querySelectorAll('.nav-links a')")
                $c = $c.Replace('querySelectorAll("nav a")', 'querySelectorAll(".nav-links a")')
            }

            Set-Content $path -Value $c -Encoding UTF8 -NoNewline
            Write-Host "${lbl} OK: modulo_$m/$etapa"
        }
    }
}

Write-Host ""
Write-Host "ALL A1 GROUPS DONE"
