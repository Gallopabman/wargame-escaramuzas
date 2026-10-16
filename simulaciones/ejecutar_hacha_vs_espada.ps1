# Duelo directo: guerrero con hacha grande contra guerrero con espada.
# Mismo guerrero (Fuerza = parámetro -fue, Agi 3, Vida 6). Hacha: Daño 3, Parada -1, Vel 1.
# Espada: Daño 2, Parada +2, Vel 2. Sin penalizador de Esquiva por armadura.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
param([int]$n = 10000, [int]$fue = 4, [string]$salida = "$PSScriptRoot\resultados_hacha_vs_espada_fue$fue.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

$hacha  = [Perfil]::new("Hacha",  $fue, -1, 3, 3, 0, 0, 1, 6)
$espada = [Perfil]::new("Espada", $fue,  2, 3, 2, 0, 0, 2, 6)
$armaduras = @(@("sin arm.", 0, 0), @("R1 D1", 1, 1), @("R1 D2", 1, 2), @("R2 D1", 2, 1), @("R2 D2", 2, 2))

$out = @("Espada            vs Hacha            | Empieza | Espada: mata  muere  daño recibido | Hacha: daño recibido | Espada usa: Golpe Parada Esquiva")
foreach ($ah in $armaduras[0], $armaduras[1]) {
    $h = $hacha.Con("Hacha $($ah[0])", $ah[1], $ah[2], 0, 6)
    foreach ($ae in $armaduras) {
        $e = $espada.Con("Espada $($ae[0])", $ae[1], $ae[2], 0, 6)
        # Espada ataca (empieza) y hacha ataca (empieza)
        $r1 = [CombateMutuo]::new($e, $h, $false).Ejecutar($n, 0, 3)
        $r2 = [CombateMutuo]::new($h, $e, $false).Ejecutar($n, 0, 3)
        $out += "{0,-17} vs {1,-15} | Espada  | {2,11:0%} {3,6:0%} {4,10:0.0} | {5,15:0.0} | {6,10:0%} {7,6:0%} {8,7:0%}" -f `
            $e.nombre, $h.nombre, $r1.muere[1], $r1.muere[0], $r1.dano[0], $r1.dano[1], $r1.uso[0,0], $r1.uso[0,1], $r1.uso[0,2]
        $out += "{0,-17} vs {1,-15} | Hacha   | {2,11:0%} {3,6:0%} {4,10:0.0} | {5,15:0.0} | {6,10:0%} {7,6:0%} {8,7:0%}" -f `
            $e.nombre, $h.nombre, $r2.muere[0], $r2.muere[1], $r2.dano[1], $r2.dano[0], $r2.uso[1,0], $r2.uso[1,1], $r2.uso[1,2]
    }
    $out += ""
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 300
$out
