# ¿El problema del Ágil es la daga o el arquetipo?
# El mismo personaje ágil (Fue 2, Agi 5) con distintas armas, armaduras y vida,
# contra los 4 arquetipos de la v3 (escala A). Además, prueba del apoyo con
# dado de suerte.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
param([int]$n = 2000, [int]$maxIntercambios = 12, [string]$salida = "$PSScriptRoot\resultados_agil.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

$arquetipos = @(
    [Perfil]::new("Dañino (hacha)", 4, -1, 2, 3, 1, 1, 0, 4).Especial("R"),
    [Perfil]::new("Tanque (escudo)", 3, 3, 1, 1, 1, 3, 0, 5).Especial("P"),
    [Perfil]::new("Ágil (dagas)", 5, 0, 5, 1, 0, 0, 0, 3).Especial("G"),
    [Perfil]::new("Equilibrado (espada)", 3, 2, 3, 2, 1, 1, 0, 4)
)
function Nuevo($a, $b) { $c = [CombateMutuo]::new($a, $b, $false); $c.reactiva = $true; $c }
function Media($p) {
    $fila = "{0,-44}" -f $p.nombre; $tot = 0
    foreach ($b in $arquetipos) {
        $d1 = (Nuevo $p $b).Duelo($n, $maxIntercambios); $d2 = (Nuevo $b $p).Duelo($n, $maxIntercambios)
        $g = ($d1[0] + $d2[1]) / 2; $tot += $g
        $fila += " | {0,-11} {1,4:0%}" -f $b.nombre.Split(" ")[0], $g
    }
    $fila + (" | MEDIA {0,4:0%}" -f ($tot / 4))
}

# Armas: nombre, golpe (Fue 2 o Agi 5 según el Atributo), Parada, Daño, especial
$armas = @(
    @("dagas (Agi, D1, Doble golpe)", 5, 0, 1, "G"),
    @("dagas (Agi, D2, Doble golpe)", 5, 0, 2, "G"),
    @("estoque (Agi, D2 P+2)", 5, 2, 2, ""),
    @("espada larga (Fue, D2 P+2)", 2, 2, 2, ""),
    @("hacha grande (Fue, D3 P-1, Rompe)", 2, -1, 3, "R"),
    @("espada y escudo (Fue, D1 P+3, Doble par.)", 2, 3, 1, "P"),
    @("estoque y escudo (Agi, D1 P+3, Doble par.)", 5, 3, 1, "P")
)
# Armaduras: nombre, Reducción, Durabilidad, Esquiva
$armad = @(@("sin arm.", 0, 0, 0), @("cuero R1 D1", 1, 1, 0))

$out = @("######## EL ÁGIL CON DISTINTO EQUIPO (Fue 2, Agi 5) ########",
         "Nota: 'estoque' es un arma inventada que golpea con Agilidad, para separar el efecto del Atributo del de la daga.", "")
foreach ($vida in 3, 4) {
    $out += "== Vida $vida =="
    foreach ($w in $armas) {
        foreach ($ar in $armad) {
            $p = [Perfil]::new("$($w[0]) + $($ar[0])", $w[1], $w[2], 5 + $ar[3], $w[3], $ar[1], $ar[2], 0, $vida).Especial($w[4])
            $out += Media $p
        }
    }
    $out += ""
}

$out += "== Apoyo de aliados: 1 apoyo = dado de suerte; 2 apoyos = 4 dados =="
$casos = @(@("sin apoyo", 3, $false), @("1 apoyo (suerte)", 3, $true), @("2 apoyos (4 dados)", 4, $false))
foreach ($caso in $casos) {
    foreach ($a in $arquetipos[3], $arquetipos[1], $arquetipos[2]) {
        foreach ($b in $arquetipos[3], $arquetipos[0]) {
            $c1 = Nuevo $a $b; $c1.dados = [int[]]@($caso[1], 3); $c1.suerte = [bool[]]@($caso[2], $false); $d1 = $c1.Duelo($n, $maxIntercambios)
            $c2 = Nuevo $b $a; $c2.dados = [int[]]@(3, $caso[1]); $c2.suerte = [bool[]]@($false, $caso[2]); $d2 = $c2.Duelo($n, $maxIntercambios)
            $out += "{0,-21} {1,-19} vs {2,-21} | gana {0}: {3,4:0%}" -f $a.nombre, $caso[0], $b.nombre, (($d1[0] + $d2[1]) / 2)
        }
    }
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 400
$out
