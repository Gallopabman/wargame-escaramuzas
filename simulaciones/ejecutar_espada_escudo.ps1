# Espada (Daño 1) y escudo contra hacha grande (Daño 3) con armadura de cuero.
# Ambos: Fuerza 3, Agilidad 3, Vida 6.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
param([int]$n = 10000, [int]$maxIntercambios = 10, [string]$salida = "$PSScriptRoot\resultados_espada_escudo.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

# Hacha grande: Daño 3, Parada -1, Vel 1; cuero R1 D1 sin penalizador de Esquiva
$hacha = [Perfil]::new("Hacha (cuero R1 D1)", 3, -1, 3, 3, 1, 1, 1, 6)
# Espada y escudo: Daño 1, Vel 2; Parada +2 (solo escudo) o +4 (espada + escudo)
$variantes = @(
    [Perfil]::new("Espada+escudo P+2, sin arm.", 3, 2, 3, 1, 0, 0, 2, 6),
    [Perfil]::new("Espada+escudo P+4, sin arm.", 3, 4, 3, 1, 0, 0, 2, 6),
    [Perfil]::new("Espada+escudo P+2, R1 D1",    3, 2, 3, 1, 1, 1, 2, 6),
    [Perfil]::new("Espada+escudo P+4, R1 D1",    3, 4, 3, 1, 1, 1, 2, 6)
)

$out = @("== Un intercambio ==",
         "Espada                       | Empieza | Espada: mata  muere | daño hecho  recibido | Espada usa: Golpe Parada Esquiva | Hacha usa: Golpe Esquiva")
foreach ($e in $variantes) {
    $r1 = [CombateMutuo]::new($e, $hacha, $false).Ejecutar($n, 0, 3)
    $r2 = [CombateMutuo]::new($hacha, $e, $false).Ejecutar($n, 0, 3)
    $out += "{0,-28} | Espada  | {1,11:0%} {2,6:0%} | {3,10:0.0} {4,9:0.0} | {5,17:0%} {6,6:0%} {7,7:0%} | {8,15:0%} {9,7:0%}" -f `
        $e.nombre, $r1.muere[1], $r1.muere[0], $r1.dano[1], $r1.dano[0], $r1.uso[0,0], $r1.uso[0,1], $r1.uso[0,2], $r1.uso[1,0], $r1.uso[1,2]
    $out += "{0,-28} | Hacha   | {1,11:0%} {2,6:0%} | {3,10:0.0} {4,9:0.0} | {5,17:0%} {6,6:0%} {7,7:0%} | {8,15:0%} {9,7:0%}" -f `
        $e.nombre, $r2.muere[0], $r2.muere[1], $r2.dano[0], $r2.dano[1], $r2.uso[1,0], $r2.uso[1,1], $r2.uso[1,2], $r2.uso[0,0], $r2.uso[0,2]
}

$out += ""
$out += "== Combate a muerte (hasta $maxIntercambios intercambios, alternando quién ataca) =="
$out += "Espada                       | Ataca primero | Gana espada  Gana hacha  Nadie muere | Intercambios de media"
foreach ($e in $variantes) {
    $d1 = [CombateMutuo]::new($e, $hacha, $false).Duelo($n, $maxIntercambios)
    $d2 = [CombateMutuo]::new($hacha, $e, $false).Duelo($n, $maxIntercambios)
    $out += "{0,-28} | Espada        | {1,11:0%} {2,11:0%} {3,12:0%} | {4,8:0.0}" -f $e.nombre, $d1[0], $d1[1], $d1[2], $d1[3]
    $out += "{0,-28} | Hacha         | {1,11:0%} {2,11:0%} {3,12:0%} | {4,8:0.0}" -f $e.nombre, $d2[1], $d2[0], $d2[2], $d2[3]
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 300
$out
