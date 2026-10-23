// IA de los gremios rivales en la campaña. También sirve de piloto automático
// para las pruebas. Cada banda tiene una personalidad: cooperación (cuánto le
// importa la Niebla) y codicia (cuánto busca Influencia).
var JG = globalThis.JG = globalThis.JG || {};

(function () {
  var D = JG.DATOS, C = JG.campana;
  var IA = JG.ia = {};

  function pers(b) { return b.personalidad || { coop: 0.6, codicia: 0.5 }; }

  // Valor de cada tipo de encargo para esta banda ahora mismo.
  function valorEncargo(e, b, encargo, p) {
    var f = C.fraccionAmenaza(e), pr = pers(b);
    var sesionesQuedan = e.sesiones - e.sesion + 1;
    // ¿Llegará la Niebla al final si nadie hace nada?
    var proyeccion = e.amenaza.valor + sesionesQuedan * D.amenaza.avance(C.tierActual(e));
    var peligro = proyeccion >= e.amenaza.max ? 1 : 0;
    switch (encargo) {
      case "comerciar": return (b.influencia < 50 ? 6 : 3) + 3 * pr.codicia + p.men * 0.5;
      case "entrenar": return 4.5;
      case "alquimia": return b.inventario.pocion < 2 ? 3.5 : 1;
      case "curar": return p.herido ? 9 : p.cicatrices.length ? 3 : -9;
      case "contener": return f * 10 * pr.coop + peligro * (3 + 6 * pr.coop) + (f > 0.8 ? 6 : 0) + 1.5;
      case "reclutar": return C.vivos(b).length < 6 ? 4.5 : 0.5;
      case "estudiar": return 4 + (p.mag >= 3 ? 1.5 : 0);
      case "herreria": return 5;
      case "contrabando": return 2 + 6 * pr.codicia - (p.nivel <= 1 ? 1 : 0);
      case "mazmorra": return 7 + C.tierActual(e);
    }
    return 0;
  }

  function candidatos(e, b, encargo) {
    return C.vivos(b).filter(function (p) {
      if (!C.disponibleEncargo(e, b, p, encargo)) return false;
      if (encargo === "curar") return p.herido || p.cicatrices.length;
      if (p.herido) return false;
      return true;
    });
  }
  // Mejor miniatura para un encargo (las más débiles hacen los encargos).
  function elegirPersonaje(e, b, encargo) {
    var c = candidatos(e, b, encargo);
    if (!c.length) return null;
    var poder = function (p) { return p.nivel * 2 + p.vida + Math.max(p.fue, p.agi, p.mag) + (p.lider ? 5 : 0); };
    if (encargo === "comerciar" || encargo === "contener" || encargo === "estudiar") c.sort(function (a, z) { return z.men - a.men || poder(a) - poder(z); });
    else if (encargo === "contrabando") c.sort(function (a, z) { return z.agi - a.agi; });
    else if (encargo === "mazmorra") c.sort(function (a, z) { return poder(z) - poder(a); });
    else c.sort(function (a, z) { return poder(a) - poder(z); });
    return c;
  }
  function maxEncargos(e, b) {
    return Math.max(1, Math.ceil(C.vivos(b).length / 2));
  }
  function asignados(e, b) {
    return e.encargos.asignaciones.filter(function (a) { return a.banda === b.id; }).length;
  }

  IA.encargosBase = function (e, b) {
    var eds = Object.keys(b.edificios).map(function (id) { return { id: id, ed: D.edificios[id] }; })
      .sort(function (x, y) { var p0 = C.vivos(b)[0]; return p0 ? valorEncargo(e, b, y.ed.encargo, p0) - valorEncargo(e, b, x.ed.encargo, p0) : 0; });
    eds.forEach(function (x) {
      if (asignados(e, b) >= maxEncargos(e, b) + 1) return;
      var lista = elegirPersonaje(e, b, x.ed.encargo);
      if (!lista) return;
      var v = valorEncargo(e, b, x.ed.encargo, lista[0]);
      if (v < 2) return;
      // Rápido, salvo que curar (siempre lento).
      C.asignar(e, b, "base", x.id, [lista[0].id], "rapido");
    });
  };

  IA.turnoEncargos = function (e, b) {
    if (!b._baseHecha || b._baseHecha !== e.sesion) { IA.encargosBase(e, b); b._baseHecha = e.sesion; }
    var mejor = null;
    if (asignados(e, b) < maxEncargos(e, b) + 1) {
      C.locacionesAbiertas(e).forEach(function (l) {
        if (!C.capacidadLibre(e, l.id) || b.influencia < l.coste) return;
        var lista = elegirPersonaje(e, b, l.encargo);
        if (!lista) return;
        var pids = [lista[0].id];
        if (l.encargo === "mazmorra") {
          if (lista.length < 2 || C.disponiblesBatalla(e, b).length <= 4) return;
          pids.push(lista[1].id);
          var poder = JG.suma(pids.map(function (id) { return C.personaje(b, id); }), function (x) { return Math.max(x.fue, x.agi, x.mag) + x.vida + x.nivel; }) + 7;
          if (poder < l.mazmorra.dificultad - 1) return;
        }
        var v = valorEncargo(e, b, l.encargo, lista[0]) - l.coste / 4 + C.azar(e).siguiente() * 0.5;
        if (!mejor || v > mejor.v) mejor = { v: v, l: l, pids: pids };
      });
    }
    if (mejor && mejor.v >= 3) {
      var modo = mejor.l.soloLento ? "lento" : "rapido";
      var err = C.asignar(e, b, "mapa", mejor.l.id, mejor.pids, modo);
      if (!err) return;
    }
    C.pasar(e, b);
  };

  IA.planBatalla = function (e, b) {
    var pr = pers(b);
    var postura = pr.codicia > 0.7 ? "agresiva" : pr.coop > 0.8 ? "defensiva" : "equilibrada";
    var ordenes = [];
    Object.keys(b.ordenes).forEach(function (o) { for (var i = 0; i < b.ordenes[o] && ordenes.length < 2; i++) ordenes.push(o); });
    return { postura: postura, ordenes: ordenes };
  };

  // ---------- Preparación ----------
  function puntuarArma(p, id) {
    var it = D.equipo[id];
    if (!it) return -99;
    var atr = p[it.atr] || 0;
    var s = it.dano * 3 + atr * 1.5 + (it.prec || 0) * 1.5 + (it.parada || 0) * (it.cat === "cc" ? 0.7 : 0);
    if (it.esp.indexOf("dobleGolpe") >= 0) s += 1.5;
    if (it.esp.indexOf("rompe") >= 0) s += 1;
    if (it.esp.indexOf("veneno") >= 0) s += 1.5;
    if (it.esp.indexOf("lenta") >= 0) s -= 1;
    if (it.cat === "dist") s += it.alcance / 8;
    return s;
  }
  function puntuarArmadura(p, id) {
    if (!id) return 0;
    var it = D.equipo[id];
    var pesoAgi = p.agi >= 4 ? 2.5 : 1;
    return it.red * 3 + it.dur * 1.2 + it.esquiva * pesoAgi + (it.esp && it.esp.indexOf("sombras") >= 0 ? 1.5 : 0);
  }
  function puntuarEscudo(p, id) {
    if (!id) return 0;
    return 3 + (p.agi <= 3 ? 1 : 0);
  }
  function mejora(p, id) {
    var it = D.equipo[id];
    if (C.puedeEquipar(p, id)) return -99;
    if (it.cat === "cc") return puntuarArma(p, id) - puntuarArma(p, p.armaCC);
    if (it.cat === "dist") return puntuarArma(p, id) - (p.armaDist ? puntuarArma(p, p.armaDist) : 0) - (p.armaDist ? 0 : 2);
    if (it.cat === "armadura") return puntuarArmadura(p, id) - puntuarArmadura(p, p.armadura);
    if (it.cat === "escudo") {
      var cc = JG.item(p.armaCC);
      if (cc.atr === "agi" && p.agi >= 4) return -99;
      return p.escudo ? -99 : puntuarEscudo(p, id);
    }
    return -99;
  }

  IA.preparar = function (e, b) {
    var reserva = 25;
    // 1. Subir niveles
    var guard = 0;
    while (guard++ < 30) {
      var cand = C.vivos(b).filter(function (p) { return !C.puedeSubir(e, b, p); })
        .sort(function (x, y) { return x.nivel - y.nivel || (y.lider ? 1 : 0) - (x.lider ? 1 : 0); });
      if (!cand.length) break;
      C.subirNivel(e, b, cand[0].id);
    }
    // 2. Equipar lo que haya en el almacén si mejora a alguien
    for (var i = b.almacen.length - 1; i >= 0; i--) {
      var id = b.almacen[i];
      var mejorP = null, mv = 0.5;
      C.vivos(b).forEach(function (p) { var v = mejora(p, id); if (v > mv) { mv = v; mejorP = p; } });
      if (mejorP) C.equipar(e, b, mejorP.id, i);
    }
    // 3. Vender lo que sobra
    for (var j = b.almacen.length - 1; j >= 0; j--) {
      var util = C.vivos(b).some(function (p) { return mejora(p, b.almacen[j]) > 0.5; });
      if (!util) C.vender(e, b, j);
    }
    // 4. Construir
    var prio = pers(b).coop > 0.6 ? ["atalaya", "enfermeria", "patio", "almacen", "laboratorio", "estudio", "forja", "sala"]
      : ["almacen", "patio", "enfermeria", "laboratorio", "forja", "estudio", "sala", "atalaya"];
    for (var k = 0; k < prio.length; k++) {
      var ed = prio[k];
      if (b.edificios[ed] && (b.edificios[ed] >= 2 || C.tierActual(e) < 2)) continue;
      if (b.influencia >= C.costeEdificio(b, ed) + reserva + 15) { C.construir(e, b, ed); break; }
    }
    // 5. Reclutar
    var g = JG.gremio(b.gremio);
    if (C.vivos(b).length < 6) {
      var tipos = Object.keys(g.datacards).filter(function (t) { return !g.datacards[t].lider; });
      var t = C.azar(e).elegir(tipos);
      if (b.influencia >= C.costeReclutar(e, b, t) + reserva) C.reclutar(e, b, t);
    }
    // 6. Comprar equipo
    var tienda = C.tienda(e).filter(function (id) { return D.equipo[id].cat !== "consumible"; });
    var compras = 0;
    C.vivos(b).slice().sort(function (x, y) { return y.nivel - x.nivel; }).forEach(function (p) {
      if (compras >= 2) return;
      var mejor = null, mv = 1.5;
      tienda.forEach(function (id) {
        var it = D.equipo[id];
        if (b.influencia - it.coste < reserva) return;
        var v = mejora(p, id) / Math.max(1, it.coste / 25);
        if (v > mv) { mv = v; mejor = id; }
      });
      if (mejor) {
        C.comprar(e, b, mejor);
        C.equipar(e, b, p.id, b.almacen.length - 1);
        compras++;
      }
    });
    for (var v2 = b.almacen.length - 1; v2 >= 0; v2--) {
      var u2 = C.vivos(b).some(function (p) { return mejora(p, b.almacen[v2]) > 0.5; });
      if (!u2) C.vender(e, b, v2);
    }
    // 7. Consumibles y órdenes
    if (b.inventario.pocion < 2 && b.influencia >= reserva + 15) C.comprar(e, b, "pocion");
    var nOrd = JG.suma(Object.keys(b.ordenes), function (o) { return b.ordenes[o]; });
    if (nOrd < 2 && b.influencia >= reserva + 20) C.comprarOrden(e, b, C.azar(e).elegir(["carga", "filas", "fuego", "adelante"]));
    // 8. Contratados si faltan luchadores
    var luchan = C.vivos(b).filter(function (p) { return !(p.herido > e.sesion); }).length;
    if (luchan < 4) {
      var c = D.contratados[0];
      if (b.influencia >= C.costeContratado(b, c) + reserva) C.contratar(e, b, c.id);
    }
  };
})();
