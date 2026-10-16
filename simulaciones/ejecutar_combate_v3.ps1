# Combate v3: siempre combaten los dos, empieza quien inicia, defensa reactiva,
# reglas especiales (Doble parada, Doble golpe, Rompearmaduras) y +1 dado por
# cada aliado que ayuda. Dos escalas:
#   A: Vida 2-5, Daño 1-3.   B: Vida 4-10, Daño 2-5.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
# (la velocidad ya no se usa; se deja a 0)
param([int]$n = 3000, [int]$maxIntercambios = 12, [ValidateSet("A", "B")][string]$escala = "A",
      [string]$salida = "$PSScriptRoot\resultados_combate_v3_escala$escala.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

if ($escala -eq "A") {
    $arquetipos = @(
        # Fue 4, Agi 2, hacha grande (Daño 3, Parada -1, Rompearmaduras), cuero R1 D1, Vida 4
        [Perfil]::new("Dañino (hacha)", 4, -1, 2, 3, 1, 1, 0, 4).Especial("R"),
        # Fue 3, Agi 2, espada (Daño 1) y escudo (Parada +3, Doble parada), malla R1 D3 Esq -1, Vida 5
        [Perfil]::new("Tanque (escudo)", 3, 3, 1, 1, 1, 3, 0, 5).Especial("P"),
        # Fue 2, Agi 5, dagas (Agi, Daño 1, Parada 0, Doble golpe), sin armadura, Vida 3
        [Perfil]::new("Ágil (dagas)", 5, 0, 5, 1, 0, 0, 0, 3).Especial("G"),
        # Fue 3, Agi 3, espada larga (Daño 2, Parada +2), cuero R1 D1, Vida 4
        [Perfil]::new("Equilibrado (espada)", 3, 2, 3, 2, 1, 1, 0, 4)
    )
    $vidaBase = 4
    $armas = @(@("espada larga (D2 P+2)", 3, 2, 2, ""), @("espada y escudo (D1 P+3)", 3, 3, 1, "P"),
               @("hacha grande (D3 P-1)", 3, -1, 3, "R"), @("dagas (D1 P0)", 3, 0, 1, "G"))
    $armad = @(@("sin armadura", 0, 0, 0), @("cuero R1 D1", 1, 1, 0), @("malla R1 D3 Esq-1", 1, 3, -1))
} else {
    $arquetipos = @(
        [Perfil]::new("Dañino (hacha)", 4, -1, 2, 4, 1, 1, 0, 7).Especial("R"),
        [Perfil]::new("Tanque (escudo)", 3, 3, 1, 2, 2, 3, 0, 10).Especial("P"),
        [Perfil]::new("Ágil (dagas)", 5, 0, 5, 2, 0, 0, 0, 5).Especial("G"),
        [Perfil]::new("Equilibrado (espada)", 3, 2, 3, 3, 1, 1, 0, 7)
    )
    $vidaBase = 7
    $armas = @(@("espada larga (D3 P+2)", 3, 2, 3, ""), @("espada y escudo (D2 P+3)", 3, 3, 2, "P"),
               @("hacha grande (D4 P-1)", 3, -1, 4, "R"), @("hacha devastadora (D5 P-2)", 3, -2, 5, "R"),
               @("dagas (D2 P0)", 3, 0, 2, "G"))
    $armad = @(@("sin armadura", 0, 0, 0), @("cuero R1 D1", 1, 1, 0), @("malla R2 D3 Esq-1", 2, 3, -1))
}
function Nuevo($a, $b) { $c = [CombateMutuo]::new($a, $b, $false); $c.reactiva = $true; $c }

$out = @("######## COMBATE v3 - ESCALA $escala ########", "")
foreach ($a in $arquetipos) {
    $out += "{0,-21} golpe +{1}  parada {2:+0;-0;0}  esquiva {3:+0;-0;0}  Daño {4}  armadura R{5} D{6}  Vida {7}  especial: {8}" -f `
        $a.nombre, $a.golpe, $a.parada, $a.esquiva, $a.dano, $a.reduccion, $a.durabilidad, $a.vida,
        (@(if ($a.dobleParada) { "Doble parada" }; if ($a.dobleGolpe) { "Doble golpe" }; if ($a.rompeArmadura) { "Rompearmaduras" }) -join ", ")
}
$out += ""
$out += "== A. Letalidad: % de combates en que alguien muere en el intercambio 1.º / 2.º / 3.º / 4.º o más =="
$est = @{}
foreach ($a in $arquetipos) { $est[$a.nombre] = @{ dec = 0.0; aj = 0.0; coste = 0.0; inter = 0.0; uso = @(0.0) * 8 } }
foreach ($i in 0..3) {
    foreach ($j in $i..3) {
        $a = $arquetipos[$i]; $b = $arquetipos[$j]
        $c1 = Nuevo $a $b; $d1 = $c1.Duelo($n, $maxIntercambios); $r1 = $c1.ultimoDuelo
        $c2 = Nuevo $b $a; $d2 = $c2.Duelo($n, $maxIntercambios); $r2 = $c2.ultimoDuelo
        $m = @(); foreach ($k in 4..7) { $m += ($d1[$k] + $d2[$k]) / 2 }
        $out += "{0,-21} vs {1,-21} | {2,4:0%} / {3,4:0%} / {4,4:0%} / {5,4:0%} | media {6:0.0} intercambios | gana {0}: {7:0%}" -f `
            $a.nombre, $b.nombre, $m[0], $m[1], $m[2], $m[3], (($d1[3] + $d2[3]) / 2), (($d1[0] + $d2[1]) / 2)
        foreach ($par in @(@($a, $r1, 0, $d1), @($b, $r1, 1, $d1), @($b, $r2, 0, $d2), @($a, $r2, 1, $d2))) {
            $e = $est[$par[0].nombre]; $r = $par[1]; $p = $par[2]
            $e.dec += $r.decisiones[$p]; $e.aj += $r.ajustadas[$p]; $e.coste += $r.coste[$p]
            $e.inter += $par[3][3] * $n
            for ($k = 0; $k -lt 8; $k++) { $e.uso[$k] += $r.uso[$p, $k] }
        }
    }
}
$out += ""
$out += "== B. Elección real =="
$out += "Arquetipo             | decisiones con elección por intercambio | ajustadas (<1 pto) | coste medio de elegir la otra opción"
foreach ($a in $arquetipos) {
    $e = $est[$a.nombre]
    $out += "{0,-21} | {1,39:0.0} | {2,18:0%} | {3,8:0.00}" -f $a.nombre, ($e.dec / $e.inter), ($e.aj / [Math]::Max(1, $e.dec)), ($e.coste / [Math]::Max(1, $e.dec))
}
$out += ""
$out += "Qué hace cada uno con sus dados (golpear / parar en su turno / esquivar en su turno / parar reaccionando / esquivar reaccionando / no reacciona a un golpe)"
foreach ($a in $arquetipos) {
    $u = $est[$a.nombre].uso; $t = $u[0] + $u[1] + $u[2] + $u[6] + $u[7] + $u[4]
    $out += "{0,-21} | G {1,4:0%} | P {2,4:0%} | E {3,4:0%} | P-reac {4,4:0%} | E-reac {5,4:0%} | encaja {6,4:0%}" -f `
        $a.nombre, ($u[0] / $t), ($u[1] / $t), ($u[2] / $t), ($u[6] / $t), ($u[7] / $t), ($u[4] / $t)
}
$out += ""
$out += "== C. Peso de las decisiones: experto contra jugador que siempre golpea (mismo personaje) =="
foreach ($a in $arquetipos) {
    $c1 = Nuevo $a $a; $c1.ingenuo[1] = $true; $d1 = $c1.Duelo($n, $maxIntercambios)
    $c2 = Nuevo $a $a; $c2.ingenuo[0] = $true; $d2 = $c2.Duelo($n, $maxIntercambios)
    $out += "{0,-21} | el experto gana {1,4:0%} (empezando {2:0%}, sin empezar {3:0%})" -f $a.nombre, (($d1[0] + $d2[1]) / 2), $d1[0], $d2[1]
}
$out += ""
$out += "== D. Peso del equipo: personaje Fue 3, Agi 3, Vida $vidaBase contra los 4 arquetipos (% de victorias) =="
foreach ($w in $armas) {
    foreach ($ar in $armad) {
        $p = [Perfil]::new("$($w[0]) + $($ar[0])", $w[1], $w[2], 3 + $ar[3], $w[3], $ar[1], $ar[2], 0, $vidaBase).Especial($w[4])
        $fila = "{0,-46}" -f $p.nombre; $tot = 0
        foreach ($b in $arquetipos) {
            $d1 = (Nuevo $p $b).Duelo($n, $maxIntercambios); $d2 = (Nuevo $b $p).Duelo($n, $maxIntercambios)
            $g = ($d1[0] + $d2[1]) / 2; $tot += $g
            $fila += " | {0,-11} {1,4:0%}" -f $b.nombre.Split(" ")[0], $g
        }
        $out += $fila + (" | MEDIA {0,4:0%}" -f ($tot / 4))
    }
}
$out += ""
$out += "== E. Superioridad numérica: el que tiene ayuda tira +1 dado por aliado =="
foreach ($par in @(@(3, 3), @(4, 3), @(5, 3))) {
    foreach ($a in $arquetipos[3], $arquetipos[1]) {
        foreach ($b in $arquetipos[3], $arquetipos[0]) {
            $c1 = Nuevo $a $b; $c1.dados = [int[]]$par; $d1 = $c1.Duelo($n, $maxIntercambios)
            $c2 = Nuevo $b $a; $c2.dados = [int[]]@($par[1], $par[0]); $d2 = $c2.Duelo($n, $maxIntercambios)
            $out += "{0,-21} con {1} dados vs {2,-21} con {3} dados | gana {0}: {4,4:0%}" -f $a.nombre, $par[0], $b.nombre, $par[1], (($d1[0] + $d2[1]) / 2)
        }
    }
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 400
$out
