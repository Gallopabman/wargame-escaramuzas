# Ejecuta la simulación del combate mutuo (v2) con perfiles de prueba.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
#   golpe   = Atributo del arma + Precisión
#   parada  = Parada del arma o escudo
#   esquiva = Agilidad (sin armadura; la armadura se aplica con .Con)
param([int]$n = 10000, [string]$salida = "$PSScriptRoot\resultados_combate_mutuo_v2.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

# Bases sin armadura
# Soldado:   Fue 3, Agi 3, espada (Fue, Prec 0, Daño 3, Parada +2, Vel 2), Vida 6
# Asesino:   Fue 2, Agi 5, dagas (Agi, Prec 0, Daño 2, Parada 0, Vel 4), Vida 5
# Bruto:     Fue 5, Agi 1, hacha a dos manos (Fue, Prec -1, Daño 5, Parada +1, Vel 1), Vida 8
# Caballero: Fue 4, Agi 2, espada y escudo (Fue, Prec 0, Daño 3, Parada +4, Vel 2), Vida 7
$soldado   = [Perfil]::new("Soldado",   3, 2, 3, 3, 0, 0, 2, 6)
$asesino   = [Perfil]::new("Asesino",   5, 0, 5, 2, 0, 0, 4, 5)
$bruto     = [Perfil]::new("Bruto",     4, 1, 1, 5, 0, 0, 1, 8)
$caballero = [Perfil]::new("Caballero", 4, 4, 2, 3, 0, 0, 2, 7)

# Variantes de armadura: nombre, Reducción, Durabilidad, Esquiva, vida (0 = la de la base)
$variantes = @(
    @("sin armadura", 0, 0, 0, 0),
    @("R1 D1 (ligera, Esq 0)", 1, 1, 0, 0),
    @("R1 D3 (media, Esq -1)", 1, 3, -1, 0),
    @("R2 D3 (pesada, Esq -2)", 2, 3, -2, 0),
    @("vida 1, sin armadura", 0, 0, 0, 1)
)
function Variante($p, $v) {
    $vida = if ($v[4] -gt 0) { $v[4] } else { $p.vida }
    $p.Con("$($p.nombre) $($v[0])", $v[1], $v[2], $v[3], $vida)
}
function Fila($a, $b, $r, $extra) {
    "{0,-12} -> {1,-38}{2,-14} | sin reacc: {3,4:0.0} dmg {4,4:0%} muere | mutuo: def {5,4:0.0} dmg {6,4:0%} muere, atac {7,4:0.0} dmg {8,4:0%} muere | def usa G{9,4:0%} P{10,4:0%} E{11,4:0%} | atac usa G{12,4:0%} P{13,4:0%} E{14,4:0%}" -f `
        $a.nombre, $b.nombre, $extra, $r.danoSinReaccion, $r.muereSinReaccion,
        $r.dano[1], $r.muere[1], $r.dano[0], $r.muere[0],
        $r.uso[1,0], $r.uso[1,1], $r.uso[1,2], $r.uso[0,0], $r.uso[0,1], $r.uso[0,2]
}

$out = @("== 1. Variantes de armadura y vida del defensor (empieza el arma más rápida) ==")
foreach ($a in $soldado, $asesino, $bruto, $caballero) {
    foreach ($b in $soldado, $asesino, $bruto) {
        foreach ($v in $variantes) {
            $d = Variante $b $v
            $out += Fila $a $d ([CombateMutuo]::new($a, $d, $false).Ejecutar($n, -1, 3)) ""
        }
    }
    $out += ""
}

# Bases con su armadura típica para la prueba de carga
$soldadoA   = $soldado.Con("Soldado R1D3", 1, 3, -1, 6)
$brutoA     = $bruto.Con("Bruto R1D1", 1, 1, 0, 8)
$caballeroA = $caballero.Con("Caballero R2D3", 2, 3, -2, 7)
$out += "== 2. Carga: quién empieza el combate mutuo =="
$out += "   [atac empieza] = carga actual; [def empieza] = sin carga, rival más rápido; [carga +1 dado] = propuesta"
foreach ($a in $soldadoA, $asesino, $brutoA, $caballeroA) {
    foreach ($b in $soldadoA, $asesino, $brutoA, $caballeroA) {
        $out += Fila $a $b ([CombateMutuo]::new($a, $b, $false).Ejecutar($n, 0, 3)) "[atac empieza]"
        $out += Fila $a $b ([CombateMutuo]::new($a, $b, $false).Ejecutar($n, 1, 3)) "[def empieza]"
        $out += Fila $a $b ([CombateMutuo]::new($a, $b, $false).Ejecutar($n, 0, 4)) "[carga +1 dado]"
    }
    $out += ""
}

$out += "== 3. Esquiva con gasolina (dado extra) =="
foreach ($a in $soldadoA, $brutoA, $caballeroA) {
    $out += Fila $a $asesino ([CombateMutuo]::new($a, $asesino, $false).Ejecutar($n, -1, 3)) "[normal]"
    $out += Fila $a $asesino ([CombateMutuo]::new($a, $asesino, $true).Ejecutar($n, -1, 3)) "[gasolina]"
}

$out | Out-File -FilePath $salida -Encoding utf8 -Width 400
$out
