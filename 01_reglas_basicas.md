# Reglas básicas

> Lo marcado como **[PENDIENTE]** está sin decidir o es ambiguo (ver `pendientes.md`).
> Lo marcado como **[A PROBAR]** está decidido pero se revisará con simulaciones.

## 1. Perfil de una miniatura

Cada miniatura tiene las siguientes estadísticas:

| Estadística | Qué representa |
|---|---|
| **Fuerza** | Potencia física. Se usa para parar. |
| **Agilidad** | Rapidez y destreza. Se usa para esquivar. |
| **Magia** | Capacidad mágica. |
| **Mente** | Voluntad e intelecto. |
| **Vitalidad** | Puntos de vida. |
| **Acciones** | Número de acciones por activación. |
| **Movimiento** | Pulgadas que mueve al usar la acción *Moverse*. |
| **Especial** | Reglas especiales de la miniatura (ver `02_equipo_habilidades.md`). |

- Fuerza, Agilidad, Magia y Mente van de **1 a 5**. Solo pueden llegar a
  **6** mediante magia o habilidades.
- Lo normal son **2 acciones**. Esbirros e invocaciones tienen **1**; algunas
  élites tienen **3**.
- [PENDIENTE: usos de Magia y Mente]

## 2. Tiradas

- **Siempre se tiran 3D6**, salvo que una regla indique otra cosa.
- **Cada dado es una tirada independiente**: los dados no se suman entre sí.
- A cada dado se le suma el modificador que corresponda. Si el resultado
  alcanza o supera el **umbral**, ese dado es un **éxito**.
- El umbral es **6** salvo que una regla indique otra cosa:

| Dificultad | Umbral |
|---|---|
| Común (por defecto) | 6 |
| Difícil | 8 |
| Compleja | 10 |
| Imposible | 12 |

- **1 natural: siempre es un fallo.**
- **6 natural: siempre es un éxito.** Además, permite **tirar un dado extra**
  y **activa el Crítico** del arma.
  [PENDIENTE: ¿el dado extra puede volver a explotar?]
- Los modificadores pueden ser **negativos** (p. ej. una armadura pesada
  con Esquiva −1).

## 3. Ronda y activación

- **Activación alternada:** cada jugador elige una miniatura y la activa;
  después el otro jugador hace lo mismo, y así sucesivamente.
- Una miniatura activada realiza hasta tantas acciones como su estadística
  *Acciones*.
- [PENDIENTE: quién empieza la ronda; qué ocurre si un bando tiene más
  miniaturas sin activar que el otro; fin de ronda y fin de partida]

## 4. Reacciones

- Cuando una miniatura es objetivo de un **disparo** o de un **ataque cuerpo
  a cuerpo**, puede **reaccionar gastando 1 de sus propias acciones** de la
  ronda, siempre que le queden acciones disponibles.
- Las acciones gastadas en reaccionar ya no se pueden usar en su propia
  activación.
- **Contra un disparo:** reacciona con **Bloquear** o **Esquivar** (5.2).
- **Contra un ataque cuerpo a cuerpo:** la reacción inicia un **combate
  mutuo** (5.3).

## 5. Combate

### 5.1 Ataque sin reacción (disparo o cuerpo a cuerpo)
1. Elige un objetivo dentro del *Alcance* del arma (cuerpo a cuerpo: a 1" o
   menos) y el arma que usas.
2. Tira **3D6**. Suma a cada dado la estadística del *Atributo* del arma.
   [PENDIENTE: ¿se suma también la *Precisión* del arma?]
3. Cada dado que alcanza el umbral (6) es un **éxito**.
4. **Cada éxito es un impacto** que hace el *Daño* del arma (ver 6. Daño).

### 5.2 Reacción contra un disparo
El defensor gasta 1 acción, elige **antes de tirar** si bloquea o esquiva, y
tira 3D6. **Cada éxito del defensor anula un éxito del atacante.**

- **Bloquear:** cada dado + *Parada* del arma o escudo. Los disparos
  **solo se pueden bloquear** con un arma o habilidad que lo permita (un
  escudo sí; una espada no).
- **Esquivar:** cada dado + Agilidad + *Esquiva* de la armadura. Al terminar
  la acción, el defensor puede moverse **2"**, pero debe acabar a la misma
  distancia o más lejos del atacante.

### 5.3 Combate mutuo (cuerpo a cuerpo)
Cuando el objetivo de un ataque cuerpo a cuerpo reacciona, **ambos
combaten**: los dados no se tiran para "pegar", sino para combatir, y cada
jugador decide en el momento qué hace con cada uno.

1. **Ambos jugadores tiran 3D6 a la vez.**
2. **Orden:** si alguien **cargó**, empieza él (se ignora la Velocidad). Si
   no, empieza quien tenga más **Velocidad** en su arma; con empate, el
   **jugador activo**.
3. **Por turnos, alternando, cada jugador asigna un dado** a una de estas
   opciones. El modificador se elige después de tirar, según la opción:
   - **Golpear** (dado + *Atributo* del arma): si es un éxito, es un
     impacto.
   - **Parar** (dado + *Parada* del arma o escudo ≥ 6): elige un dado del
     rival que aún no haya usado; **ambos dados desaparecen**. Un **6
     natural** del rival solo se puede parar con un **6 natural**.
   - **Esquivar** (dado + Agilidad ± *Esquiva* de la armadura): elige un
     dado del rival que aún no haya usado. Si tu resultado **iguala o supera
     ese dado + el Atributo de golpe del rival**, **ambos dados
     desaparecen**. Ejemplo: el rival tiene un 5 y golpea con Fuerza 3 →
     necesitas 8. Con un 3 en tu dado y Agilidad 5 (sin penalizador de
     armadura): 3 + 5 = 8 → esquivas.
     - Las armaduras suelen dar Esquiva **negativa**: cuanto más pesada y
       robusta, más cuesta moverse.
4. **Un golpe declarado impacta directamente.** La defensa consiste en
   eliminar los dados del rival (parando o esquivando) antes de que los use.
5. Ejemplo de reparto: con +2 al golpe y +4 a la esquiva, un 2 no sirve
   para golpear (2+2=4) pero sí para esquivar un dado bajo del rival.

### 5.4 Cargar
- Cuesta **2 acciones**.
- La miniatura se mueve hasta quedar a **1"** del objetivo e **inicia el
  combate** (no hay que pagar el ataque aparte).
- Quien carga empieza el combate mutuo, sin importar la Velocidad.
- [PENDIENTE: distancia máxima de carga; ¿es igual al Movimiento?]

## 6. Daño

- **Cada impacto** hace el *Daño* del arma.
- Si el objetivo lleva armadura con Durabilidad, se resta su **Reducción** al
  daño de ese impacto y la armadura pierde **1 de Durabilidad**. Con
  Durabilidad 0, la armadura queda inutilizada.
- El daño restante se descuenta de la **Vitalidad**.
- [PENDIENTE: ¿un impacto que la armadura reduce a 0 también gasta
  Durabilidad? Propuesta: sí.]
- [PENDIENTE: qué pasa al llegar a Vitalidad 0]

## 7. Moral
[PENDIENTE]
