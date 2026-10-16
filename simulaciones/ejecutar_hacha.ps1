# Prueba del hacha grande (Daño 3, Parada -1) frente a una espada (Daño 2, Parada +2)
# con distintas armaduras. Quien ataca carga, así que siempre empieza el atacante.
# Perfil(nombre, golpe, parada, esquiva, daño, reducción, durabilidad, velocidad, vida)
param([int]$n = 10000, [string]$salida = "$PSScriptRoot\resultados_hacha.txt")
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

# Guerrero: Fue 4, Agi 3, Vida 6
$hacha  = [Perfil]::new("Hacha",  4, -1, 3, 3, 0, 0, 1, 6)
$espada = [Perfil]::new("Espada", 4,  2, 3, 2, 0, 0, 2, 6)

# Armaduras: nombre, Reducción, Durabilidad (sin penalizador de Esquiva en esta prueba)
$armaduras = @(@("sin armadura", 0, 0), @("R1 D1", 1, 1), @("R1 D2", 1, 2), @("R2 D1", 2, 1), @("R2 D2", 2, 2))

# Rivales (mismos perfiles que la v2)
$rivales = @(
    [Perfil]::new("Soldado", 3, 2, 3, 3, 0, 0, 2, 6),
    [Perfil]::new("Soldado", 3, 2, 3, 3, 0, 0, 2, 6).Con("Soldado R1D3", 1, 3, -1, 6),
    [Perfil]::new("Asesino", 5, 0, 5, 2, 0, 0, 4, 5),
    [Perfil]::new("Bruto",   4, 1, 1, 5, 0, 0, 1, 8).Con("Bruto R1D1", 1, 1, 0, 8),
    [Perfil]::new("Caballero", 4, 4, 2, 3, 0, 0, 2, 7).Con("Caballero R2D3", 2, 3, -2, 7)
)

$out = @("Arma/armadura        | Rival           | ATACA: mata  muere | DEFIENDE: mata  muere | usa Parada  Esquiva")
foreach ($arma in $hacha, $espada) {
    foreach ($a in $armaduras) {
        $g = $arma.Con("$($arma.nombre) $($a[0])", $a[1], $a[2], 0, $arma.vida)
        foreach ($r in $rivales) {
            $at = [CombateMutuo]::new($g, $r, $false).Ejecutar($n, 0, 3)
            $de = [CombateMutuo]::new($r, $g, $false).Ejecutar($n, 0, 3)
            $out += "{0,-20} | {1,-15} |  {2,9:0%} {3,6:0%} |    {4,9:0%} {5,6:0%} |   {6,8:0%} {7,8:0%}" -f `
                $g.nombre, $r.nombre, $at.muere[1], $at.muere[0], $de.muere[0], $de.muere[1],
                (($at.uso[0,1] + $de.uso[1,1]) / 2), (($at.uso[0,2] + $de.uso[1,2]) / 2)
        }
        $out += ""
    }
}
$out | Out-File -FilePath $salida -Encoding utf8 -Width 300
$out
