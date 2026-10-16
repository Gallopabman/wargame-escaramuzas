# Arquetipos con Vida de 2 a 5: todos contra todos.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
#   golpe = Atributo del arma + Precisión; parada = Parada de UN arma o escudo;
#   esquiva = Agilidad + Esquiva de la armadura.
param([int]$n = 10000, [int]$maxIntercambios = 12, [switch]$reactiva, [int]$danoHacha = 3, [string]$salida = "$PSScriptRoot\resultados_arquetipos.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"
function Nuevo($a, $b) { $c = [CombateMutuo]::new($a, $b, $false); $c.reactiva = $reactiva.IsPresent; $c }

$arquetipos = @(
    # Dañino: Fue 4, Agi 2, hacha grande (Fue, Daño 3, Parada -1, Vel 1), cuero R1 D1 (Esq 0), Vida 4
    [Perfil]::new("Dañino (hacha)", 4, -1, 2, $danoHacha, 1, 1, 1, 4),
    # Tanque: Fue 3, Agi 2, espada (Daño 1) y escudo (Parada +3), cota de malla R1 D3 (Esq -1), Vida 5
    [Perfil]::new("Tanque (escudo)", 3, 3, 1, 1, 1, 3, 2, 5),
    # Ágil: Fue 2, Agi 5, dagas (Agi, Daño 1, Parada 0, Vel 4), sin armadura, Vida 3
    [Perfil]::new("Ágil (dagas)", 5, 0, 5, 1, 0, 0, 4, 3),
    # Equilibrado: Fue 3, Agi 3, espada larga (Fue, Daño 2, Parada +2, Vel 2), cuero R1 D1 (Esq 0), Vida 4
    [Perfil]::new("Equilibrado (espada)", 3, 2, 3, 2, 1, 1, 2, 4)
)

$out = @("== Defensa reactiva: $($reactiva.IsPresent) | Daño del hacha: $danoHacha ==", "== Combate a muerte (hasta $maxIntercambios intercambios; media de que empiece cada uno) ==",
         "Fila contra columna: % de victorias de la fila.  [x.x] = intercambios de media")
$cab = "{0,-22}" -f ""
foreach ($b in $arquetipos) { $cab += " | {0,-20}" -f $b.nombre }
$out += $cab
$uso = @{}
foreach ($a in $arquetipos) { $uso[$a.nombre] = @(0.0, 0.0, 0.0) }
foreach ($a in $arquetipos) {
    $fila = "{0,-22}" -f $a.nombre
    foreach ($b in $arquetipos) {
        $d1 = (Nuevo $a $b).Duelo($n, $maxIntercambios)
        $d2 = (Nuevo $b $a).Duelo($n, $maxIntercambios)
        $gana = ($d1[0] + $d2[1]) / 2; $nadie = ($d1[2] + $d2[2]) / 2; $inter = ($d1[3] + $d2[3]) / 2
        $fila += " | {0,5:0%} [{1,4:0.0}] {2,4:0%}=" -f $gana, $inter, $nadie
        # Uso de opciones en un intercambio (ambos órdenes)
        foreach ($r in (Nuevo $a $b).Ejecutar($n, 0, 3), (Nuevo $a $b).Ejecutar($n, 1, 3)) {
            for ($k = 0; $k -lt 3; $k++) { $uso[$a.nombre][$k] += $r.uso[0, $k] }
        }
    }
    $out += $fila
}
$out += "  (x%= es el % de combates en que nadie muere en $maxIntercambios intercambios)"
$out += ""
$out += "== Qué hace cada arquetipo con sus dados útiles (media contra todos los rivales) =="
foreach ($a in $arquetipos) {
    $u = $uso[$a.nombre]; $t = $u[0] + $u[1] + $u[2]
    $out += "{0,-22} | Golpear {1,4:0%} | Parar {2,4:0%} | Esquivar {3,4:0%}" -f $a.nombre, ($u[0] / $t), ($u[1] / $t), ($u[2] / $t)
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 300
$out
