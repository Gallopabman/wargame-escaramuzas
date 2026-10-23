// Lógica de la campaña (05_campana.md): sesiones con Encargos → Batalla →
// Resolución → Preparación, monedas, progresión, Amenaza, línea de tiempo e
// IA de los gremios rivales. No toca la interfaz.
var JG = globalThis.JG = globalThis.JG || {};

(function () {
  var D = JG.DATOS;
  var C = JG.campana = {};
  var CLAVE = "gremios_de_la_niebla_v1";

  // ---------- Utilidades ----------
  function az(e) {
    if (!e._azar) { e._azar = new JG.Azar(1); e._azar.estado = e.azarEstado; }
    return e._azar;
  }
  function guardarAzar(e) { if (e._azar) e.azarEstado = e._azar.estado; }
  C.azar = az;
  function noticia(e, texto, tipo) { e.noticias.unshift({ sesion: e.sesion, texto: texto, tipo: tipo || "info" }); if (e.noticias.length > 120) e.noticias.length = 120; }
  C.noticia = noticia;
  function banda(e, id) { for (var i = 0; i < e.bandas.length; i++) if (e.bandas[i].id === id) return e.bandas[i]; return null; }
  C.banda = banda;
  function jugador(e) { return e.bandas[0]; }
  C.jugador = jugador;
  function personaje(b, pid) { for (var i = 0; i < b.personajes.length; i++) if (b.personajes[i].id === pid) return b.personajes[i]; return null; }
  C.personaje = personaje;
  function vivos(b) { return b.personajes.filter(function (p) { return !p.muerto; }); }
  C.vivos = vivos;
  C.tierActual = function (e) { var t = e.tiers; return e.sesion >= t[2] ? 3 : e.sesion >= t[1] ? 2 : 1; };
  function nivelMinimo(b) { var v = vivos(b); return v.length ? Math.min.apply(null, v.map(function (p) { return p.nivel; })) : 1; }
  C.nivelMinimo = nivelMinimo;

  // ---------- Personajes ----------
  function crearPersonaje(e, gremioId, tipo, nivel) {
    var g = JG.gremio(gremioId), d = g.datacards[tipo];
    var buscar = function (cat) { return d.equipo.filter(function (id) { return D.equipo[id].cat === cat; })[0] || null; };
    var p = {
      id: JG.idUnico("p"), nombre: d.bestia ? JG.nombreBestia(az(e), d.nombreBestia) : JG.nombreAleatorio(az(e)),
      tipo: tipo, tipoNombre: d.nombre, gremio: gremioId, lider: !!d.lider, bestia: !!d.bestia,
      nivel: 1, fue: d.fue, agi: d.agi, mag: d.mag, men: d.men, vida: d.vida, acc: d.acc, mov: d.mov,
      armaCC: buscar("cc"), armaDist: buscar("dist"), escudo: buscar("escudo"), armadura: buscar("armadura"),
      hab: d.hab.slice(), titulos: [], cicatrices: [], herido: 0, percance: false, muerto: false,
      bajas: 0, batallas: 0, encargo: null
    };
    while (p.nivel < (nivel || 1)) { p.nivel++; aplicarMejora(p, mejoraAutomatica(e, p)); }
    return p;
  }
  C.crearPersonaje = crearPersonaje;

  // Opciones al subir de nivel: +1 a un atributo (máx. 5), +1 Vida (máx. 5) o
  // una habilidad genérica del tier actual o inferior.
  C.opcionesMejora = function (e, p) {
    var op = [];
    [["fue", "Fuerza"], ["agi", "Agilidad"], ["mag", "Magia"], ["men", "Mente"]].forEach(function (a) {
      if (p[a[0]] < 5) op.push({ id: a[0], texto: "+1 " + a[1] + " (" + p[a[0]] + " → " + (p[a[0]] + 1) + ")" });
    });
    if (p.vida < 5) op.push({ id: "vida", texto: "+1 Vida (" + p.vida + " → " + (p.vida + 1) + ")" });
    var t = C.tierActual(e);
    Object.keys(D.habilidades).forEach(function (h) {
      var hb = D.habilidades[h];
      if (hb.generica && hb.tier <= t && p.hab.indexOf(h) < 0) op.push({ id: "hab:" + h, texto: hb.nombre + " — " + hb.desc });
    });
    return op;
  };
  function aplicarMejora(p, id) {
    if (!id) return;
    if (id.indexOf("hab:") === 0) p.hab.push(id.slice(4));
    else p[id] = Math.min(5, p[id] + 1);
  }
  function mejoraAutomatica(e, p) {
    var g = JG.gremio(p.gremio), op = C.opcionesMejora(e, p);
    var ids = op.map(function (o) { return o.id; });
    var prio = g.prioridad.slice();
    var principal = p.armaDist && JG.item(p.armaDist).atr === "mag" ? "mag" : (JG.item(p.armaCC) || {}).atr;
    if (principal) prio.unshift(principal);
    // Cada tres niveles, una habilidad si hay alguna.
    var habs = ids.filter(function (i) { return i.indexOf("hab:") === 0; });
    if (p.nivel % 3 === 0 && habs.length) return habs[habs.length - 1];
    for (var i = 0; i < prio.length; i++) if (ids.indexOf(prio[i]) >= 0) return prio[i];
    return habs[0] || ids[0];
  }
  C.costeSubir = function (p) { return D.costeNivel(p.nivel); };
  C.puedeSubir = function (e, b, p) {
    if (p.muerto) return "Está muerto.";
    if (p.nivel >= D.nivelMax) return "Ya está al nivel máximo.";
    if (p.nivel + 1 - nivelMinimo(b) > D.brecha) return "Tope de brecha: ninguna miniatura puede pasar " + D.brecha + " niveles por encima de la más baja.";
    if (b.xp < C.costeSubir(p)) return "Falta Experiencia (" + C.costeSubir(p) + ").";
    return null;
  };
  C.subirNivel = function (e, b, pid, opcion) {
    var p = personaje(b, pid);
    var err = C.puedeSubir(e, b, p);
    if (err) return err;
    b.xp -= C.costeSubir(p);
    p.nivel++;
    aplicarMejora(p, opcion || mejoraAutomatica(e, p));
    return null;
  };

  // ---------- Creación de la campaña ----------
  C.nueva = function (opciones) {
    var semilla = opciones.semilla || (Date.now() % 2147483647);
    var linea = D.lineaDeTiempo(opciones.sesiones);
    var e = {
      version: 1, semilla: semilla, azarEstado: semilla, sesiones: opciones.sesiones, sesion: 1, fase: "encargos",
      tiers: linea.tiers, amenaza: { valor: 0, max: D.amenaza.maximo(opciones.sesiones) },
      bandas: [], noticias: [], historial: [], cronicas: {}, eventosVistos: [], cerradas: [],
      finalizada: false, derrota: false
    };
    var otros = D.gremios.filter(function (g) { return g.id !== opciones.gremio; });
    otros = az(e).barajar(otros).slice(0, 3);
    var personalidades = az(e).barajar([
      { nombre: "cooperativa", coop: 0.85, codicia: 0.3 },
      { nombre: "codiciosa", coop: 0.25, codicia: 0.9 },
      { nombre: "equilibrada", coop: 0.55, codicia: 0.5 }
    ]);
    var gs = [JG.gremio(opciones.gremio)].concat(otros);
    gs.forEach(function (g, i) {
      var b = {
        id: "b" + i, nombre: i === 0 ? (opciones.nombre || g.nombre) : g.nombre, gremio: g.id, color: g.color,
        jugador: i === 0, personalidad: i === 0 ? null : personalidades[i - 1],
        influencia: 40, xp: 0, renombre: 0, contencion: 0,
        edificios: {}, inventario: { pocion: 1, antidoto: 0, elixir: 0 }, ordenes: {}, almacen: [],
        personajes: [], contratados: [], caidos: [], victorias: 0, empates: 0, derrotas: 0
      };
      b.edificios[g.edificioInicial] = 1;
      g.bandaInicial.forEach(function (t) { b.personajes.push(crearPersonaje(e, g.id, t, 1)); });
      e.bandas.push(b);
    });
    aplicarEventos(e);
    iniciarSesion(e);
    guardarAzar(e);
    return e;
  };

  // ---------- Línea de tiempo y Amenaza ----------
  function eventosDe(e, s) { return D.lineaDeTiempo(e.sesiones).eventos[s] || []; }
  C.eventosDe = eventosDe;
  function aplicarEventos(e) {
    eventosDe(e, e.sesion).forEach(function (ev) {
      if (e.eventosVistos.indexOf(ev.id) >= 0) return;
      e.eventosVistos.push(ev.id);
      noticia(e, "📜 " + ev.titulo + ". " + ev.texto, "evento");
      if (ev.amenaza) { e.amenaza.valor += ev.amenaza; noticia(e, "La Niebla avanza +" + ev.amenaza + ".", "amenaza"); }
    });
  }
  C.fraccionAmenaza = function (e) { return e.amenaza.valor / e.amenaza.max; };
  C.riesgoExtra = function (e) { return C.fraccionAmenaza(e) >= 0.5 ? 1 : 0; };
  // Valor que alcanzará la Niebla al final de la campaña si nadie la contiene.
  C.proyeccionNiebla = function (e) {
    var v = e.amenaza.valor;
    var desde = e.fase === "preparacion" || e.fase === "resolucion" ? e.sesion + 1 : e.sesion;
    for (var s = desde; s <= e.sesiones; s++) {
      var t = s >= e.tiers[2] ? 3 : s >= e.tiers[1] ? 2 : 1;
      v += D.amenaza.avance(t);
      if (s > e.sesion) eventosDe(e, s).forEach(function (ev) { if (ev.amenaza) v += ev.amenaza; });
    }
    return v;
  };
  // Sesión en la que caería la ciudad si nadie contiene la Niebla (o null).
  C.sesionCaida = function (e) {
    var v = e.amenaza.valor;
    var desde = e.fase === "preparacion" || e.fase === "resolucion" ? e.sesion + 1 : e.sesion;
    for (var s = desde; s <= e.sesiones; s++) {
      if (s > e.sesion) eventosDe(e, s).forEach(function (ev) { if (ev.amenaza) v += ev.amenaza; });
      var t = s >= e.tiers[2] ? 3 : s >= e.tiers[1] ? 2 : 1;
      v += D.amenaza.avance(t);
      if (v >= e.amenaza.max) return s;
    }
    return null;
  };
  // ¿Caerá la ciudad en la próxima Resolución si nadie hace nada?
  C.nieblaInminente = function (e) {
    var t = C.tierActual(e);
    return e.fase !== "preparacion" && e.fase !== "resolucion" && e.amenaza.valor + D.amenaza.avance(t) >= e.amenaza.max;
  };

  // ---------- Inicio de sesión ----------
  var PAREJAS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
  function iniciarSesion(e) {
    e.fase = "encargos";
    e.emparejamientos = PAREJAS[(e.sesion - 1) % 3].map(function (p) { return [e.bandas[p[0]].id, e.bandas[p[1]].id]; });
    // Cuando la Niebla supera el 75%, cada sesión se traga una locación.
    if (C.fraccionAmenaza(e) >= 0.75) {
      var abiertas = C.locacionesAbiertas(e).filter(function (l) { return l.id !== "muralla"; });
      if (abiertas.length) {
        var l = az(e).elegir(abiertas);
        e.cerradas.push(l.id);
        noticia(e, "🌫 La Niebla devora " + l.nombre + ": queda cerrada para siempre.", "amenaza");
      }
    }
    e.bandas.forEach(function (b) {
      b.personajes.forEach(function (p) { p.encargo = null; p.percance = false; });
      // Mínimo de 3 miniaturas: la ciudad siempre tiene desesperados.
      var g = JG.gremio(b.gremio);
      var barato = Object.keys(g.datacards).filter(function (t) { return !g.datacards[t].lider; })
        .sort(function (x, y) { return g.datacards[x].coste - g.datacards[y].coste; })[0];
      while (vivos(b).length < 3) {
        var nuevo = crearPersonaje(e, b.gremio, barato, 1);
        b.personajes.push(nuevo);
        if (b.jugador) noticia(e, nuevo.nombre + " (" + nuevo.tipoNombre + ") se une a tu banda: en la ciudad siempre hay desesperados.", "info");
      }
      // Siempre hay un líder: se asciende a alguien que no sea bestia o llega uno nuevo.
      if (vivos(b).length && !vivos(b).some(function (p) { return p.lider; })) {
        var cand = vivos(b).filter(function (p) { return !p.bestia; }).sort(function (x, y) { return y.nivel - x.nivel; })[0];
        if (!cand) {
          var noBestia = Object.keys(g.datacards).filter(function (t) { return !g.datacards[t].lider && !g.datacards[t].bestia; })[0];
          cand = crearPersonaje(e, b.gremio, noBestia, nivelMinimo(b));
          b.personajes.push(cand);
        }
        cand.lider = true; cand.titulos.push("Nuevo líder");
        if (b.jugador) noticia(e, cand.nombre + " asume el mando de la banda.", "info");
      }
    });
    var orden = e.bandas.slice().sort(function (a, b) { return a.renombre - b.renombre || (a.jugador ? 1 : -1); });
    e.encargos = { orden: orden.map(function (b) { return b.id; }), turno: 0, pasados: {}, asignaciones: [], ocupadas: {} };
    e.batalla = null;
    e.resolucion = null;
  }

  // ---------- Fase de Encargos ----------
  C.locacionesAbiertas = function (e) {
    var t = C.tierActual(e);
    return D.locaciones.filter(function (l) {
      if (l.tier > t) return false;
      if (l.evento && e.eventosVistos.indexOf(l.evento) < 0) return false;
      return e.cerradas.indexOf(l.id) < 0;
    });
  };
  C.slotsDobles = function (e) { return Math.max(0, e.bandas.length - C.locacionesAbiertas(e).length); };
  C.capacidadLibre = function (e, locId) {
    var usados = e.encargos.ocupadas[locId] || 0;
    var dobles = C.slotsDobles(e) - JG.suma(Object.keys(e.encargos.ocupadas), function (k) { return Math.max(0, e.encargos.ocupadas[k] - 1); });
    return usados === 0 || (usados === 1 && dobles > 0);
  };
  C.disponibleEncargo = function (e, b, p, encargo) {
    if (p.muerto) return false;
    if (p.encargo) return false;
    if (p.herido >= e.sesion && encargo !== "curar") return false;
    return true;
  };
  C.turnoEncargos = function (e) {
    var enc = e.encargos;
    if (!enc) return null;
    var guard = 0;
    while (guard++ < 8) {
      var id = enc.orden[enc.turno % enc.orden.length];
      if (!enc.pasados[id]) return id;
      enc.turno++;
      if (Object.keys(enc.pasados).length >= enc.orden.length) return null;
    }
    return null;
  };

  // Asigna un encargo del mapa (gasta el turno) o de la base (no lo gasta).
  // personajes: lista de ids (2 como máximo en mazmorras).
  C.asignar = function (e, b, origen, destinoId, pids, modo) {
    var esMapa = origen === "mapa";
    var loc = esMapa ? D.locaciones.filter(function (l) { return l.id === destinoId; })[0] : null;
    var ed = !esMapa ? D.edificios[destinoId] : null;
    if (esMapa && !loc) return "Locación desconocida.";
    if (!esMapa && (!ed || !b.edificios[destinoId])) return "No tienes ese edificio.";
    var encargo = esMapa ? loc.encargo : ed.encargo;
    if (esMapa) {
      if (C.turnoEncargos(e) !== b.id) return "No es tu turno en el mapa.";
      if (!C.locacionesAbiertas(e).some(function (l) { return l.id === loc.id; })) return "Esa locación no está abierta.";
      if (!C.capacidadLibre(e, loc.id)) return "Esa locación ya está ocupada.";
      if (b.influencia < loc.coste) return "No tienes Influencia suficiente (" + loc.coste + ").";
    } else {
      var usado = e.encargos.asignaciones.some(function (a) { return a.banda === b.id && a.origen === "base" && a.destino === destinoId; });
      if (usado) return "Ese edificio ya tiene a alguien trabajando esta sesión.";
    }
    var max = encargo === "mazmorra" ? 2 : 1;
    if (!pids.length || pids.length > max) return "Elige " + (max === 1 ? "una miniatura." : "una o dos miniaturas.");
    var ps = pids.map(function (id) { return personaje(b, id); });
    for (var i = 0; i < ps.length; i++) if (!ps[i] || !C.disponibleEncargo(e, b, ps[i], encargo)) return "Esa miniatura no está disponible.";
    if (encargo === "curar" && !ps[0].herido && !ps[0].cicatrices.length) return "Solo tiene sentido curar a una miniatura herida o con cicatrices.";
    if ((loc && loc.soloLento) || encargo === "curar") modo = "lento";
    var a = { banda: b.id, origen: origen, destino: destinoId, encargo: encargo, pids: pids, modo: modo || "rapido" };
    e.encargos.asignaciones.push(a);
    ps.forEach(function (p) { p.encargo = { destino: destinoId, modo: a.modo, encargo: encargo }; });
    if (esMapa) {
      b.influencia -= loc.coste;
      e.encargos.ocupadas[loc.id] = (e.encargos.ocupadas[loc.id] || 0) + 1;
      e.encargos.turno++;
    }
    return null;
  };
  C.pasar = function (e, b) {
    if (C.turnoEncargos(e) !== b.id) return "No es tu turno.";
    e.encargos.pasados[b.id] = true;
    e.encargos.turno++;
    return null;
  };
  C.quitarAsignacionBase = function (e, b, destinoId) {
    var enc = e.encargos;
    for (var i = 0; i < enc.asignaciones.length; i++) {
      var a = enc.asignaciones[i];
      if (a.banda === b.id && a.origen === "base" && a.destino === destinoId) {
        a.pids.forEach(function (id) { var p = personaje(b, id); if (p) p.encargo = null; });
        enc.asignaciones.splice(i, 1);
        return null;
      }
    }
    return "No hay nadie asignado.";
  };

  // Hace jugar a la IA hasta que le toque al jugador o todos hayan pasado.
  C.avanzarIAEncargos = function (e) {
    var guard = 0;
    while (guard++ < 200) {
      var t = C.turnoEncargos(e);
      if (!t) return true;
      var b = banda(e, t);
      if (b.jugador) return false;
      JG.ia.turnoEncargos(e, b);
    }
    return true;
  };

  // Resuelve un encargo; devuelve líneas de texto.
  function resolverEncargo(e, b, a) {
    var r = az(e), out = [];
    var ps = a.pids.map(function (id) { return personaje(b, id); }).filter(function (p) { return p && !p.muerto; });
    if (!ps.length) return out;
    var p = ps[0];
    var loc = a.origen === "mapa" ? D.locaciones.filter(function (l) { return l.id === a.destino; })[0] : null;
    var nivelEd = a.origen === "base" ? (b.edificios[a.destino] || 1) : 1;
    var mult = nivelEd >= 2 ? 1.5 : 1;
    var lugar = loc ? loc.nombre : D.edificios[a.destino].nombre;
    var quien = ps.map(function (x) { return x.nombre; }).join(" y ");
    // Riesgo
    var riesgo = loc ? loc.riesgo[a.modo === "rapido" ? 0 : 1] : 0;
    if (riesgo > 0 || (loc && C.riesgoExtra(e))) riesgo += C.riesgoExtra(e);
    if (riesgo > 0 && r.d6() <= riesgo) {
      if (a.modo === "rapido") { p.percance = true; out.push("⚠ " + p.nombre + " sufre un percance en " + lugar + " (entra a la batalla con 1 de Vida menos)."); }
      else { p.herido = e.sesion + 1; out.push("⚠ " + p.nombre + " sale herido de " + lugar + " (se perderá la próxima batalla)."); }
    }
    switch (a.encargo) {
      case "comerciar": {
        var g = Math.round((r.d6() + r.d6() + 2 * p.men) * mult);
        b.influencia += g; out.push(quien + " comercia en " + lugar + ": +" + g + " Influencia."); break;
      }
      case "entrenar": {
        var x = Math.round((3 + r.d3()) * mult);
        b.xp += x; out.push(quien + " entrena en " + lugar + ": +" + x + " Experiencia."); break;
      }
      case "alquimia": {
        var n = (p.men >= 4 ? 2 : 1) + (nivelEd >= 2 ? 1 : 0);
        b.inventario.pocion += n; out.push(quien + " prepara " + n + (n > 1 ? " pociones" : " poción") + " en " + lugar + "."); break;
      }
      case "curar": {
        if (p.herido) { p.herido = 0; out.push(p.nombre + " se recupera de sus heridas en " + lugar + "."); }
        if (p.cicatrices.length && r.d6() >= 5) {
          var c = p.cicatrices.pop(); p[c.atr] = Math.min(5, p[c.atr] + 1);
          out.push("Las hermanas sanan la cicatriz de " + p.nombre + " (" + c.texto + ").");
        }
        break;
      }
      case "contener": {
        var v = Math.round((1 + r.d3() + (p.men >= 4 ? 1 : 0)) * mult);
        e.amenaza.valor = Math.max(0, e.amenaza.valor - v);
        b.contencion += v;
        var renom = a.origen === "mapa" ? 1 : 0;
        b.renombre += renom;
        out.push("🕯 " + quien + " contiene la Niebla desde " + lugar + ": −" + v + " Amenaza" + (renom ? ", +1 Renombre." : ".")); break;
      }
      case "reclutar": {
        if (r.d6() <= 2 && vivos(b).length < D.bandaMax) {
          var g2 = JG.gremio(b.gremio);
          var tipos = Object.keys(g2.datacards).filter(function (t) { return !g2.datacards[t].lider; });
          var nuevo = crearPersonaje(e, b.gremio, r.elegir(tipos), nivelMinimo(b));
          b.personajes.push(nuevo);
          out.push(quien + " encuentra un recluta en " + lugar + ": " + nuevo.nombre + " (" + nuevo.tipoNombre + ") se une a la banda.");
        } else {
          var i2 = r.d6(); b.influencia += i2; out.push(quien + " no encuentra reclutas en " + lugar + ", pero saca " + i2 + " de Influencia.");
        }
        break;
      }
      case "estudiar": {
        var x2 = Math.round((2 + Math.floor(p.men / 2) + (p.mag >= 3 ? 2 : 0)) * mult);
        b.xp += x2; out.push(quien + " estudia en " + lugar + ": +" + x2 + " Experiencia."); break;
      }
      case "herreria": {
        var tier = a.origen === "base" ? (nivelEd >= 2 ? 2 : 1) : Math.min(2, C.tierActual(e));
        var it = itemAleatorio(e, tier);
        b.almacen.push(it); out.push(quien + " forja " + D.equipo[it].nombre + " en " + lugar + " (va al almacén)."); break;
      }
      case "contrabando": {
        var g3 = r.d6() + r.d6() + r.d6() + 2 * p.agi;
        b.influencia += g3; out.push(quien + " hace contrabando en " + lugar + ": +" + g3 + " Influencia."); break;
      }
      case "mazmorra": {
        var mz = loc.mazmorra;
        var poder = JG.suma(ps, function (x) { return Math.max(x.fue, x.agi, x.mag) + x.vida + x.nivel; }) + r.d6() + r.d6();
        if (ps.length === 1) poder -= 3;
        if (poder >= mz.dificultad) {
          var bot = itemAleatorio(e, mz.tierBotin);
          b.almacen.push(bot); b.xp += mz.xp; b.renombre += mz.renombre;
          out.push("🗝 " + quien + (ps.length > 1 ? " vuelven de " : " vuelve de ") + lugar + " con " + D.equipo[bot].nombre + " (+" + mz.xp + " Experiencia, +" + mz.renombre + " Renombre).");
        } else if (poder >= mz.dificultad - 4) {
          var mx = Math.ceil(mz.xp / 2); b.xp += mx;
          out.push(quien + " explora " + lugar + " y escapa por poco: +" + mx + " Experiencia.");
        } else {
          out.push("💀 " + quien + " fracasa en " + lugar + ".");
          ps.forEach(function (x) { out.push(tablaHeridas(e, b, x)); });
        }
        break;
      }
    }
    return out;
  }
  function itemAleatorio(e, tier) {
    var lista = Object.keys(D.equipo).filter(function (k) {
      var it = D.equipo[k];
      return it.tier === tier && !it.bestia && it.cat !== "consumible";
    });
    return az(e).elegir(lista);
  }

  C.terminarEncargos = function (e) {
    // Termina la fase: la IA asigna lo que le falte y se resuelven los encargos rápidos.
    var enc = e.encargos;
    e.bandas.forEach(function (b) { if (!b.jugador) JG.ia.encargosBase(e, b); });
    var lineas = [];
    enc.asignaciones.filter(function (a) { return a.modo === "rapido"; }).forEach(function (a) {
      var b = banda(e, a.banda);
      resolverEncargo(e, b, a).forEach(function (l) { lineas.push({ banda: b.id, texto: l }); });
      a.resuelto = true;
    });
    e.encargos.informe = lineas;
    lineas.filter(function (l) { return l.banda === jugador(e).id; }).forEach(function (l) { noticia(e, l.texto, "encargo"); });
    prepararBatalla(e);
    e.fase = "batalla";
    guardarAzar(e);
  };

  // ---------- Fase de Batalla ----------
  function prepararBatalla(e) {
    var r = az(e);
    var pz = r.barajar(D.proezas).slice(0, 2).map(function (p) { return p.id; });
    e.batalla = {
      parejas: e.emparejamientos.map(function (par) {
        return { bandas: par, escenario: r.elegir(D.escenarios).id, proezas: pz, resultado: null };
      }),
      postura: "equilibrada", ordenes: [], alineacion: null
    };
  }
  C.disponiblesBatalla = function (e, b) {
    return vivos(b).filter(function (p) {
      return !(p.herido >= e.sesion) && !(p.encargo && p.encargo.modo === "lento");
    });
  };
  C.parejaDelJugador = function (e) {
    return e.batalla.parejas.filter(function (p) { return p.bandas.indexOf(jugador(e).id) >= 0; })[0];
  };
  function bandaParaBatalla(e, b, alineacion, postura, ordenes) {
    var lista = C.disponiblesBatalla(e, b);
    if (alineacion) lista = lista.filter(function (p) { return alineacion.indexOf(p.id) >= 0; });
    lista = lista.slice(0, 8).concat(b.contratados.map(function (c) { return c; }));
    var g = JG.gremio(b.gremio);
    return {
      nombre: b.nombre, gremio: b.gremio, color: b.color, miniaturas: lista,
      postura: postura, ordenes: ordenes, pociones: b.inventario.pocion, antidotos: b.inventario.antidoto,
      elixires: b.inventario.elixir
    };
  }
  C.jugarBatallas = function (e) {
    var j = jugador(e);
    e.batalla.parejas.forEach(function (par) {
      var b0 = banda(e, par.bandas[0]), b1 = banda(e, par.bandas[1]);
      var prep = [b0, b1].map(function (b) {
        if (b.jugador) return bandaParaBatalla(e, b, e.batalla.alineacion, e.batalla.postura, e.batalla.ordenes.slice());
        var t = JG.ia.planBatalla(e, b);
        return bandaParaBatalla(e, b, null, t.postura, t.ordenes);
      });
      // Gastar órdenes llevadas
      [b0, b1].forEach(function (b, i) { prep[i].ordenes.forEach(function (o) { b.ordenes[o] = Math.max(0, (b.ordenes[o] || 0) - 1); }); });
      if (!prep[0].miniaturas.length || !prep[1].miniaturas.length) {
        var g = prep[0].miniaturas.length ? 0 : prep[1].miniaturas.length ? 1 : -1;
        par.resultado = { escenario: par.escenario, escenarioNombre: "Incomparecencia", ganador: g, puntos: [g === 0 ? 3 : 0, g === 1 ? 3 : 0],
          bajas: [0, 0], cronica: [{ r: 0, tipo: "final", texto: "Una de las bandas no tiene a nadie para combatir.", lado: g }], proezas: [], usados: [{ pociones: 0, antidotos: 0, elixires: 0, ordenes: [] }, { pociones: 0, antidotos: 0, elixires: 0, ordenes: [] }], miniaturas: [] };
      } else {
        par.resultado = JG.batalla(prep, par.escenario, az(e), { proezas: par.proezas });
      }
      [b0, b1].forEach(function (b, i) {
        var u = par.resultado.usados[i];
        b.inventario.pocion = Math.max(0, b.inventario.pocion - u.pociones);
        b.inventario.antidoto = Math.max(0, b.inventario.antidoto - u.antidotos);
        b.inventario.elixir = Math.max(0, b.inventario.elixir - u.elixires);
      });
      if (par.bandas.indexOf(j.id) >= 0) {
        e.cronicas[e.sesion] = {
          bandas: [b0.nombre, b1.nombre], colores: [b0.color, b1.color], gremios: [b0.gremio, b1.gremio],
          ladoJugador: par.bandas.indexOf(j.id), proezas: par.proezas, resultado: par.resultado
        };
      }
    });
    e.fase = "resolucion";
    C.resolver(e);
    guardarAzar(e);
  };

  // ---------- Fase de Resolución ----------
  function tablaHeridas(e, b, p) {
    var tirada = az(e).d6() + (b.edificios.enfermeria ? 1 : 0) + (p.hab.indexOf("duro") >= 0 ? 1 : 0);
    var fila = D.heridas.filter(function (h) { return tirada <= h.max; })[0];
    if (fila.tipo === "muerto") {
      p.muerto = true; b.caidos.push({ nombre: p.nombre, tipo: p.tipoNombre, sesion: e.sesion, nivel: p.nivel });
      if (p.lider) nombrarLider(b, p);
    } else if (fila.tipo === "cicatriz") {
      var atrs = ["fue", "agi", "men"].filter(function (a) { return p[a] >= 2; });
      if (p.vida >= 3) atrs.push("vida");
      if (atrs.length) {
        var at = az(e).elegir(atrs);
        p[at] -= 1;
        var nom = { fue: "Fuerza", agi: "Agilidad", men: "Mente", vida: "Vida" }[at];
        p.cicatrices.push({ atr: at, texto: "−1 " + nom });
      }
    } else if (fila.tipo === "herido") p.herido = e.sesion + 1;
    return (fila.tipo === "muerto" ? "✝ " : fila.tipo === "bien" ? "✓ " : "✚ ") + p.nombre + " " + fila.texto + " (tirada " + tirada + ").";
  }
  function nombrarLider(b, muerto) {
    muerto.lider = false;
    var cand = vivos(b).filter(function (p) { return !p.bestia; }).sort(function (a, c) { return c.nivel - a.nivel; })[0];
    if (cand) { cand.lider = true; cand.titulos.push("Nuevo líder"); }
  }

  C.resolver = function (e) {
    var informe = {};
    e.bandas.forEach(function (b) { informe[b.id] = []; });
    var final = eventosDe(e, e.sesion).some(function (ev) { return ev.renombreDoble; });
    e.batalla.parejas.forEach(function (par) {
      var res = par.resultado;
      par.bandas.forEach(function (bid, lado) {
        var b = banda(e, bid), inf = informe[bid];
        var rival = banda(e, par.bandas[1 - lado]);
        var gano = res.ganador === lado, empate = res.ganador === -1;
        var ren = gano ? 3 : empate ? 1 : 0;
        if (final) ren *= 2;
        b.renombre += ren;
        if (gano) b.victorias++; else if (empate) b.empates++; else b.derrotas++;
        var bajas = res.bajas[lado];
        var infl = 8 + 2 * bajas + (gano ? 6 : 0);
        if (vivos(b).some(function (p) { return p.hab.indexOf("botin") >= 0; })) infl += 3 * bajas;
        var mins = res.miniaturas.filter(function (m) { return m.lado === lado && !m.contratado; });
        var xp = mins.length + bajas + (gano ? 3 : 0);
        b.influencia += infl; b.xp += xp;
        inf.push((gano ? "🏆 Victoria" : empate ? "⚖ Empate" : "✗ Derrota") + " contra " + rival.nombre + " (" + res.puntos[lado] + "–" + res.puntos[1 - lado] + "): +" + ren + " Renombre, +" + infl + " Influencia, +" + xp + " Experiencia.");
        // Botín: el mejor equipo solo se consigue en partidas o mazmorras.
        if (gano && az(e).d6() >= 5) {
          var bot = itemAleatorio(e, C.tierActual(e));
          b.almacen.push(bot);
          inf.push("💰 Entre los restos del combate encontráis " + D.equipo[bot].nombre + " (va al almacén).");
        }
        mins.forEach(function (m) {
          var p = personaje(b, m.ref);
          if (!p) return;
          p.batallas++; p.bajas += m.st.bajas;
          if (m.fuera) inf.push(tablaHeridas(e, b, p));
        });
        res.proezas.filter(function (pz) { return pz.lado === lado; }).forEach(function (pz) {
          var p = personaje(b, pz.ref), def = D.proezas.filter(function (x) { return x.id === pz.proeza; })[0];
          if (!p || p.muerto) return;
          b.renombre += 1;
          if (p.titulos.length < 2 && p.titulos.indexOf(def.titulo) < 0) {
            p.titulos.push(def.titulo);
            if (p[def.mejora] < 5) p[def.mejora]++;
            inf.push("★ " + p.nombre + " cumple la proeza «" + def.nombre + "»: gana el título «" + def.titulo + "» y +1 Renombre.");
          } else inf.push("★ " + p.nombre + " cumple la proeza «" + def.nombre + "» (+1 Renombre).");
        });
        b.contratados = [];
      });
    });
    // Encargos lentos
    e.encargos.asignaciones.filter(function (a) { return a.modo === "lento" && !a.resuelto; }).forEach(function (a) {
      var b = banda(e, a.banda);
      resolverEncargo(e, b, a).forEach(function (l) { informe[b.id].push(l); });
      a.resuelto = true;
    });
    // Quien se perdió esta batalla por heridas ya está listo.
    e.bandas.forEach(function (b) {
      b.personajes.forEach(function (p) { if (p.herido && p.herido <= e.sesion) p.herido = 0; p.percance = false; });
    });
    // La Niebla avanza
    var av = D.amenaza.avance(C.tierActual(e));
    e.amenaza.valor += av;
    informe.amenaza = "🌫 La Niebla avanza +" + av + " (" + e.amenaza.valor + "/" + e.amenaza.max + ").";
    noticia(e, informe.amenaza, "amenaza");
    if (e.amenaza.valor >= e.amenaza.max) {
      e.derrota = true; e.finalizada = true; e.fase = "fin";
      noticia(e, "La Niebla Hambrienta devora la ciudad. Todos los gremios pierden la campaña.", "amenaza");
    }
    informe[jugador(e).id].forEach(function (l) { noticia(e, l, "resolucion"); });
    e.historial.push({
      sesion: e.sesion,
      batallas: e.batalla.parejas.map(function (p) {
        return { bandas: p.bandas, puntos: p.resultado.puntos, ganador: p.resultado.ganador, escenario: p.resultado.escenarioNombre };
      })
    });
    e.resolucion = informe;
    if (!e.finalizada) e.fase = "resolucion";
  };

  C.aPreparacion = function (e) {
    if (e.finalizada) return;
    e.fase = "preparacion";
  };

  // ---------- Fase de Preparación: gestión ----------
  C.tienda = function (e) {
    var t = Math.min(2, C.tierActual(e));
    return Object.keys(D.equipo).filter(function (k) { var it = D.equipo[k]; return it.tier <= t && !it.bestia; });
  };
  C.comprar = function (e, b, id) {
    var it = D.equipo[id];
    if (!it || C.tienda(e).indexOf(id) < 0) return "Ese objeto no está a la venta.";
    if (b.influencia < it.coste) return "No tienes Influencia suficiente.";
    b.influencia -= it.coste;
    if (it.cat === "consumible") b.inventario[id] = (b.inventario[id] || 0) + 1;
    else b.almacen.push(id);
    return null;
  };
  C.precioVenta = function (id) { return Math.floor(D.equipo[id].coste / 2); };
  C.vender = function (e, b, indiceAlmacen) {
    var id = b.almacen[indiceAlmacen];
    if (!id) return "No hay nada que vender.";
    b.almacen.splice(indiceAlmacen, 1);
    b.influencia += C.precioVenta(id);
    return null;
  };
  var RANURA = { cc: "armaCC", dist: "armaDist", escudo: "escudo", armadura: "armadura" };
  C.puedeEquipar = function (p, id) {
    var it = D.equipo[id];
    if (!it || !RANURA[it.cat]) return "No se puede equipar.";
    if (p.bestia) return "Las bestias no usan equipo.";
    if (it.atr === "mag" && p.mag < 2) return "Necesita Magia 2 o más.";
    if (it.cat === "escudo" && p.armaCC && JG.item(p.armaCC).esp.indexOf("dosManos") >= 0) return "No puede llevar escudo con un arma a dos manos.";
    return null;
  };
  C.equipar = function (e, b, pid, indiceAlmacen) {
    var p = personaje(b, pid), id = b.almacen[indiceAlmacen];
    var err = C.puedeEquipar(p, id);
    if (err) return err;
    var it = D.equipo[id], ranura = RANURA[it.cat];
    b.almacen.splice(indiceAlmacen, 1);
    if (p[ranura]) b.almacen.push(p[ranura]);
    p[ranura] = id;
    if (it.cat === "cc" && it.esp.indexOf("dosManos") >= 0 && p.escudo) { b.almacen.push(p.escudo); p.escudo = null; }
    return null;
  };
  C.desequipar = function (e, b, pid, ranura) {
    var p = personaje(b, pid);
    if (!p || p.bestia || !p[ranura]) return "No hay nada que quitar.";
    if (ranura === "armaCC") return "Toda miniatura necesita un arma cuerpo a cuerpo.";
    b.almacen.push(p[ranura]); p[ranura] = null;
    return null;
  };
  C.costeReclutar = function (e, b, tipo) {
    var d = JG.gremio(b.gremio).datacards[tipo];
    return d.coste + 5 * (nivelMinimo(b) - 1);
  };
  C.reclutar = function (e, b, tipo) {
    var d = JG.gremio(b.gremio).datacards[tipo];
    if (!d || d.lider) return "No se puede reclutar.";
    if (vivos(b).length >= D.bandaMax) return "La banda está completa (" + D.bandaMax + ").";
    var c = C.costeReclutar(e, b, tipo);
    if (b.influencia < c) return "No tienes Influencia suficiente (" + c + ").";
    b.influencia -= c;
    var p = crearPersonaje(e, b.gremio, tipo, nivelMinimo(b));
    b.personajes.push(p);
    guardarAzar(e);
    return null;
  };
  C.costeContratado = function (b, c) { return b.gremio === "mercenarios" ? Math.ceil(c.coste / 2) : c.coste; };
  C.contratar = function (e, b, idc) {
    var c = D.contratados.filter(function (x) { return x.id === idc; })[0];
    if (!c) return "Mercenario desconocido.";
    if (b.contratados.length >= 2) return "Como mucho, 2 contratados por batalla.";
    var coste = C.costeContratado(b, c);
    if (b.influencia < coste) return "No tienes Influencia suficiente.";
    b.influencia -= coste;
    var buscar = function (cat) { return c.equipo.filter(function (id) { return D.equipo[id].cat === cat; })[0] || null; };
    b.contratados.push({
      id: JG.idUnico("c"), nombre: JG.nombreAleatorio(az(e)), tipo: c.id, tipoNombre: c.nombre, contratado: true,
      fue: c.fue, agi: c.agi, mag: c.mag, men: c.men, vida: c.vida, acc: c.acc, mov: c.mov,
      armaCC: buscar("cc"), armaDist: buscar("dist"), escudo: buscar("escudo"), armadura: buscar("armadura"), hab: []
    });
    guardarAzar(e);
    return null;
  };
  C.costeEdificio = function (b, id) { return D.edificios[id].coste * (b.edificios[id] ? 2 : 1); };
  C.construir = function (e, b, id) {
    if (!D.edificios[id]) return "Edificio desconocido.";
    var nivel = b.edificios[id] || 0;
    if (nivel >= 2) return "Ya está al nivel máximo.";
    if (nivel === 1 && C.tierActual(e) < 2) return "Mejorar edificios requiere el tier 2.";
    var c = C.costeEdificio(b, id);
    if (b.influencia < c) return "No tienes Influencia suficiente (" + c + ").";
    b.influencia -= c;
    b.edificios[id] = nivel + 1;
    return null;
  };
  C.comprarOrden = function (e, b, id) {
    var o = D.ordenes[id];
    if (!o) return "Orden desconocida.";
    if (b.influencia < o.coste) return "No tienes Influencia suficiente.";
    b.influencia -= o.coste;
    b.ordenes[id] = (b.ordenes[id] || 0) + 1;
    return null;
  };
  // Despedir: tirada en la tabla de venganza.
  C.despedir = function (e, b, pid) {
    var p = personaje(b, pid);
    if (!p || p.muerto) return "No se puede despedir.";
    if (p.lider) return "No puedes despedir al líder.";
    if (p.encargo) return "Está haciendo un encargo.";
    var r = az(e).d6() - Math.floor(p.nivel / 2);
    var txt;
    if (r <= 1) { var robo = Math.min(b.influencia, az(e).d6() + az(e).d6() + 2 * p.nivel); b.influencia -= robo; txt = p.nombre + " se marcha y, por venganza, roba " + robo + " de Influencia."; }
    else if (r === 2 && b.inventario.pocion > 0) { b.inventario.pocion = 0; txt = p.nombre + " se marcha y rompe todas las pociones de la base."; }
    else if (r === 2) { txt = p.nombre + " se marcha maldiciendo a la banda."; }
    else txt = p.nombre + " recoge sus cosas y se marcha sin más.";
    [p.armaCC, p.armaDist, p.escudo, p.armadura].forEach(function (it) { if (it && !D.equipo[it].bestia) b.almacen.push(it); });
    b.personajes.splice(b.personajes.indexOf(p), 1);
    noticia(e, txt, "info");
    guardarAzar(e);
    return txt;
  };
  C.mantenimiento = function (b) {
    return vivos(b).length + Object.keys(b.edificios).length;
  };

  // ---------- Fin de sesión ----------
  C.terminarSesion = function (e) {
    var lineas = [];
    e.bandas.forEach(function (b) {
      if (!b.jugador) JG.ia.preparar(e, b);
      var m = C.mantenimiento(b);
      if (b.influencia >= m) b.influencia -= m;
      else {
        b.influencia = 0; b.renombre = Math.max(0, b.renombre - 1);
        if (b.jugador) lineas.push("No puedes pagar el mantenimiento (" + m + "): pierdes 1 de Renombre.");
      }
    });
    lineas.forEach(function (l) { noticia(e, l, "info"); });
    if (e.sesion >= e.sesiones) return C.finalizar(e);
    e.sesion++;
    aplicarEventos(e);
    if (e.amenaza.valor >= e.amenaza.max) {
      e.derrota = true; e.finalizada = true; e.fase = "fin";
      noticia(e, "La Niebla Hambrienta devora la ciudad. Todos los gremios pierden la campaña.", "amenaza");
      guardarAzar(e);
      return;
    }
    iniciarSesion(e);
    guardarAzar(e);
  };
  C.finalizar = function (e) {
    e.finalizada = true; e.fase = "fin";
    var top = e.bandas.slice().sort(function (a, b) { return b.contencion - a.contencion; })[0];
    if (top.contencion > 0) {
      top.renombre += 3;
      noticia(e, "🕯 " + top.nombre + " recibe el título de Salvadores de la Ciudad (+3 Renombre) por contener la Niebla.", "evento");
    }
    var orden = C.clasificacion(e);
    noticia(e, "🏁 Fin de la campaña. Gana " + orden[0].nombre + " con " + orden[0].renombre + " de Renombre.", "evento");
    guardarAzar(e);
  };
  C.clasificacion = function (e) {
    return e.bandas.slice().sort(function (a, b) { return b.renombre - a.renombre || b.victorias - a.victorias; });
  };

  // ---------- Guardado ----------
  C.guardar = function (e) {
    guardarAzar(e);
    var copia = {};
    for (var k in e) if (k !== "_azar") copia[k] = e[k];
    try { localStorage.setItem(CLAVE, JSON.stringify(copia)); return true; } catch (err) { return false; }
  };
  C.cargar = function () {
    try {
      var s = localStorage.getItem(CLAVE);
      return s ? JSON.parse(s) : null;
    } catch (err) { return null; }
  };
  C.borrar = function () { try { localStorage.removeItem(CLAVE); } catch (err) { } };
  C.exportar = function (e) {
    guardarAzar(e);
    var copia = {};
    for (var k in e) if (k !== "_azar") copia[k] = e[k];
    return JSON.stringify(copia);
  };
})();
