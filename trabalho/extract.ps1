Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('trabalho/AV3-UJ.docx')
$e = $z.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$s = $e.Open()
$r = New-Object System.IO.StreamReader($s)
$t = $r.ReadToEnd()
$r.Close()
$s.Close()
$z.Dispose()
$clean = [System.Text.RegularExpressions.Regex]::Replace($t, '<w:p[^>]*>', "`r`n")
$clean = [System.Text.RegularExpressions.Regex]::Replace($clean, '<[^>]+>', ' ')
$clean = [System.Text.RegularExpressions.Regex]::Replace($clean, ' +', ' ')
[System.IO.File]::WriteAllText('trabalho/conteudo.txt', $clean, [System.Text.Encoding]::UTF8)
Write-Output "Extracao concluida com sucesso!"
