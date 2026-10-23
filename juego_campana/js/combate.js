// Motor de batallas simuladas. Aplica las reglas de 01_reglas_basicas.md:
// ronda (iniciativa, órdenes, activaciones, mantenimiento), puntos de acción,
// combate mutuo con defensa reactiva, disparo con defensa y cobertura, ayudas,
// carga, salir de un combate, reglas especiales y escenarios.
var JG = globalThis.JG = globalThis.JG || {};

(function () {
  var D = JG.DATOS;

  function exito(d, mod, umbral) {
    if (d === 1) return false;
    if (d === 6) return true;
    return d + mod >= (umbral || 6);
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function tiene(m, h) { return m.hab.indexOf(h) >= 0; }
  function esp(item, e) { return !!(item && item.esp && item.esp.indexOf(e) >= 0); }

  // ---------- Preparación de miniaturas ----------
  function crearMiniatura(p, lado, banda) {
    var cc = JG.item(p.armaCC) || D.equipo.daga;
    var arm = JG.item(p.armadura);
    var m = {
      ref: p.id, nombre: p.nombre, tipo: p.tipoNombre || p.tipo, lado: lado, lider: !!p.lider,
      contratado: !!p.contratado,
      fue: p.fue, agi: p.agi, mag: p.mag, men: p.men,
      vidaMax: p.vida, hp: p.vida - (p.percance ? 1 : 0),
      acc: p.acc, mov: p.mov + (p.hab.indexOf("veloz") >= 0 ? 2 : 0),
      cc: cc, dist: JG.item(p.armaDist), escudo: JG.item(p.escudo),
      arm: { red: arm ? arm.red : 0, dur: arm ? arm.dur : 0, durMax: arm ? arm.dur : 0, esq: arm ? arm.esquiva : 0 },
      hab: p.hab.slice().concat(arm && arm.esp ? arm.esp : []),
      x: 0, y: 0, ap: 0, activada: false, fuera: false, veneno: 0, aturdido: false,
      reaccionoFalta: false, usado: {}, elixir: false, antidoto: false,
      st: { danoHecho: 0, danoRecibido: 0, bajas: 0, bajasDist: 0, paradas: 0, esquivas: 0,
        combates: 0, combatesSinPerder: 0, victimas: [] }
    };
    if (m.hp < 1) m.hp = 1;
    return m;
  }

  // ---------- Modificadores ----------
  function atributo(m, a) { return m[a] || 0; }
  function bonoOrden(b, tipo) { return b.ordenActiva === tipo ? 1 : 0; }

  function modGolpe(m, obj, bat) {
    var b = bat.bandas[m.lado];
    var v = atributo(m, m.cc.atr) + (m.cc.prec || 0);
    if (m.escudo && m.escudo.prec) v += m.escudo.prec;
    if (tiene(m, "brazo")) v += 1;
    if (tiene(m, "maestro")) v += 1;
    if (m.elixir) v += 1;
    v += bonoOrden(b, "carga");
    if (obj && tiene(obj, "nube")) v -= 1;
    if (obj && bat.marcado[m.lado] === obj) v += 1;
    return v;
  }
  function aliadoCerca(m, bat, r) {
    var vivos = bat.vivos(m.lado);
    for (var i = 0; i < vivos.length; i++) if (vivos[i] !== m && dist(vivos[i], m) <= r) return true;
    return false;
  }
  function modParada(m, bat) {
    var v = Math.max(m.cc.parada || 0, m.escudo ? m.escudo.parada : -9);
    if (tiene(m, "guardia")) v += 1;
    if (tiene(m, "maestro")) v += 1;
    if (tiene(m, "muro") && aliadoCerca(m, bat, 2)) v += 1;
    v += bonoOrden(bat.bandas[m.lado], "filas");
    return v;
  }
  function modEsquiva(m, bat, contraDisparo) {
    var v = m.agi + m.arm.esq + (m.escudo && m.escudo.esquiva ? m.escudo.esquiva : 0);
    if (tiene(m, "reflejos")) v += 1;
    if (contraDisparo && tiene(m, "retirada")) v += 1;
    v += bonoOrden(bat.bandas[m.lado], "filas");
    return v;
  }
  function modDisparo(m, bat) {
    var v = atributo(m, m.dist.atr) + (m.dist.prec || 0);
    if (tiene(m, "calibrado")) v += 1;
    if (tiene(m, "punteria")) v += 1;
    v += bonoOrden(bat.bandas[m.lado], "fuego");
    return v;
  }
  function puedeBloquear(m, d) { return !!m.escudo; }

  // Daño estimado de un impacto (para decidir), sin efectos aleatorios.
  function danoEstimado(a, obj, arma, ayuda) {
    var d = arma.dano;
    if (tiene(a, "espalda") && ayuda > 0 && arma.cat === "cc") d += 1;
    if (tiene(a, "certero") && obj.arm.dur === 0) d += 1;
    if (obj.arm.dur > 0 && !esp(arma, "perfora")) d -= obj.arm.red;
    return Math.max(0, d);
  }

  // ---------- Daño y bajas ----------
  function aplicarImpacto(bat, a, obj, arma, ayuda, aDistancia) {
    if (obj.fuera) return 0;
    var d = arma.dano;
    if (tiene(a, "espalda") && ayuda > 0 && !aDistancia) d += 1;
    if (tiene(a, "certero") && obj.arm.dur === 0) d += 1;
    if (tiene(obj, "imparable") && !obj.usado.imparable) {
      obj.usado.imparable = true;
      bat.log("info", obj.nombre + " es imparable: ignora el impacto.", obj.lado);
      return 0;
    }
    if (obj.arm.dur > 0 && !esp(arma, "perfora")) {
      d = Math.max(0, d - obj.arm.red);
      obj.arm.dur = esp(arma, "rompe") ? 0 : obj.arm.dur - 1;
      if (obj.arm.dur === 0) bat.log("info", "La armadura de " + obj.nombre + " queda inutilizada.", obj.lado);
    }
    obj.hp -= d;
    a.st.danoHecho += d; obj.st.danoRecibido += d;
    var venena = esp(arma, "veneno") || (!aDistancia && tiene(a, "contagio"));
    if (venena && !tiene(obj, "constructo")) {
      if (bat.bandas[obj.lado].antidotos > 0 && !obj.antidoto) {
        obj.antidoto = true; bat.bandas[obj.lado].antidotos--; bat.usados[obj.lado].antidotos++;
        bat.log("info", obj.nombre + " bebe un antídoto.", obj.lado);
      } else obj.veneno += 1;
    }
    if (obj.hp === 1 && bat.bandas[obj.lado].pociones > 0 && !obj.usado.pocion) {
      obj.usado.pocion = true; bat.bandas[obj.lado].pociones--; bat.usados[obj.lado].pociones++;
      obj.hp = Math.min(obj.vidaMax, obj.hp + 2);
      bat.log("info", obj.nombre + " bebe una poción curativa (" + obj.hp + " de Vida).", obj.lado);
    }
    if (obj.hp <= 0) eliminar(bat, obj, a, aDistancia);
    return d;
  }

  function eliminar(bat, m, autor, aDistancia) {
    if (m.fuera) return;
    m.fuera = true; m.hp = 0;
    var b = bat.bandas[m.lado];
    var txt = "☠ " + m.nombre + " (" + m.tipo + ") queda fuera de combate";
    if (autor && autor.lado !== m.lado) {
      autor.st.bajas++;
      if (aDistancia) autor.st.bajasDist++;
      autor.st.victimas.push({ vidaMax: m.vidaMax, lider: m.lider });
      txt += " a manos de " + autor.nombre;
      if (!bat.primeraSangre) bat.primeraSangre = autor;
      bat.bajas[autor.lado]++;
      if (m.lider) bat.lideresCaidos[autor.lado] = true;
      if (bat.esc.id !== "cargamento") bat.puntos[autor.lado] += m.lider ? 2 : 1;
      else if (m.lider) bat.puntos[autor.lado] += 2;
    } else if (autor === null) {
      // Veneno u otros efectos: el punto es para el rival.
      var rival = 1 - m.lado;
      bat.bajas[rival]++;
      if (bat.esc.id !== "cargamento") bat.puntos[rival] += m.lider ? 2 : 1;
      else if (m.lider) bat.puntos[rival] += 2;
    }
    bat.log("baja", txt + ".", m.lado);
    if (tiene(m, "estallido")) {
      var enem = bat.vivos(1 - m.lado);
      for (var i = 0; i < enem.length; i++) {
        if (dist(enem[i], m) <= 1.01) {
          bat.log("info", "El cuerpo de " + m.nombre + " estalla y salpica a " + enem[i].nombre + ".", m.lado);
          enem[i].hp -= 1; enem[i].st.danoRecibido += 1; m.st.danoHecho += 1;
          if (enem[i].hp <= 0) eliminar(bat, enem[i], m, false);
        }
      }
    }
  }

  // ---------- Tiradas ----------
  // n dados; con 'repetir' se vuelve a tirar el más bajo si es 3 o menos; los
  // 6 dan un dado extra que no vuelve a explotar.
  function tirada(az, n, repetir) {
    var dados = az.dados(n);
    if (repetir) {
      var iMin = 0;
      for (var i = 1; i < dados.length; i++) if (dados[i] < dados[iMin]) iMin = i;
      if (dados[iMin] <= 3) dados[iMin] = az.d6();
    }
    var seis = dados.filter(function (d) { return d === 6; }).length;
    for (var k = 0; k < seis; k++) dados.push(az.d6());
    return dados;
  }

  // ---------- Combate mutuo ----------
  function ayudas(bat, a, obj) {
    // Aliados de 'a' trabados con 'obj' (sin contar a 'a').
    var n = 0, aul = false;
    var al = bat.vivos(a.lado);
    for (var i = 0; i < al.length; i++) {
      if (al[i] === a) continue;
      if (dist(al[i], obj) <= 1.01) n++;
      else if (dist(al[i], obj) <= 3 && tiene(a, "aullido")) aul = true;
    }
    if (aul) n++;
    return Math.min(2, n);
  }

  function combate(bat, A, B, op) {
    op = op || {};
    var az = bat.azar;
    if (A.fuera || B.fuera) return;
    var lados = [A, B];
    var ayA = ayudas(bat, A, B), ayB = ayudas(bat, B, A);
    var sup = ayA - ayB;
    var S = lados.map(function (m, i) {
      var o = lados[1 - i];
      var n = 3, rep = false;
      var ventaja = i === 0 ? sup : -sup;
      if (ventaja >= 1) rep = true;
      if (ventaja >= 2) n += 1;
      if (tiene(m, "desafio") && o.lider) n += 1;
      if (i === 0 && op.carga && tiene(m, "cargaInq")) rep = true;
      if (i === 0 && op.carga && tiene(m, "furia")) n += 1;
      return {
        m: m, dados: tirada(az, n, rep).sort(function (x, y) { return y - x; }),
        golpe: modGolpe(m, o, bat), parada: modParada(m, bat), esquiva: modEsquiva(m, bat, false),
        ayuda: i === 0 ? ayA : ayB, impactos: 0, dano: 0, paradas: 0, esquivas: 0, hp0: m.hp
      };
    });
    S[0].danoEst = danoEstimado(A, B, A.cc, S[0].ayuda);
    S[1].danoEst = danoEstimado(B, A, B.cc, S[1].ayuda);
    A.st.combates++; B.st.combates++;
    var inicioLog = bat.cronica.length;

    function golpeaVal(s, v) { return exito(v, s.golpe); }
    function quitarDado(s, v) { var i = s.dados.indexOf(v); if (i >= 0) s.dados.splice(i, 1); }
    function valorGolpe(s, o) {
      if (s.danoEst > 0) return s.danoEst;
      return o.m.arm.dur > 0 ? 0.4 : 0;
    }
    // Busca el dado más bajo de 's' capaz de anular el dado 'v' del rival.
    function anulador(s, o, v, contraGolpe) {
      var mejor = null, tipo = null;
      for (var i = s.dados.length - 1; i >= 0; i--) {
        var w = s.dados[i];
        var para = exito(w, s.parada) && (v !== 6 || w === 6);
        var esq = w !== 1 && (w === 6 || w + s.esquiva >= v + o.golpe);
        if (para || esq) { mejor = w; tipo = para ? "parada" : "esquiva"; break; }
      }
      return mejor === null ? null : { dado: mejor, tipo: tipo };
    }
    function resolverGolpe(s, o, v) {
      // Reacción del rival (defensa reactiva).
      if (o.dados.length > 0) {
        var an = anulador(o, s, v, true);
        if (an) {
          var entrante = s.danoEst;
          var mata = entrante >= o.m.hp;
          var noGolpea = !golpeaVal(o, an.dado);
          if (entrante > 0 && (mata || noGolpea || entrante >= o.danoEst || o.danoEst === 0)) {
            quitarDado(o, an.dado);
            if (an.tipo === "parada") {
              o.paradas++; o.m.st.paradas++;
              if (esp(o.m.escudo, "doblePar") && !o.doblePar) {
                o.doblePar = true;
                var extra = s.dados.filter(function (x) { return golpeaVal(s, x) && (x !== 6 || an.dado === 6); })[0];
                if (extra !== undefined) { quitarDado(s, extra); o.paradas++; o.m.st.paradas++; }
              }
            } else { o.esquivas++; o.m.st.esquivas++; }
            return;
          }
        }
      }
      s.impactos++;
      s.dano += aplicarImpacto(bat, s.m, o.m, s.m.cc, s.ayuda, false);
    }

    var turno = 0, guardia = 0;
    while (guardia++ < 60) {
      if (A.fuera || B.fuera) break;
      // El daño esperado cambia si se rompe una armadura durante el combate.
      S[0].danoEst = danoEstimado(A, B, A.cc, S[0].ayuda);
      S[1].danoEst = danoEstimado(B, A, B.cc, S[1].ayuda);
      var s = S[turno], o = S[1 - turno];
      if (s.dados.length === 0) {
        if (o.dados.length === 0) break;
        turno = 1 - turno; continue;
      }
      var golpes = s.dados.filter(function (v) { return golpeaVal(s, v); });
      var amenazas = o.dados.filter(function (v) { return golpeaVal(o, v); });
      var miValor = valorGolpe(s, o);
      var golpesParaMatar = s.danoEst > 0 ? Math.ceil(o.m.hp / s.danoEst) : 99;
      // ¿Puedo quitarle un dado peligroso?
      var quitar = null;
      for (var k = 0; k < amenazas.length && !quitar; k++) {
        var an = anulador(s, o, amenazas[k], false);
        if (an && !golpeaVal(s, an.dado)) quitar = { v: amenazas[k], an: an };
        else if (an && !quitar && o.danoEst > miValor) quitar = { v: amenazas[k], an: an };
      }
      if (esp(s.m.cc, "dobleGolpe") && golpes.length >= 2 && miValor > 0) {
        quitarDado(s, golpes[0]); quitarDado(s, golpes[1]);
        resolverGolpe(s, o, golpes[0]);
        if (!o.m.fuera && !s.m.fuera) resolverGolpe(s, o, golpes[1]);
      } else if (golpes.length > 0 && miValor > 0 &&
        (miValor >= o.danoEst || amenazas.length === 0 || golpes.length >= golpesParaMatar || !quitar)) {
        quitarDado(s, golpes[0]);
        resolverGolpe(s, o, golpes[0]);
      } else if (quitar && o.danoEst > 0) {
        quitarDado(s, quitar.an.dado); quitarDado(o, quitar.v);
        if (quitar.an.tipo === "parada") {
          s.paradas++; s.m.st.paradas++;
          if (esp(s.m.escudo, "doblePar") && !s.doblePar) {
            s.doblePar = true;
            var seg = o.dados.filter(function (x) { return golpeaVal(o, x) && (x !== 6 || quitar.an.dado === 6); })[0];
            if (seg !== undefined) { quitarDado(o, seg); s.paradas++; s.m.st.paradas++; }
          }
        } else { s.esquivas++; s.m.st.esquivas++; }
      } else if (golpes.length > 0 && miValor > 0) {
        quitarDado(s, golpes[0]);
        resolverGolpe(s, o, golpes[0]);
      } else {
        // El dado no sirve: se gasta "a la nada".
        s.dados.pop();
      }
      turno = 1 - turno;
    }
    if (A.hp >= S[0].hp0 && !A.fuera) A.st.combatesSinPerder++;
    if (B.hp >= S[1].hp0 && !B.fuera) B.st.combatesSinPerder++;

    function resumen(s) {
      var p = [];
      if (s.impactos) p.push("impacta " + s.impactos + (s.impactos === 1 ? " vez" : " veces") + " (" + s.dano + " daño)");
      if (s.paradas) p.push("para " + s.paradas);
      if (s.esquivas) p.push("esquiva " + s.esquivas);
      return s.m.nombre + (p.length ? " " + p.join(", ") : " no consigue nada");
    }
    var cab = op.carga ? "⚔ " + A.nombre + " carga contra " + B.nombre : op.gratis ? "⚔ " + A.nombre + " castiga la huida de " + B.nombre : "⚔ " + A.nombre + " ataca a " + B.nombre;
    if (sup !== 0) cab += " (" + (sup > 0 ? A.nombre : B.nombre) + " tiene " + Math.abs(sup) + (Math.abs(sup) === 1 ? " ayuda" : " ayudas") + ")";
    var estado = function (m) { return m.fuera ? m.nombre + " cae" : m.nombre + " " + m.hp + "/" + m.vidaMax; };
    bat.insertar(inicioLog, "combate", cab + ". " + resumen(S[0]) + "; " + resumen(S[1]) + ". [" + estado(A) + " · " + estado(B) + "]", A.lado);
  }

  // ---------- Disparo ----------
  function disparar(bat, m, obj) {
    var az = bat.azar;
    var arma = m.dist;
    var magia = esp(arma, "magia");
    var n = 3 + (magia && tiene(m, "eco") ? 1 : 0);
    var mod = modDisparo(m, bat);
    var dados = tirada(az, n, false);
    var exitos = dados.filter(function (d) { return exito(d, mod); }).sort(function (x, y) { return y - x; });
    var txt = "➶ " + m.nombre + " " + (magia ? "lanza un hechizo" : "dispara") + " a " + obj.nombre + ": " + exitos.length + (exitos.length === 1 ? " éxito" : " éxitos");
    var inicioLog = bat.cronica.length;
    var anulados = 0, cubiertos = 0, defendio = false;
    // Defensa: cuesta 1 punto de acción (decisión provisional del juego).
    if (exitos.length > 0 && obj.ap > 0 && !obj.fuera) {
      var bloquea = puedeBloquear(obj) && !(magia && tiene(m, "palabra"));
      var esq = modEsquiva(obj, bat, true);
      var vale = danoEstimado(m, obj, arma, 0) > 0 || obj.arm.dur > 0;
      if (vale && (bloquea || esq >= 3) && bat.quiereDefender(obj)) {
        obj.ap--; defendio = true;
        var def = tirada(az, 3, false).sort(function (x, y) { return x - y; });
        var par = modParada(obj, bat);
        var restantes = [];
        for (var i = 0; i < exitos.length; i++) {
          var v = exitos[i], usado = -1, tipo = null;
          for (var j = 0; j < def.length; j++) {
            var w = def[j];
            var b = bloquea && exito(w, par) && (v !== 6 || w === 6);
            var e = w !== 1 && (w === 6 || w + esq >= v + mod);
            if (b || e) { usado = j; tipo = b ? "b" : "e"; break; }
          }
          if (usado >= 0) {
            def.splice(usado, 1); anulados++;
            if (tipo === "b") obj.st.paradas++; else obj.st.esquivas++;
          } else restantes.push(v);
        }
        exitos = restantes;
        if (anulados > 0) {
          // Al esquivar se aleja 2".
          var dx = obj.x - m.x, dy = obj.y - m.y, l = Math.hypot(dx, dy) || 1;
          obj.x = JG.limitar(obj.x + dx / l * 2, 0, 24); obj.y = JG.limitar(obj.y + dy / l * 2, 0, 24);
        }
      }
    }
    // Cobertura al final: 1D6 por éxito, 5+ lo anula.
    var cubierto = bat.azar.probabilidad(bat.esc.cobertura) || tiene(obj, "sombras");
    if (tiene(m, "olfatear") || tiene(m, "halcon")) cubierto = false;
    if (cubierto && exitos.length) {
      exitos = exitos.filter(function () { var c = az.d6() >= 5; if (c) cubiertos++; return !c; });
    }
    var danoTotal = 0;
    for (var h = 0; h < exitos.length && !obj.fuera; h++) danoTotal += aplicarImpacto(bat, m, obj, arma, 0, true);
    if (defendio) txt += "; " + obj.nombre + " se defiende y anula " + anulados;
    if (cubiertos) txt += "; la cobertura detiene " + cubiertos;
    txt += ". " + (exitos.length ? exitos.length + " impacto" + (exitos.length > 1 ? "s" : "") + ", " + danoTotal + " daño" : "Sin impactos") + ".";
    if (!obj.fuera && exitos.length) txt += " [" + obj.nombre + " " + obj.hp + "/" + obj.vidaMax + "]";
    bat.insertar(inicioLog, "disparo", txt, m.lado);
  }

  // ---------- Movimiento ----------
  function moverHacia(m, tx, ty, distancia, parada) {
    var dx = tx - m.x, dy = ty - m.y, l = Math.hypot(dx, dy);
    if (l <= parada) return;
    var paso = Math.min(distancia, l - parada);
    m.x += dx / l * paso; m.y += dy / l * paso;
  }
  function movimiento(bat, m) {
    var b = bat.bandas[m.lado];
    var mv = m.mov;
    if (bat.ronda === 1 && tiene(m, "emboscada")) mv += 3;
    if (b.ordenActiva === "adelante") mv += 2;
    return mv;
  }

  // ---------- IA táctica ----------
  function enemigosTrabados(bat, m) {
    return bat.vivos(1 - m.lado).filter(function (e) { return dist(e, m) <= 1.01; });
  }
  function esTirador(m) {
    if (!m.dist) return false;
    var dDist = m.dist.dano + (m[m.dist.atr] || 0);
    var dCC = m.cc.dano + (m[m.cc.atr] || 0) + (esp(m.cc, "dobleGolpe") ? 1 : 0);
    return dDist >= dCC;
  }
  function reserva(bat, m, reaccion) {
    if (reaccion) return 0;
    var postura = bat.bandas[m.lado].postura;
    var defiende = !!m.escudo || modEsquiva(m, bat, true) >= 4;
    if (postura === "agresiva") return 0;
    if (postura === "defensiva") return m.acc >= 2 && defiende ? 1 : 0;
    return m.acc >= 3 && defiende ? 1 : 0;
  }
  function valorObjetivo(bat, m, e, arma) {
    var d = danoEstimado(m, e, arma, 0);
    var v = d * 2 + (e.lider ? 3 : 0) + (e.hp <= d ? 6 : 0) - e.hp;
    if (bat.marcado[m.lado] === e) v += 2;
    return v;
  }
  function mejorObjetivo(bat, m, lista, arma) {
    var mejor = null, mv = -1e9;
    for (var i = 0; i < lista.length; i++) {
      var v = valorObjetivo(bat, m, lista[i], arma);
      if (v > mv) { mv = v; mejor = lista[i]; }
    }
    return mejor;
  }

  function intentarSalir(bat, m, trabados) {
    var n = 3 + (tiene(m, "retirada") ? 1 : 0);
    var mod = m.agi - (trabados.length - 1);
    var ok = tirada(bat.azar, n, false).some(function (d) { return exito(d, mod, 8); });
    if (ok) {
      var cx = JG.suma(trabados, function (e) { return e.x; }) / trabados.length;
      var cy = JG.suma(trabados, function (e) { return e.y; }) / trabados.length;
      var dx = m.x - cx, dy = m.y - cy, l = Math.hypot(dx, dy) || 1;
      m.x = JG.limitar(m.x + dx / l * movimiento(bat, m), 0, 24);
      m.y = JG.limitar(m.y + dy / l * movimiento(bat, m), 0, 24);
      m.sinCarga = true;
      bat.log("mov", m.nombre + " se libera del combate y se retira.", m.lado);
    } else {
      bat.log("mov", m.nombre + " intenta huir, pero no lo consigue.", m.lado);
      combate(bat, trabados[0], m, { gratis: true });
    }
  }

  function activar(bat, m, reaccion) {
    var b = bat.bandas[m.lado];
    var gastados = 0;
    var disparoLento = false;
    m.sinCarga = false;
    if (m.aturdido) {
      bat.log("info", m.nombre + " está aturdido y no puede actuar.", m.lado);
      m.ap = 0; return;
    }
    var res = reserva(bat, m, reaccion);
    var guardia = 0;
    while (m.ap > 0 && !m.fuera && guardia++ < 8) {
      if (gastados >= 1 && m.ap <= res) break;
      var enemigos = bat.vivos(1 - m.lado);
      if (!enemigos.length) break;
      var trab = enemigosTrabados(bat, m);
      if (trab.length) {
        var flojo = m.hp === 1 && trab.some(function (e) { return danoEstimado(e, m, e.cc, 0) >= 1; });
        if ((esTirador(m) && m.cc.dano <= 1) || (flojo && trab.length > 1)) {
          m.ap--; gastados++;
          intentarSalir(bat, m, trab);
          continue;
        }
        var obj = mejorObjetivo(bat, m, trab, m.cc);
        m.ap--; gastados++;
        combate(bat, m, obj, {});
        continue;
      }
      // Sello de Contención
      if (tiene(m, "sello") && !m.usado.sello) {
        var cand = enemigos.filter(function (e) { return dist(e, m) <= 12 && !e.aturdido; });
        if (cand.length) {
          var fuerte = cand.sort(function (x, y) { return (y.acc + y.fue + y.agi) - (x.acc + x.fue + x.agi); })[0];
          m.usado.sello = true; m.ap--; gastados++;
          var ok = tirada(bat.azar, 3, false).some(function (d) { return exito(d, m.mag, 8); });
          if (ok) { fuerte.aturdido = true; fuerte.ap = 0; bat.log("info", "✦ " + m.nombre + " traza el Sello de Contención: " + fuerte.nombre + " queda aturdido.", m.lado); }
          else bat.log("info", "✦ " + m.nombre + " intenta el Sello de Contención, pero falla.", m.lado);
          continue;
        }
      }
      // Reparación de Campo
      if (tiene(m, "reparacion") && !m.usado.reparacion) {
        var rep = bat.vivos(m.lado).filter(function (x) { return dist(x, m) <= 2 && x.arm.durMax - x.arm.dur >= 2; })[0];
        if (rep) {
          m.usado.reparacion = true; m.ap--; gastados++;
          rep.arm.dur = Math.min(rep.arm.durMax, rep.arm.dur + 2);
          bat.log("info", "⚙ " + m.nombre + " repara la armadura de " + rep.nombre + ".", m.lado);
          continue;
        }
      }
      var libres = enemigos.filter(function (e) { return enemigosTrabados(bat, e).length === 0; });
      var tirador = esTirador(m);
      var enRango = m.dist && !disparoLento ? libres.filter(function (e) { return dist(e, m) <= m.dist.alcance; }) : [];
      // Carga
      var mv = movimiento(bat, m);
      var postura = b.postura;
      var margen = postura === "agresiva" ? 4 : postura === "defensiva" ? 2 : 3;
      var cargables = m.sinCarga || m.ap < 2 ? [] : enemigos.filter(function (e) { return dist(e, m) - 1 <= mv + margen; });
      if (postura === "defensiva") cargables = cargables.filter(function (e) { return e.hp <= danoEstimado(m, e, m.cc, 0) * 2 || ayudas(bat, m, e) > 0; });
      var preferirDisparo = tirador && enRango.length > 0;
      if (cargables.length && !preferirDisparo) {
        var objC = mejorObjetivo(bat, m, cargables, m.cc);
        m.ap -= 2; gastados += 2;
        var necesita = dist(objC, m) - 1;
        var alcance = mv + bat.azar.d3() + 1;
        if (necesita <= alcance) {
          moverHacia(m, objC.x, objC.y, necesita + 0.1, 1);
          if (tiene(objC, "trampa") && !objC.usado.trampa) {
            objC.usado.trampa = true;
            bat.log("info", "⚙ " + m.nombre + " pisa una trampa mecánica de " + objC.nombre + ".", m.lado);
            m.hp -= 1; m.st.danoRecibido += 1; objC.st.danoHecho += 1;
            if (m.hp <= 0) { eliminar(bat, m, objC, false); continue; }
          }
          combate(bat, m, objC, { carga: true });
        } else {
          moverHacia(m, objC.x, objC.y, alcance, 1.2);
          bat.log("mov", m.nombre + " carga contra " + objC.nombre + ", pero se queda corto.", m.lado);
        }
        continue;
      }
      if (enRango.length) {
        var objD = mejorObjetivo(bat, m, enRango, m.dist);
        m.ap--; gastados++;
        if (esp(m.dist, "lenta")) disparoLento = true;
        disparar(bat, m, objD);
        continue;
      }
      // Moverse: hacia un cofre (cargamento) o hacia el enemigo.
      var destino = null;
      if (bat.esc.objetivos && !m.lider && !tirador) {
        var obs = bat.esc.objetivos.map(function (o, i) { return { x: o[0], y: o[1], i: i }; });
        obs = obs.filter(function (o) { return bat.control[o.i] !== m.lado; });
        if (obs.length) destino = obs.sort(function (p, q) { return dist(p, m) - dist(q, m); })[0];
      }
      var objM = mejorObjetivo(bat, m, enemigos, m.cc);
      var cerca = enemigos.slice().sort(function (p, q) { return dist(p, m) - dist(q, m); })[0];
      if (destino && dist(cerca, m) > mv + 3) {
        m.ap--; gastados++;
        moverHacia(m, destino.x, destino.y, mv, 0.5);
        continue;
      }
      if (tirador && m.dist) {
        // Acercarse solo hasta tener a alguien a tiro.
        m.ap--; gastados++;
        moverHacia(m, cerca.x, cerca.y, mv, Math.max(1.5, m.dist.alcance - 1));
        continue;
      }
      if (postura === "defensiva" && gastados >= 1) break;
      m.ap--; gastados++;
      moverHacia(m, (objM || cerca).x, (objM || cerca).y, mv, 1.3);
    }
    if (gastados === 0 && m.ap > 0) m.ap--; // siempre se gasta al menos 1
  }

  // ---------- Batalla ----------
  // bandas: [{ nombre, gremio, color, miniaturas: [personajes], postura,
  //   ordenes: [ids], pociones, antidotos, elixires }, ...]
  function batalla(bandas, escId, azar, opciones) {
    opciones = opciones || {};
    var esc = D.escenarios.filter(function (e) { return e.id === escId; })[0] || D.escenarios[0];
    var cronica = [];
    var bat = {
      azar: azar, esc: esc, ronda: 0, cronica: cronica,
      bandas: bandas.map(function (b) {
        return { nombre: b.nombre, gremio: b.gremio, color: b.color, postura: b.postura || "equilibrada",
          ordenes: (b.ordenes || []).slice(), pociones: b.pociones || 0, antidotos: b.antidotos || 0,
          elixires: b.elixires || 0, ordenActiva: null };
      }),
      usados: [{ pociones: 0, antidotos: 0, elixires: 0, ordenes: [] }, { pociones: 0, antidotos: 0, elixires: 0, ordenes: [] }],
      puntos: [0, 0], bajas: [0, 0], lideresCaidos: [false, false], marcado: [null, null],
      control: esc.objetivos ? esc.objetivos.map(function () { return -1; }) : [],
      primeraSangre: null,
      log: function (tipo, texto, lado) { cronica.push({ r: bat.ronda, tipo: tipo, texto: texto, lado: lado }); },
      insertar: function (i, tipo, texto, lado) { cronica.splice(i, 0, { r: bat.ronda, tipo: tipo, texto: texto, lado: lado }); }
    };
    bat.mins = [];
    bandas.forEach(function (b, lado) {
      var lista = b.miniaturas.map(function (p) { return crearMiniatura(p, lado, b); });
      var n = lista.length;
      lista.forEach(function (m, i) {
        m.x = 2 + (20 * (i + 0.5) / n);
        m.y = lado === 0 ? 7 : 17;
        if (bat.bandas[lado].elixires > 0 && !m.contratado) { m.elixir = true; bat.bandas[lado].elixires--; bat.usados[lado].elixires++; }
      });
      bat.mins = bat.mins.concat(lista);
    });
    bat.vivos = function (lado) { return bat.mins.filter(function (m) { return m.lado === lado && !m.fuera; }); };
    bat.quiereDefender = function (m) {
      var p = bat.bandas[m.lado].postura;
      if (p === "agresiva") return m.activada || m.ap > 1;
      return true;
    };

    bat.log("info", "Escenario: " + esc.nombre + ". " + esc.desc, -1);
    // Marca de Muerte
    [0, 1].forEach(function (lado) {
      var marca = bat.vivos(lado).some(function (m) { return tiene(m, "marca"); });
      if (marca) {
        var obj = bat.vivos(1 - lado).filter(function (m) { return m.lider; })[0] || bat.vivos(1 - lado)[0];
        if (obj) { bat.marcado[lado] = obj; bat.log("info", "☩ " + bandas[lado].nombre + " marca a " + obj.nombre + " para la muerte.", lado); }
      }
    });

    var ultimaIni = -1;
    for (var r = 1; r <= esc.rondas; r++) {
      bat.ronda = r;
      if (!bat.vivos(0).length || !bat.vivos(1).length) break;
      // 1. Iniciativa
      var ini;
      do {
        var t0 = azar.d6(), t1 = azar.d6();
        if (t0 !== t1) ini = t0 > t1 ? 0 : 1;
        else if (ultimaIni >= 0) ini = 1 - ultimaIni;
      } while (ini === undefined);
      ultimaIni = ini;
      bat.log("ronda", "Ronda " + r + " — iniciativa para " + bandas[ini].nombre + ".", ini);
      // 2. Órdenes
      bat.bandas.forEach(function (b, lado) {
        b.ordenActiva = null;
        if (!b.ordenes.length) return;
        var vivosE = bat.vivos(1 - lado), vivosP = bat.vivos(lado);
        var dmin = 99;
        vivosP.forEach(function (m) { vivosE.forEach(function (e) { dmin = Math.min(dmin, dist(m, e)); }); });
        var elegir = null;
        if (b.ordenes.indexOf("adelante") >= 0 && r === 1) elegir = "adelante";
        else if (b.ordenes.indexOf("carga") >= 0 && dmin <= 10) elegir = "carga";
        else if (b.ordenes.indexOf("fuego") >= 0 && vivosP.some(function (m) { return m.dist; }) && dmin <= 18) elegir = "fuego";
        else if (b.ordenes.indexOf("filas") >= 0 && dmin <= 8) elegir = "filas";
        if (elegir) {
          b.ordenes.splice(b.ordenes.indexOf(elegir), 1);
          b.ordenActiva = elegir; bat.usados[lado].ordenes.push(elegir);
          bat.log("orden", "📯 " + bandas[lado].nombre + ": " + D.ordenes[elegir].nombre, lado);
        }
      });
      // 3. Activaciones
      bat.mins.forEach(function (m) { m.activada = false; m.reaccionoFalta = false; m.ap = m.aturdido ? 0 : m.acc; });
      var lado = ini, guard = 0;
      while (guard++ < 100) {
        var pend0 = bat.vivos(0).filter(function (m) { return !m.activada; });
        var pend1 = bat.vivos(1).filter(function (m) { return !m.activada; });
        if (!pend0.length && !pend1.length) break;
        if (!bat.vivos(0).length || !bat.vivos(1).length) break;
        var pend = lado === 0 ? pend0 : pend1;
        if (!pend.length) { lado = 1 - lado; continue; }
        // Orden: primero quien ya está trabado o puede cargar o disparar.
        pend.sort(function (p, q) { return prioridad(bat, q) - prioridad(bat, p); });
        var m = pend[0];
        m.activada = true;
        activar(bat, m, false);
        // Reacción por falta de miniaturas
        var otro = 1 - lado;
        var pendOtro = bat.vivos(otro).filter(function (x) { return !x.activada; });
        var pendYo = bat.vivos(lado).filter(function (x) { return !x.activada; });
        if (!pendOtro.length && pendYo.length) {
          var reac = bat.vivos(otro).filter(function (x) { return x.ap > 0 && !x.reaccionoFalta; })
            .sort(function (p, q) { return prioridad(bat, q) - prioridad(bat, p); })[0];
          if (reac) {
            reac.reaccionoFalta = true;
            bat.log("mov", "↺ " + reac.nombre + " reacciona (su banda ya no tiene miniaturas por activar).", otro);
            activar(bat, reac, true);
          }
        }
        lado = 1 - lado;
      }
      // Puntos por cofres (desde la 2.ª ronda)
      if (esc.objetivos) {
        esc.objetivos.forEach(function (o, i) {
          var c = [0, 1].map(function (l) { return bat.vivos(l).filter(function (m) { return Math.hypot(m.x - o[0], m.y - o[1]) <= 3; }).length; });
          bat.control[i] = c[0] > c[1] ? 0 : c[1] > c[0] ? 1 : -1;
          if (r >= 2 && bat.control[i] >= 0) bat.puntos[bat.control[i]]++;
        });
        if (r >= 2) bat.log("puntos", "Cofres controlados: " + bandas[0].nombre + " " + bat.control.filter(function (c) { return c === 0; }).length +
          " · " + bandas[1].nombre + " " + bat.control.filter(function (c) { return c === 1; }).length + ".", -1);
      }
      // 4. Mantenimiento
      bat.mins.forEach(function (m) {
        m.aturdido = false;
        if (!m.fuera && m.veneno > 0) {
          m.hp -= 1; m.st.danoRecibido += 1; m.veneno -= 1;
          bat.log("mant", "☣ El veneno consume a " + m.nombre + " (" + Math.max(0, m.hp) + "/" + m.vidaMax + ").", m.lado);
          if (m.hp <= 0) eliminar(bat, m, null, false);
        }
      });
      bat.log("puntos", "Marcador: " + bandas[0].nombre + " " + bat.puntos[0] + " – " + bat.puntos[1] + " " + bandas[1].nombre + ".", -1);
    }
    // Aniquilación
    [0, 1].forEach(function (l) {
      if (!bat.vivos(1 - l).length && bat.vivos(l).length) {
        bat.puntos[l] += 3;
        bat.log("puntos", bandas[l].nombre + " aniquila a su rival (+3 puntos).", l);
      }
    });
    var ganador = bat.puntos[0] > bat.puntos[1] ? 0 : bat.puntos[1] > bat.puntos[0] ? 1 : -1;
    bat.ronda = esc.rondas + 1;
    bat.log("final", ganador < 0 ? "Empate " + bat.puntos[0] + " – " + bat.puntos[1] + "." :
      "Victoria de " + bandas[ganador].nombre + " por " + bat.puntos[ganador] + " – " + bat.puntos[1 - ganador] + ".", ganador);

    // Proezas
    var proezas = (opciones.proezas || []).map(function (id) { return D.proezas.filter(function (p) { return p.id === id; })[0]; });
    var logros = [];
    proezas.forEach(function (pz) {
      var cand = bat.mins.filter(function (m) { return !m.contratado && cumpleProeza(bat, m, pz); });
      if (cand.length) {
        var m = cand.sort(function (a, b) { return (b.st.bajas + b.st.danoHecho) - (a.st.bajas + a.st.danoHecho); })[0];
        logros.push({ proeza: pz.id, ref: m.ref, lado: m.lado, nombre: m.nombre });
        bat.log("proeza", "★ Proeza «" + pz.nombre + "»: " + m.nombre + " (" + bandas[m.lado].nombre + ").", m.lado);
      }
    });

    return {
      escenario: esc.id, escenarioNombre: esc.nombre, ganador: ganador, puntos: bat.puntos, bajas: bat.bajas,
      cronica: cronica, proezas: logros, usados: bat.usados,
      miniaturas: bat.mins.map(function (m) {
        return { ref: m.ref, nombre: m.nombre, tipo: m.tipo, lado: m.lado, fuera: m.fuera, hp: m.hp, vidaMax: m.vidaMax,
          contratado: m.contratado, lider: m.lider, st: m.st };
      })
    };
  }

  function prioridad(bat, m) {
    var e = bat.vivos(1 - m.lado);
    var dmin = 99;
    e.forEach(function (x) { dmin = Math.min(dmin, dist(x, m)); });
    if (dmin <= 1.01) return 100;
    var p = 50 - dmin;
    if (m.dist && dmin <= m.dist.alcance) p += 20;
    if (tiene(m, "sello")) p += 15;
    return p;
  }

  function cumpleProeza(bat, m, pz) {
    switch (pz.id) {
      case "matagigantes": return m.st.victimas.some(function (v) { return v.vidaMax > m.vidaMax; });
      case "primera": return bat.primeraSangre === m;
      case "intocable": return m.st.combatesSinPerder >= 3;
      case "muro": return m.st.paradas >= 4;
      case "aguila": return m.st.bajasDist >= 2;
      case "verdugo": return m.st.bajas >= 2;
      case "sangre": return !m.fuera && m.hp === 1;
      case "regicida": return m.st.victimas.some(function (v) { return v.lider; });
    }
    return false;
  }

  JG.batalla = batalla;
  JG._combate = { exito: exito, tirada: tirada };
})();
