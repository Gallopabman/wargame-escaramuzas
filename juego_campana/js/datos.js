// Datos del juego. Basado en el diseño del repositorio (reglas, campaña,
// gremios); lo que el diseño aún no define está inventado para este juego.
var JG = globalThis.JG = globalThis.JG || {};

JG.DATOS = (function () {
  // ---------- Equipo ----------
  // cat: cc (cuerpo a cuerpo), dist (distancia), escudo, armadura, consumible.
  // tier: 1 y 2 se compran (el 2 desde que se abre); 3 solo se consigue en
  // batallas o mazmorras. bestia: equipo natural que no se compra ni se quita.
  var equipo = {
    // Cuerpo a cuerpo
    daga: { cat: "cc", nombre: "Daga", atr: "agi", dano: 1, parada: 0, prec: 0, esp: ["dobleGolpe"], tier: 1, coste: 5, icono: "daga" },
    espada: { cat: "cc", nombre: "Espada", atr: "fue", dano: 2, parada: 2, prec: 0, esp: [], tier: 1, coste: 25, icono: "espadas" },
    estoque: { cat: "cc", nombre: "Estoque", atr: "agi", dano: 2, parada: 1, prec: 0, esp: [], tier: 1, coste: 35, icono: "espadas" },
    hacha: { cat: "cc", nombre: "Hacha de mano", atr: "fue", dano: 2, parada: 0, prec: 0, esp: ["rompe"], tier: 1, coste: 25, icono: "hacha" },
    hachaGrande: { cat: "cc", nombre: "Hacha grande", atr: "fue", dano: 3, parada: -1, prec: 0, esp: ["rompe", "dosManos"], tier: 1, coste: 70, icono: "hacha" },
    maza: { cat: "cc", nombre: "Maza", atr: "fue", dano: 2, parada: 1, prec: 0, esp: [], tier: 1, coste: 30, icono: "mazo" },
    lanza: { cat: "cc", nombre: "Lanza de caza", atr: "fue", dano: 2, parada: 1, prec: 1, esp: [], tier: 1, coste: 35, icono: "alabarda" },
    dagasVeneno: { cat: "cc", nombre: "Dagas envenenadas", atr: "agi", dano: 1, parada: 0, prec: 0, esp: ["dobleGolpe", "veneno"], tier: 2, coste: 45, icono: "veneno" },
    alabarda: { cat: "cc", nombre: "Alabarda", atr: "fue", dano: 3, parada: 1, prec: -1, esp: ["dosManos"], tier: 2, coste: 75, icono: "alabarda" },
    garfio: { cat: "cc", nombre: "Garfio oxidado", atr: "fue", dano: 2, parada: 0, prec: 0, esp: ["rompe", "veneno"], tier: 2, coste: 55, icono: "trampa" },
    martillo: { cat: "cc", nombre: "Martillo de pistón", atr: "fue", dano: 3, parada: 0, prec: -1, esp: ["rompe", "dosManos"], tier: 2, coste: 80, icono: "martillo" },
    sable: { cat: "cc", nombre: "Sable de duelista", atr: "agi", dano: 2, parada: 2, prec: 1, esp: [], tier: 2, coste: 70, icono: "espadas" },
    hojaEclipse: { cat: "cc", nombre: "Hoja del Eclipse", atr: "agi", dano: 3, parada: 1, prec: 1, esp: ["dobleGolpe"], tier: 3, coste: 160, icono: "luna" },
    hachaRey: { cat: "cc", nombre: "Hacha del Rey Enano", atr: "fue", dano: 3, parada: 0, prec: 1, esp: ["rompe", "dosManos"], tier: 3, coste: 160, icono: "hacha" },
    espadaRunica: { cat: "cc", nombre: "Espada rúnica", atr: "fue", dano: 3, parada: 2, prec: 1, esp: [], tier: 3, coste: 170, icono: "emblema" },
    // Armas naturales de bestias
    colmillos: { cat: "cc", nombre: "Colmillos", atr: "agi", dano: 2, parada: 0, prec: 1, esp: ["dobleGolpe"], tier: 1, coste: 0, bestia: true, icono: "lobo" },
    zarpas: { cat: "cc", nombre: "Zarpas", atr: "fue", dano: 3, parada: 0, prec: 0, esp: [], tier: 1, coste: 0, bestia: true, icono: "lobo" },

    // Distancia
    cuchillos: { cat: "dist", nombre: "Cuchillos arrojadizos", atr: "agi", dano: 1, prec: 0, alcance: 8, esp: [], tier: 1, coste: 10, icono: "daga" },
    arco: { cat: "dist", nombre: "Arco", atr: "agi", dano: 1, prec: 1, alcance: 18, esp: [], tier: 1, coste: 20, icono: "arco" },
    ballesta: { cat: "dist", nombre: "Ballesta", atr: "agi", dano: 2, prec: 0, alcance: 16, esp: ["lenta"], tier: 1, coste: 35, icono: "ballesta" },
    trabuco: { cat: "dist", nombre: "Trabuco", atr: "agi", dano: 2, prec: 0, alcance: 10, esp: ["lenta"], tier: 1, coste: 35, icono: "ballesta" },
    baculo: { cat: "dist", nombre: "Báculo de tinta", atr: "mag", dano: 1, prec: 0, alcance: 12, esp: ["magia", "perfora", "lenta"], tier: 1, coste: 30, icono: "baculo" },
    bilis: { cat: "dist", nombre: "Vómito bilioso", atr: "agi", dano: 1, prec: 0, alcance: 8, esp: ["veneno"], tier: 1, coste: 0, bestia: true, icono: "veneno" },
    arcoLargo: { cat: "dist", nombre: "Arco largo", atr: "agi", dano: 2, prec: 0, alcance: 24, esp: [], tier: 2, coste: 55, icono: "arco" },
    pistola: { cat: "dist", nombre: "Pistola de rueda", atr: "agi", dano: 2, prec: 1, alcance: 12, esp: ["rompe", "lenta"], tier: 2, coste: 60, icono: "engranaje" },
    grimorio: { cat: "dist", nombre: "Grimorio de sangre", atr: "mag", dano: 2, prec: 0, alcance: 12, esp: ["magia", "perfora", "lenta"], tier: 2, coste: 80, icono: "libro" },
    arcoDragon: { cat: "dist", nombre: "Arco de hueso de dragón", atr: "agi", dano: 3, prec: 1, alcance: 24, esp: [], tier: 3, coste: 170, icono: "dragon" },

    // Escudos (se usa su Parada si es mejor que la del arma)
    escudo: { cat: "escudo", nombre: "Escudo", parada: 3, esp: ["doblePar"], tier: 1, coste: 25, icono: "escudo" },
    pavés: { cat: "escudo", nombre: "Pavés", parada: 3, esquiva: -1, esp: ["doblePar", "cubre"], tier: 2, coste: 50, icono: "escudo" },
    egida: { cat: "escudo", nombre: "Égida del Juramento", parada: 3, prec: 1, esp: ["doblePar"], tier: 3, coste: 150, icono: "fortaleza" },

    // Armaduras
    acolchada: { cat: "armadura", nombre: "Armadura acolchada", red: 1, dur: 1, esquiva: 0, tier: 1, coste: 10, icono: "mochila" },
    cuero: { cat: "armadura", nombre: "Cuero", red: 1, dur: 2, esquiva: 0, tier: 1, coste: 20, icono: "mochila" },
    malla: { cat: "armadura", nombre: "Cota de malla", red: 1, dur: 3, esquiva: -1, tier: 1, coste: 40, icono: "yelmo" },
    capaSombras: { cat: "armadura", nombre: "Capa de sombras", red: 0, dur: 0, esquiva: 1, esp: ["sombras"], tier: 2, coste: 45, icono: "luna" },
    tachonado: { cat: "armadura", nombre: "Cuero tachonado", red: 1, dur: 3, esquiva: 0, tier: 2, coste: 55, icono: "mochila" },
    placas: { cat: "armadura", nombre: "Armadura de placas", red: 2, dur: 3, esquiva: -2, tier: 2, coste: 75, icono: "yelmo" },
    escamas: { cat: "armadura", nombre: "Escamas de dragón", red: 2, dur: 4, esquiva: 0, tier: 3, coste: 180, icono: "dragon" },
    pielGruesa: { cat: "armadura", nombre: "Piel gruesa", red: 1, dur: 3, esquiva: 0, tier: 1, coste: 0, bestia: true, icono: "lobo" },

    // Consumibles (se usan solos en batalla)
    pocion: { cat: "consumible", nombre: "Poción curativa", desc: "En batalla, cura 2 de Vida cuando quedas a 1.", tier: 1, coste: 15, icono: "corazon" },
    antidoto: { cat: "consumible", nombre: "Antídoto", desc: "Anula el veneno la primera vez que te envenenan.", tier: 1, coste: 10, icono: "veneno" },
    elixir: { cat: "consumible", nombre: "Elixir de furia", desc: "+1 a golpear durante toda la batalla.", tier: 2, coste: 30, icono: "caldero" }
  };

  // ---------- Habilidades ----------
  var habilidades = {
    // Gremios
    sombras: { nombre: "Perderse en las Sombras", desc: "Los disparos contra esta miniatura siempre tienen cobertura." },
    espalda: { nombre: "Golpe por la Espalda", desc: "+1 daño al golpear si un aliado ayuda en el combate." },
    marca: { nombre: "Marca de Muerte", desc: "Al empezar la batalla marca al líder enemigo: su banda tiene +1 a golpear contra él." },
    muro: { nombre: "Muro de Escudos", desc: "+1 a Parar si hay otro aliado a 2\"." },
    cargaInq: { nombre: "Carga Inquebrantable", desc: "Al cargar, repite un dado en ese combate." },
    desafio: { nombre: "Desafío Personal", desc: "+1 dado al combatir contra el líder enemigo." },
    nube: { nombre: "Nube Miasmática", desc: "Los enemigos que combaten con esta miniatura tienen −1 a golpear." },
    contagio: { nombre: "Contagio", desc: "Sus impactos cuerpo a cuerpo envenenan, aunque la armadura absorba el daño (1 daño en el mantenimiento)." },
    estallido: { nombre: "Estallido Bilioso", desc: "Al caer, causa 1 daño a cada enemigo a 1\"." },
    botin: { nombre: "Botín de Guerra", desc: "+3 Influencia por cada enemigo que la banda deja fuera de combate." },
    retirada: { nombre: "Retirada Táctica", desc: "+1 dado para salir de un combate y +1 a esquivar disparos." },
    cambio: { nombre: "Cambio de Bando", desc: "La banda contrata mercenarios a mitad de precio." },
    palabra: { nombre: "Palabra de Poder", desc: "Sus ataques mágicos no se pueden bloquear con escudo." },
    sello: { nombre: "Sello de Contención", desc: "Una vez por batalla: tirada de Magia difícil (8) para aturdir a un enemigo a 12\"." },
    eco: { nombre: "Eco Arcano", desc: "+1 dado al lanzar ataques mágicos." },
    calibrado: { nombre: "Disparo Calibrado", desc: "+1 a disparar." },
    reparacion: { nombre: "Reparación de Campo", desc: "Una vez por batalla, restaura 2 de Durabilidad a la armadura de un aliado a 2\"." },
    trampa: { nombre: "Trampa Mecánica", desc: "El primer enemigo que la carga sufre 1 daño." },
    olfatear: { nombre: "Olfatear la Presa", desc: "Sus disparos ignoran la cobertura." },
    emboscada: { nombre: "Emboscada Salvaje", desc: "+3\" de Movimiento en la primera ronda." },
    aullido: { nombre: "Aullido de Manada", desc: "Cuenta como una ayuda extra si otro aliado está a 3\" del objetivo." },
    constructo: { nombre: "Constructo", desc: "Inmune al veneno." },
    bestia: { nombre: "Bestia", desc: "No usa equipo comprado." },
    // Genéricas (se aprenden al subir de nivel)
    reflejos: { nombre: "Reflejos", desc: "+1 a esquivar.", tier: 1, generica: true },
    punteria: { nombre: "Puntería", desc: "+1 a disparar.", tier: 1, generica: true },
    brazo: { nombre: "Brazo fuerte", desc: "+1 a golpear cuerpo a cuerpo.", tier: 1, generica: true },
    duro: { nombre: "Duro de matar", desc: "+1 en la tabla de heridas.", tier: 1, generica: true },
    veloz: { nombre: "Veloz", desc: "+2\" de Movimiento.", tier: 1, generica: true },
    guardia: { nombre: "Guardia férrea", desc: "+1 a Parar.", tier: 2, generica: true },
    certero: { nombre: "Golpe certero", desc: "+1 daño contra objetivos sin armadura activa.", tier: 2, generica: true },
    furia: { nombre: "Furia", desc: "+1 dado al cargar.", tier: 2, generica: true },
    maestro: { nombre: "Maestro de armas", desc: "+1 a golpear y +1 a Parar.", tier: 3, generica: true },
    imparable: { nombre: "Imparable", desc: "Ignora el primer impacto de cada batalla.", tier: 3, generica: true },
    halcon: { nombre: "Ojo de halcón", desc: "Sus disparos ignoran la cobertura.", tier: 3, generica: true }
  };

  // ---------- Gremios y datacards ----------
  // Datacard: fue, agi, mag, men (1-5), vida (2-5), acc (puntos de acción),
  // mov (pulgadas), equipo inicial, habilidades, coste de reclutar (Influencia).
  function dc(nombre, fue, agi, mag, men, vida, acc, mov, eq, hab, coste, extra) {
    var d = { nombre: nombre, fue: fue, agi: agi, mag: mag, men: men, vida: vida, acc: acc, mov: mov,
      equipo: eq, hab: hab, coste: coste };
    for (var k in extra || {}) d[k] = extra[k];
    return d;
  }

  var gremios = [
    {
      id: "asesinos", nombre: "Las Hojas Afiladas", oficio: "Asesinos", color: "#9b59b6", icono: "asesinos",
      base: "Las Alcantarillas", edificioInicial: "almacen",
      lema: "Nadie nos ve llegar. Nadie nos ve marchar.",
      desc: "Rápidos, ágiles y letales con armas ligeras. Frágiles si los atrapan.",
      habGremio: ["sombras", "espalda", "marca"],
      datacards: {
        lider: dc("Maestro de la Hermandad", 2, 5, 1, 3, 4, 3, 7, ["estoque", "cuchillos", "capaSombras"], ["sombras", "marca"], 0, { lider: true }),
        hoja: dc("Hoja del Velo", 2, 5, 1, 2, 4, 2, 7, ["estoque", "cuero"], ["sombras", "espalda"], 25),
        envenenador: dc("Envenenador", 2, 5, 1, 3, 3, 2, 6, ["dagasVeneno", "cuchillos"], ["espalda", "sombras"], 35),
        acechador: dc("Acechador", 3, 3, 1, 2, 4, 2, 6, ["estoque", "ballesta", "cuero"], ["sombras"], 35)
      },
      bandaInicial: ["lider", "hoja", "hoja", "envenenador", "acechador"],
      prioridad: ["agi", "vida", "fue", "men"]
    },
    {
      id: "caballeros", nombre: "La Orden del Juramento de Hierro", oficio: "Caballeros", color: "#d4a73a", icono: "caballeros",
      base: "La Ciudadela del Juramento", edificioInicial: "patio",
      lema: "El acero no retrocede.",
      desc: "Armaduras pesadas y escudos. Lentos pero casi imposibles de tumbar.",
      habGremio: ["muro", "cargaInq", "desafio"],
      datacards: {
        lider: dc("Comendador", 3, 2, 1, 3, 4, 3, 5, ["espada", "escudo", "malla"], ["muro", "cargaInq", "desafio"], 0, { lider: true }),
        caballero: dc("Caballero juramentado", 4, 2, 1, 2, 3, 2, 5, ["espada", "escudo", "malla"], ["muro", "cargaInq"], 45),
        escudero: dc("Escudero", 3, 3, 1, 2, 3, 2, 6, ["espada", "escudo", "acolchada"], ["muro"], 25),
        ballestero: dc("Ballestero de la Orden", 3, 3, 1, 2, 3, 2, 5, ["espada", "ballesta", "cuero"], [], 30)
      },
      bandaInicial: ["lider", "caballero", "caballero", "escudero", "ballestero"],
      prioridad: ["fue", "vida", "agi", "men"]
    },
    {
      id: "pestilentes", nombre: "El Coro de la Podredumbre", oficio: "Pestilentes", color: "#7fae3f", icono: "pestilentes",
      base: "El Lazareto Abandonado", edificioInicial: "laboratorio",
      lema: "Todo se pudre. Nosotros solo cantamos.",
      desc: "Aguantan, envenenan y explotan al morir. Desgastan al rival.",
      habGremio: ["nube", "contagio", "estallido"],
      datacards: {
        lider: dc("Gran Diácono", 4, 2, 2, 3, 5, 3, 5, ["maza", "malla"], ["nube", "contagio"], 0, { lider: true }),
        apestado: dc("Apestado", 4, 2, 1, 1, 5, 2, 5, ["hacha", "acolchada"], ["contagio", "estallido"], 20),
        sangrador: dc("Sangrador", 2, 4, 1, 2, 3, 2, 6, ["daga", "bilis"], ["nube"], 25),
        portador: dc("Portador de la Plaga", 4, 1, 1, 1, 5, 2, 4, ["hachaGrande", "cuero"], ["estallido", "nube"], 50)
      },
      bandaInicial: ["lider", "apestado", "apestado", "sangrador", "portador"],
      prioridad: ["vida", "fue", "agi", "men"]
    },
    {
      id: "mercenarios", nombre: "La Compañía del Último Contrato", oficio: "Mercenarios", color: "#c0703a", icono: "mercenarios",
      base: "La Taberna del Cuervo Ahorcado", edificioInicial: "sala",
      lema: "Pagas, peleamos. Pagas más, peleamos por ti.",
      desc: "Equilibrados y versátiles. Ganan dinero con cada baja.",
      habGremio: ["botin", "retirada", "cambio"],
      datacards: {
        lider: dc("Capitán de la Compañía", 4, 3, 1, 3, 4, 3, 6, ["espada", "ballesta", "malla"], ["botin", "retirada", "cambio"], 0, { lider: true }),
        veterano: dc("Veterano", 4, 3, 1, 2, 4, 2, 6, ["espada", "escudo", "cuero"], ["retirada"], 35),
        arquero: dc("Arquero a sueldo", 2, 4, 1, 2, 3, 2, 6, ["daga", "arco", "cuero"], ["retirada"], 25),
        maton: dc("Matón", 4, 2, 1, 1, 4, 2, 5, ["hachaGrande", "acolchada"], ["botin"], 40)
      },
      bandaInicial: ["lider", "veterano", "veterano", "arquero", "maton"],
      prioridad: ["fue", "agi", "vida", "men"]
    },
    {
      id: "hechiceros", nombre: "El Círculo de la Tinta Viva", oficio: "Hechiceros", color: "#3d8fd6", icono: "hechiceros",
      base: "La Biblioteca Prohibida", edificioInicial: "estudio",
      lema: "Toda palabra escrita es una herida esperando.",
      desc: "Atacan con Magia a distancia, protegidos por guardias de tinta.",
      habGremio: ["palabra", "sello", "eco"],
      datacards: {
        lider: dc("Archimago", 1, 3, 5, 4, 3, 3, 6, ["daga", "baculo", "acolchada"], ["palabra", "sello", "eco"], 0, { lider: true }),
        escriba: dc("Escriba de batalla", 2, 3, 4, 3, 3, 2, 6, ["daga", "baculo", "acolchada"], ["palabra", "eco"], 35),
        guardia: dc("Guardia de tinta", 4, 2, 1, 1, 5, 2, 5, ["maza", "escudo", "malla"], ["constructo", "muro"], 40),
        aprendiz: dc("Aprendiz", 2, 3, 3, 2, 2, 2, 6, ["daga", "baculo"], ["eco"], 15)
      },
      bandaInicial: ["lider", "escriba", "guardia", "guardia", "aprendiz"],
      prioridad: ["mag", "vida", "agi", "men"]
    },
    {
      id: "artificieros", nombre: "Los Hijos del Yunque", oficio: "Artificieros", color: "#d0582f", icono: "artificieros",
      base: "La Forja Subterránea", edificioInicial: "forja",
      lema: "Si se rompe, lo arreglamos. Si no se rompe, lo rompemos.",
      desc: "Pólvora, trampas y martillos que revientan armaduras.",
      habGremio: ["calibrado", "reparacion", "trampa"],
      datacards: {
        lider: dc("Maestro Forjador", 4, 3, 1, 4, 4, 3, 5, ["maza", "trabuco", "cuero"], ["calibrado", "reparacion"], 0, { lider: true }),
        fusilero: dc("Fusilero", 3, 3, 1, 2, 3, 2, 5, ["daga", "trabuco", "cuero"], ["calibrado"], 35),
        rompeescudos: dc("Rompeescudos", 4, 2, 1, 2, 3, 2, 5, ["martillo", "malla"], ["trampa"], 50),
        aprendizForja: dc("Aprendiz de forja", 3, 3, 1, 3, 3, 2, 6, ["hacha", "ballesta", "acolchada"], ["reparacion"], 25)
      },
      bandaInicial: ["lider", "fusilero", "fusilero", "rompeescudos", "aprendizForja"],
      prioridad: ["agi", "fue", "vida", "men"]
    },
    {
      id: "caceria", nombre: "La Cacería Salvaje", oficio: "Bestias y cazadores", color: "#3fa37a", icono: "caceria",
      base: "El Bosque Lindero", edificioInicial: "atalaya",
      lema: "Corre. Así es más divertido.",
      desc: "Lobos rápidos, un oso imparable y cazadores que ignoran la cobertura.",
      habGremio: ["olfatear", "emboscada", "aullido"],
      datacards: {
        lider: dc("Señor de la Cacería", 4, 4, 1, 3, 4, 3, 7, ["lanza", "arco", "cuero"], ["olfatear", "emboscada"], 0, { lider: true }),
        lobo: dc("Lobo de guerra", 3, 5, 0, 1, 3, 2, 8, ["colmillos"], ["aullido", "emboscada", "bestia"], 20, { bestia: true, nombreBestia: "Lobo" }),
        batidor: dc("Batidor", 2, 4, 1, 2, 3, 2, 7, ["daga", "arco", "cuero"], ["olfatear"], 25),
        oso: dc("Oso domado", 5, 1, 0, 1, 5, 2, 6, ["zarpas", "pielGruesa"], ["aullido", "bestia"], 50, { bestia: true, nombreBestia: "Oso" })
      },
      bandaInicial: ["lider", "lobo", "lobo", "batidor", "oso"],
      prioridad: ["agi", "fue", "vida", "men"]
    }
  ];

  // Mercenarios a sueldo para una sola batalla.
  var contratados = [
    dc("Espadachín a sueldo", 3, 3, 1, 2, 3, 2, 6, ["espada", "cuero"], [], 14, { id: "espadachin" }),
    dc("Ballestero a sueldo", 2, 4, 1, 2, 3, 2, 6, ["daga", "ballesta", "cuero"], [], 16, { id: "tirador" }),
    dc("Bruto a sueldo", 4, 2, 1, 1, 4, 2, 5, ["hachaGrande", "acolchada"], [], 22, { id: "bruto" })
  ];

  // ---------- Órdenes (consumibles de batalla, fase de órdenes) ----------
  var ordenes = {
    carga: { nombre: "¡A la carga!", desc: "Esta ronda, +1 a golpear cuerpo a cuerpo para toda la banda.", coste: 12, icono: "puno" },
    filas: { nombre: "¡Cerrad filas!", desc: "Esta ronda, +1 a Parar y a esquivar para toda la banda.", coste: 12, icono: "escudo" },
    fuego: { nombre: "¡Fuego a discreción!", desc: "Esta ronda, +1 a disparar para toda la banda.", coste: 10, icono: "diana" },
    adelante: { nombre: "¡Adelante!", desc: "Esta ronda, +2\" de Movimiento para toda la banda.", coste: 8, icono: "bota" }
  };

  // ---------- Edificios de la base ----------
  // Cada edificio permite hacer gratis el encargo equivalente, sin bloquear el
  // mapa. Nivel 2 (desde el tier 2): +50% de rendimiento.
  var edificios = {
    almacen: { nombre: "Almacén", encargo: "comerciar", coste: 35, desc: "Comerciar desde casa.", icono: "cofre" },
    patio: { nombre: "Patio de armas", encargo: "entrenar", coste: 35, desc: "Entrenar desde casa.", icono: "espadas" },
    laboratorio: { nombre: "Laboratorio", encargo: "alquimia", coste: 45, desc: "Preparar pociones.", icono: "caldero" },
    forja: { nombre: "Forja", encargo: "herreria", coste: 60, desc: "Forjar equipo.", icono: "yunque" },
    enfermeria: { nombre: "Enfermería", encargo: "curar", coste: 40, desc: "Curar heridas. Además, +1 en la tabla de heridas.", icono: "enfermeria" },
    estudio: { nombre: "Estudio", encargo: "estudiar", coste: 35, desc: "Estudiar desde casa.", icono: "libro" },
    atalaya: { nombre: "Atalaya", encargo: "contener", coste: 40, desc: "Vigilar la Niebla desde casa.", icono: "atalaya" },
    sala: { nombre: "Sala de reclutas", encargo: "reclutar", coste: 35, desc: "Buscar reclutas desde casa.", icono: "cerveza" }
  };

  // ---------- Locaciones del mapa (Fase de Encargos) ----------
  // tipo de encargo, tier en que se abre, coste en Influencia, riesgo (1D6 que
  // falla con ese valor o menos): rápido / lento.
  var locaciones = [
    { id: "mercado", nombre: "Mercado de los Ahorcados", encargo: "comerciar", tier: 1, coste: 3, riesgo: [2, 1], icono: "tienda" },
    { id: "guardia", nombre: "Patio de la Guardia", encargo: "entrenar", tier: 1, coste: 3, riesgo: [1, 0], icono: "espadas" },
    { id: "botica", nombre: "Botica del Alquimista", encargo: "alquimia", tier: 1, coste: 4, riesgo: [1, 0], icono: "caldero" },
    { id: "hospital", nombre: "Hospital de las Hermanas", encargo: "curar", tier: 1, coste: 4, riesgo: [0, 0], icono: "enfermeria", soloLento: true },
    { id: "muralla", nombre: "Muralla de Faroles", encargo: "contener", tier: 1, coste: 0, riesgo: [2, 1], icono: "atalaya" },
    { id: "templo", nombre: "Templo de la Llama Eterna", encargo: "contener", tier: 1, coste: 2, riesgo: [1, 0], icono: "fortaleza" },
    { id: "taberna", nombre: "Taberna del Cruce", encargo: "reclutar", tier: 1, coste: 3, riesgo: [1, 0], icono: "cerveza" },
    { id: "biblioteca", nombre: "Biblioteca del Cabildo", encargo: "estudiar", tier: 2, coste: 4, riesgo: [1, 0], icono: "libro" },
    { id: "herreria", nombre: "Herrería del Puente", encargo: "herreria", tier: 2, coste: 8, riesgo: [1, 0], icono: "yunque" },
    { id: "fondos", nombre: "Los Bajos Fondos", encargo: "contrabando", tier: 2, coste: 2, riesgo: [3, 2], icono: "calavera" },
    { id: "cripta", nombre: "Cripta de los Reyes Olvidados", encargo: "mazmorra", tier: 2, coste: 5, riesgo: [0, 0], icono: "mazmorra",
      soloLento: true, mazmorra: { dificultad: 17, tierBotin: 2, xp: 5, renombre: 2 }, evento: "cripta" },
    { id: "volcan", nombre: "Volcán del Wyrm", encargo: "mazmorra", tier: 3, coste: 8, riesgo: [0, 0], icono: "dragon",
      soloLento: true, mazmorra: { dificultad: 22, tierBotin: 3, xp: 8, renombre: 3 }, evento: "volcan" }
  ];

  var encargos = {
    comerciar: { nombre: "Comerciar", desc: "Gana 2D6 + 2×Mente de Influencia." },
    entrenar: { nombre: "Entrenar", desc: "Gana 3 + 1D3 de Experiencia." },
    alquimia: { nombre: "Alquimia", desc: "Consigue una poción (dos si Mente 4+)." },
    curar: { nombre: "Curar", desc: "Cura una herida grave de la miniatura (solo lento)." },
    contener: { nombre: "Contener la Niebla", desc: "Reduce la Amenaza en 1 + 1D3 (+1 con Mente 4+). En el mapa da además 1 de Renombre." },
    reclutar: { nombre: "Buscar reclutas", desc: "1 de cada 3 veces encuentra un recluta gratis; si no, 1D6 de Influencia." },
    estudiar: { nombre: "Estudiar", desc: "Gana 2 + Mente/2 de Experiencia (+2 con Magia 3+)." },
    herreria: { nombre: "Forjar", desc: "Consigue una pieza de equipo al azar del tier actual (tier 1 en la base)." },
    contrabando: { nombre: "Contrabando", desc: "Gana 3D6 + 2×Agilidad de Influencia. Muy arriesgado." },
    mazmorra: { nombre: "Explorar mazmorra", desc: "Hasta 2 miniaturas. Éxito: equipo de tier alto, Experiencia y Renombre." }
  };

  // ---------- Escenarios (fijan la duración y cómo se gana) ----------
  var escenarios = [
    { id: "choque", nombre: "Choque en el callejón", rondas: 5, cobertura: 0.5,
      desc: "5 rondas. 1 punto por cada enemigo fuera de combate; 2 si es el líder." },
    { id: "cargamento", nombre: "El cargamento", rondas: 6, cobertura: 0.5, objetivos: [[6, 12], [12, 12], [18, 12]],
      desc: "6 rondas. Desde la 2.ª ronda, 1 punto por cada cofre controlado al final de la ronda; 2 por el líder enemigo." },
    { id: "nocturna", nombre: "Emboscada nocturna", rondas: 4, cobertura: 1,
      desc: "4 rondas. Todos los disparos tienen cobertura. 1 punto por baja; 2 por el líder." }
  ];

  // ---------- Proezas (se tiran 2 antes de cada batalla) ----------
  var proezas = [
    { id: "matagigantes", nombre: "Matagigantes", desc: "Dejar fuera de combate a un enemigo con más Vida máxima.", titulo: "Matagigantes", mejora: "fue" },
    { id: "primera", nombre: "Primera sangre", desc: "Causar la primera baja de la batalla.", titulo: "Sanguinario", mejora: "agi" },
    { id: "intocable", nombre: "Intocable", desc: "Combatir 3 veces sin perder Vida.", titulo: "Intocable", mejora: "agi" },
    { id: "muro", nombre: "Muro viviente", desc: "Parar 4 dados o más en una batalla.", titulo: "Muro viviente", mejora: "vida" },
    { id: "aguila", nombre: "Ojo de águila", desc: "Dejar fuera de combate a 2 enemigos disparando.", titulo: "Ojo de águila", mejora: "agi" },
    { id: "verdugo", nombre: "Verdugo", desc: "Dejar fuera de combate a 2 enemigos en una batalla.", titulo: "Verdugo", mejora: "fue" },
    { id: "sangre", nombre: "Sangre fría", desc: "Terminar la batalla con 1 de Vida.", titulo: "Sangre fría", mejora: "men" },
    { id: "regicida", nombre: "Regicida", desc: "Dejar fuera de combate al líder enemigo.", titulo: "Regicida", mejora: "fue" }
  ];

  // ---------- La Amenaza ----------
  var amenaza = {
    nombre: "La Niebla Hambrienta",
    desc: "Una niebla gris que devora barrios enteros. Avanza cada sesión; si llena su medidor, la ciudad cae y todos los gremios pierden la campaña.",
    // Máximo del medidor según la duración de la campaña.
    maximo: function (sesiones) { return 10 + 3 * sesiones; },
    // Avance base por sesión: 6 + tier actual.
    avance: function (tier) { return 6 + tier; }
  };

  // ---------- Línea de tiempo (eventos fijos) ----------
  // Se calcula a partir de la duración: los tiers y las mazmorras se abren en
  // las mismas sesiones (tabla de 05_campana.md).
  var TIERS = { 4: [1, 2, 3], 8: [1, 3, 6], 12: [1, 5, 9] };
  function lineaDeTiempo(sesiones) {
    var t = TIERS[sesiones];
    var ev = {};
    function poner(s, e) { (ev[s] = ev[s] || []).push(e); }
    poner(1, { id: "inicio", titulo: "La Niebla llega al puerto", texto: "Una niebla gris trepa por los muelles. Los gremios se reparten la ciudad mientras puedan." });
    poner(t[1], { id: "tier2", titulo: "Se abre el tier 2", texto: "Llega equipo nuevo a la ciudad y se abren nuevas locaciones: la Biblioteca del Cabildo, la Herrería del Puente y los Bajos Fondos." });
    poner(t[1], { id: "cripta", titulo: "Se abre la Cripta de los Reyes Olvidados", texto: "La Niebla ha agrietado el suelo del cementerio viejo. Bajo él, una cripta llena de tesoros… y de muertos inquietos.", amenaza: 2 });
    poner(t[2], { id: "tier3", titulo: "Se abre el tier 3", texto: "Los mejores artesanos trabajan ya solo para quien traiga botín de las profundidades." });
    poner(t[2], { id: "volcan", titulo: "El Wyrm despierta en el volcán", texto: "El dragón sale de su letargo, atraído por la Niebla. Su guarida está abierta para los valientes.", amenaza: 3 });
    var medio = Math.max(2, Math.round(sesiones / 2));
    if (medio !== t[1] && medio !== t[2]) poner(medio, { id: "fiebre", titulo: "Fiebre en los muelles", texto: "La enfermedad se extiende con la Niebla.", amenaza: 2 });
    poner(sesiones, { id: "final", titulo: "La Noche Larga", texto: "Última sesión. Las victorias valen el doble de Renombre.", renombreDoble: true });
    return { tiers: t, eventos: ev };
  }

  return {
    equipo: equipo, habilidades: habilidades, gremios: gremios, contratados: contratados,
    ordenes: ordenes, edificios: edificios, locaciones: locaciones, encargos: encargos,
    escenarios: escenarios, proezas: proezas, amenaza: amenaza, lineaDeTiempo: lineaDeTiempo,
    // Tabla de heridas (1D6 + modificadores) tras quedar fuera de combate.
    heridas: [
      { max: 1, tipo: "muerto", texto: "muere" },
      { max: 2, tipo: "cicatriz", texto: "sufre una cicatriz permanente" },
      { max: 3, tipo: "herido", texto: "queda herido de gravedad (se pierde la próxima batalla)" },
      { max: 99, tipo: "bien", texto: "se recupera" }
    ],
    nivelMax: 6,
    brecha: 2,
    bandaMax: 8,
    costeNivel: function (nivel) { return 3 + 2 * nivel; }
  };
})();

JG.gremio = function (id) {
  for (var i = 0; i < JG.DATOS.gremios.length; i++) if (JG.DATOS.gremios[i].id === id) return JG.DATOS.gremios[i];
  return null;
};
JG.item = function (id) { return id ? JG.DATOS.equipo[id] : null; };
