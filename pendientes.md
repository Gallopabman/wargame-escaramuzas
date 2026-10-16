# Pendientes y preguntas abiertas

## Concepto
- [ ] Título del juego.
- [ ] Duración objetivo de una partida.
- [ ] ¿Solo 2 jugadores o también 3–4?
- [ ] ¿Gremios en lugar de facciones? Si es así, ¿un gremio admite cualquier
      raza (un esqueleto asesino en Las Hojas Afiladas) o cada gremio
      pertenece a una raza o facción?

## Tiradas
- [ ] ¿El dado extra del 6 natural puede volver a explotar?

## Combate
- [ ] ¿Se suma la *Precisión* del arma además del *Atributo*?
- [ ] Cargar: distancia máxima (¿igual al Movimiento?).
- [ ] Combate mutuo: ¿se puede pasar el turno guardando dados para esquivar?
- [ ] Reaccionar en cuerpo a cuerpo reduce mucho el daño recibido (v1 y v2).
      Riesgo de juego pasivo: nadie ataca a quien aún tiene acciones.
      Probarlo con una simulación de activación completa.
- [ ] Armas de Daño 2 contra Reducción 2 no hacen nada en un intercambio (v1).
- [ ] Armadura: ¿un impacto reducido a 0 gasta Durabilidad? ¿Se repara?
- [ ] Qué ocurre con Vitalidad 0.

## Ronda
- [ ] Quién empieza, fin de ronda, fin de partida.
- [ ] Activación alternada con bandas desiguales (4 contra 8 miniaturas).
- [ ] ¿Una miniatura ya activada puede reaccionar con acciones sobrantes?
- [ ] ¿Para qué sirven Fuerza, Agilidad, Magia y Mente fuera de las armas?

## Amenaza (IA)
- [ ] ¿Aparece físicamente en las batallas, solo en la campaña o en ambas?
- [ ] ¿Cómo se gana o se pierde contra ella? (reloj, condiciones de derrota)
- [ ] ¿Cómo se incentiva cooperar sin eliminar la rivalidad?
- [ ] ¿Cuándo actúa durante una partida?

## Constructor de bandas
- [ ] Sistema de puntos.

## Equilibrio (de la simulación v2)
- [ ] Saltos de vida y daño: 1 punto de Reducción puede cambiar cuántos golpes
      hacen falta para matar. Tenerlo en cuenta al fijar Vida y Daño.
- [ ] ¿Quieres que matar de un golpe (Daño ≥ Vida) sea posible?
- [ ] Armas ligeras (Daño 2) contra armadura: necesitan Críticos o venenos.
- [ ] Simulación del hacha (`simulaciones/resultados_hacha.txt`): +1 de Daño
      vale mucho más que +3 de Parada. Parar casi no se usa. ¿Cómo hacer que
      parar valga la pena?
- [ ] R1 D1, R1 D2 y R2 D1 dan resultados idénticos en un combate porque no
      cambian los golpes necesarios para matar. ¿Subir la escala de Vida
      para que cada punto cuente?
- [ ] Duelo directo hacha contra espada (`simulaciones/resultados_hacha_vs_espada_fue3.txt`
      y `_fue4.txt`): con R1 D1 la espada gana al hacha. Pero parar se usa
      poco (2–10%) porque esquivar compite por los mismos dados y, con
      Agilidad igual a la Fuerza rival, basta con sacar igual o más que el
      dado rival.
- [ ] Rangos propuestos de Precisión, Esquiva, Daño, Reducción y
      Durabilidad (ver `02_equipo_habilidades.md`).
- [ ] Espada de Daño 1 con escudo contra hacha con cuero R1 D1
      (`simulaciones/resultados_espada_escudo.txt`): el hacha gana el 90–99%
      de los combates a muerte. Daño 1 contra Reducción 1 no funciona.
- [ ] **Propuesta: defensa reactiva.** Al declarar el rival un golpe, puedes
      gastar al momento un dado para pararlo o esquivarlo, sin perder tu
      turno. Con ella aparecen los arquetipos (el tanque para un 47%, el ágil
      esquiva un 42%) y los combates duran más
      (`simulaciones/resultados_arquetipos_*.txt`).
- [ ] Con Vida de 2 a 5, Daño 3 es demasiado letal: ¿Daño 1–2 normal y 3
      como extremo?
