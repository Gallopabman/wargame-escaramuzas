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
- **Crítico:** por ahora, un dado es crítico cuando sale un 6 natural. Más
  adelante habrá otras formas de conseguir críticos sin sacar un 6.
  [PENDIENTE: ¿el dado extra puede volver a explotar?]
- Los modificadores pueden ser **negativos** (p. ej. una armadura pesada
  con Esquiva −1).

## 3. Ronda y activación

Cada ronda tiene cuatro fases, en este orden:

### 3.1 Iniciativa
- Cada jugador tira **1D6**; el más alto gana la iniciativa.
- **Empate:** gana el jugador que **no tuvo la iniciativa en la ronda
  anterior**. En la primera ronda, se vuelve a tirar.

### 3.2 Fase de órdenes
- Los jugadores pueden usar **órdenes**: habilidades que afectan a **toda la
  banda** (p. ej. +1 para combatir cuerpo a cuerpo).
- [PENDIENTE: esta fase se desarrollará por completo más adelante; quién
  da órdenes primero, cuántas, de dónde salen]

### 3.3 Fase de activaciones
- El jugador con la iniciativa elige una de sus miniaturas y la **activa**.
  Cuando termina, el otro jugador activa una de las suyas, y así
  sucesivamente hasta que **todas las miniaturas se hayan activado**.
- Una miniatura activada realiza hasta tantas acciones como su estadística
  *Acciones*.
- [PENDIENTE: qué ocurre si un bando tiene más miniaturas sin activar que el
  otro (se resolverá con la mecánica de reacciones, pendiente de explicar);
  cómo encajan las reacciones con las activaciones]

### 3.4 Fase de mantenimiento
- Se resuelven los efectos que duran en el tiempo: se aplica el daño de
  **veneno**, se retiran los efectos de **control** (aturdido, inmovilizado…)
  que terminen, etc.
- [PENDIENTE: lista de efectos y cuándo terminan]

### 3.5 Fin de la partida
- La **duración** de la partida y **cómo se gana** los determina el
  **escenario** (ver `04_escenarios_especiales.md`).

## 4. Reacciones

- **Contra un disparo:** el objetivo puede **reaccionar gastando 1 de sus
  propias acciones** de la ronda, si le quedan, para **Bloquear** o
  **Esquivar** (5.2). Las acciones gastadas en reaccionar ya no se pueden usar
  en su propia activación.
- **Contra un ataque cuerpo a cuerpo:** **siempre combaten los dos**
  (combate mutuo, 5.3). No cuesta acciones al defensor, y también combate una
  miniatura que ya haya gastado todas sus acciones.

## 5. Combate

### 5.1 Disparar
1. Elige un objetivo **visible** (5.1.1) dentro del *Alcance* del arma.
2. Tira **3D6**. Suma a cada dado el *Atributo* **y la *Precisión*** del arma.
3. Cada dado que alcanza el umbral (6) es un **éxito**.
4. Si el objetivo no se defiende (5.2), **cada éxito es un impacto** que
   hace el *Daño* del arma (ver 6. Daño).
5. **Distancia:** no hay penalizaciones. Si el objetivo está dentro del
   *Alcance*, se puede disparar; si no, no.
6. **Acciones:** disparar cuesta 1 acción. Se puede **moverse y disparar** en
   la misma activación, y también **disparar dos veces**.

#### 5.1.1 Línea de visión
- Para que una miniatura sea un **objetivo válido**, traza una línea desde la
  **cabeza** del tirador hasta **cualquier parte** del objetivo, sin contar
  armas, estandartes, capas y elementos similares.

#### 5.1.2 Cobertura
- Traza una línea recta desde el **centro de la peana** del tirador hasta el
  **centro de la peana** del objetivo. Si la línea no es **recta e
  ininterrumpida**, el objetivo tiene **cobertura**.
- **Efecto:** por cada éxito del tirador, el objetivo tira **1D6**; con
  **5+**, ese éxito queda anulado. No cuesta acciones.
- La tirada de cobertura se hace **al final**, después de que el objetivo
  haya intentado defenderse (5.2).

#### 5.1.3 Disparar a un combate
- **No se puede elegir como objetivo a una miniatura trabada en combate**,
  pero sí se puede **disparar al combate**.
- Si en el combate participa un **aliado** del tirador:
  - El tirador **pierde 1 de Lealtad**.
  - El objetivo **no puede defenderse** del disparo.
  - Tras resolver el ataque, tira **1D6 una sola vez para todos los
    impactos**: con **1–3** impactan a tu aliado;
    con **4–6**, al enemigo.
- Si en el combate **no participa ningún aliado**, se resuelve igual pero
  **sin perder Lealtad**; los jugadores deciden qué miniatura corresponde a
  1–3 y cuál a 4–6.
- La **Lealtad** se definirá en el modo campaña.

### 5.2 Defenderse de un disparo
- Para defenderse de un disparo, el objetivo debe **gastar 1 de sus
  acciones** de la ronda (si le quedan). Una miniatura que ya se ha activado
  puede defenderse si **guardó una acción** para ello. Si no lo hace, cada éxito del
  tirador es un impacto.
- Se defiende **igual que en el combate mutuo**: tira 3D6 y usa cada dado
  contra un dado de disparo con éxito:
  - **Bloquear** (dado + *Parada* ≥ 6): ese dado de disparo **queda
    anulado**. Un dado de disparo **crítico** solo se bloquea con otro
    **crítico**. Los disparos **solo se pueden bloquear** con un arma o
    habilidad que lo permita (un escudo sí; una espada no).
  - **Esquivar** (dado + Agilidad ± *Esquiva* de la armadura): anula el dado
    de disparo si **iguala o supera ese dado + el Atributo y la Precisión**
    del tirador. Al terminar, el defensor puede moverse **2"**, acabando a la
    misma distancia o más lejos del tirador.

### 5.3 Combate mutuo (cuerpo a cuerpo)
Siempre que una miniatura ataca a otra cuerpo a cuerpo, **ambas combaten**:
los dados no se tiran para "pegar", sino para combatir, y cada jugador decide
en el momento qué hace con cada uno.

1. **Ambos jugadores tiran 3D6 a la vez** (más los dados por superioridad
   numérica, 5.5).
2. **Empieza siempre quien inicia el combate** (quien ataca o carga).
3. **Por turnos, alternando, cada jugador asigna un dado** a una de estas
   opciones. El modificador se elige después de tirar, según la opción:
   - **Golpear** (dado + *Atributo* + *Precisión* del arma): si es un éxito, es un
     impacto.
   - **Parar** (dado + *Parada* del arma o escudo ≥ 6): elige un dado del
     rival que aún no haya usado; **ambos dados desaparecen**. Un dado
     **crítico** del rival solo se puede parar con otro **crítico**.
   - **Esquivar** (dado + Agilidad ± *Esquiva* de la armadura): elige un
     dado del rival que aún no haya usado. Si tu resultado **iguala o supera
     ese dado + el Atributo y la Precisión del rival**, **ambos dados
     desaparecen**. Ejemplo: el rival tiene un 5 y golpea con Fuerza 3 →
     necesitas 8. Con un 3 en tu dado y Agilidad 5 (sin penalizador de
     armadura): 3 + 5 = 8 → esquivas.
     - Las armaduras suelen dar Esquiva **negativa**: cuanto más pesada y
       robusta, más cuesta moverse.
4. **Defensa reactiva** [A PROBAR]: cuando el rival declara un golpe, puedes
   gastar **al momento** uno de tus dados para **pararlo o esquivarlo** (con
   las mismas condiciones), sin perder tu turno de asignar. Si no reaccionas,
   el golpe impacta. También puedes parar o esquivar en tu turno.
5. **No se puede pasar ni guardar dados:** en tu turno tienes que asignar un
   dado. Si no te sirve para nada, puedes gastarlo parando o esquivando "a la
   nada".
6. Ejemplo de reparto: con +2 al golpe y +4 a la esquiva, un 2 no sirve
   para golpear (2+2=4) pero sí para esquivar un dado bajo del rival.

### 5.4 Cargar
- Cuesta **2 acciones**.
- La miniatura se mueve hasta quedar a **1"** del objetivo e **inicia el
  combate** (no hay que pagar el ataque aparte).
- **Distancia de carga:** el Movimiento del personaje **+ 1D3 + 1** pulgadas.
  El 1D3 se tira con un D6: 1–2 = 1, 3–4 = 2, 5–6 = 3.

### 5.5 Varios contra uno
- Con **un aliado** ayudando, el combatiente con superioridad numérica puede
  **repetir un dado** después de tirar.
- Con **dos aliados**, puede **repetir un dado y además tira un dado extra**
  (4 dados en total).
- **Ayudar** es estar **trabado con el defensor**. Cada personaje trabado con
  el defensor, además del que combate, cuenta como una ayuda. El que está
  combatiendo no cuenta como ayuda.
- El **máximo son 2 ayudas**: un tercer aliado trabado ya no da más bonus.

### 5.6 Salir de un combate
- Salir de un combate **no cuesta nada extra**: se hace con una acción de
  **Moverse** normal, tirando antes **Agilidad difícil (8)**: cada dado +
  Agilidad; basta **un éxito**. Tienes **−1 por cada enemigo trabado contigo
  además del primero**.
- Si lo superas, te vas sin más.
- Si fallas, **te quedas trabado** y **uno** de los enemigos trabados contigo
  puede, si quiere, **iniciar un combate gratis** contra ti.
- Si te has salido de un combate, **no puedes cargar ese turno**.

## 6. Daño

- **Cada impacto** hace el *Daño* del arma.
- Si el objetivo lleva armadura con Durabilidad, se resta su **Reducción** al
  daño de ese impacto y la armadura pierde **1 de Durabilidad**, también si
  el impacto ha quedado en 0. Con Durabilidad 0, la armadura queda
  inutilizada.
- El daño restante se descuenta de la **Vitalidad**.
- **Vida 0:** el personaje queda **fuera de combate** y se retira de la mesa.

## 7. Moral
[PENDIENTE]
