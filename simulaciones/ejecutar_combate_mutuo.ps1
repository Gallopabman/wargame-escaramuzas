# Ejecuta la simulación del combate mutuo con perfiles de prueba.
# Perfil(nombre, golpe, parada, esquiva, daño, dureza, durabilidad, velocidad)
#   golpe   = estadística del Modificador + Hit del arma
#   parada  = Fuerza + Parry
#   esquiva = Agilidad + Esquiva de la armadura
Add-Type -Path "$PSScriptRoot\combate_mutuo.cs"

# Guerrero: Fue 4, Agi 2, espada (Fue, Hit 0, Daño 3, Vel 2) + escudo (Parry +2),
#           armadura pesada (Esquiva -1, Dureza 2, Durabilidad 3)
$guerrero = [Perfil]::new("Guerrero", 4, 6, 1, 3, 2, 3, 2)
# Asesino: Fue 2, Agi 4, dagas (Agi, Hit +1, Daño 2, Parry -1, Vel 4),
#          armadura ligera (Esquiva +1, Dureza 1, Durabilidad 2)
$asesino = [Perfil]::new("Asesino", 5, 1, 5, 2, 1, 2, 4)
# Bruto: Fue 5, Agi 1, hacha a dos manos (Fue, Hit -1, Daño 5, Parry 0, Vel 1),
#        armadura media (Esquiva 0, Dureza 1, Durabilidad 3)
$bruto = [Perfil]::new("Bruto", 4, 5, 1, 5, 1, 3, 1)

$n = 20000
$duelos = @(
    @($guerrero, $asesino, $false), @($asesino, $guerrero, $false),
    @($guerrero, $bruto, $false), @($asesino, $bruto, $false),
    @($guerrero, $guerrero, $false), @($asesino, $guerrero, $true)
)
foreach ($gas in $false, $true) {
    foreach ($d in $duelos) {
        [CombateMutuo]::new($d[0], $d[1], $gas).Ejecutar($n, $d[2])
    }
}
