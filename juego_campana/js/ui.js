// Interfaz del juego: pantallas, pestañas, diálogos y crónicas.
var JG = globalThis.JG = globalThis.JG || {};

(function () {
  var D = JG.DATOS, C = JG.campana;
  var U = JG.ui = { e: null, tab: "fase", dialogo: null, cronica: null, inicio: { gremio: "asesinos", sesiones: 8, nombre: "" }, filtro: "cc" };

  // ---------- Utilidades de HTML ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ico(n, cls) { return '<span class="icono ' + (cls || "") + '" aria-hidden="true">' + (JG.ICONOS[n] || "") + "</span>"; }
  function etq(t, cls, titulo) { return '<span class="etq ' + (cls || "") + '"' + (titulo ? ' title="' + esc(titulo) + '"' : "") + ">" + t + "</span>"; }
  function boton(texto, acc, datos, cls, deshab, titulo) {
    var d = "";
    for (var k in datos || {}) d += " data-" + k + '="' + esc(datos[k]) + '"';
    return '<button class="' + (cls || "") + '" data-acc="' + acc + '"' + d + (deshab ? " disabled" : "") + (titulo ? ' title="' + esc(titulo) + '"' : "") + ">" + texto + "</button>";
  }
  function signo(n) { return n > 0 ? "+" + n : String(n); }
  var MODO = { rapido: "rápido", lento: "lento" };
  function nombreAtr(a) { return { fue: "Fuerza", agi: "Agilidad", mag: "Magia", men: "Mente" }[a] || a; }
  function aviso(texto, error) {
    var c = document.getElementById("avisos");
    var t = document.createElement("div");
    t.className = "toast" + (error ? " error" : "");
    t.textContent = texto;
    c.appendChild(t);
    setTimeout(function () { t.remove(); }, error ? 5200 : 3200);
  }
  U.aviso = aviso;
  function hecho(err, ok) {
    if (err) { aviso(err, true); return false; }
    if (ok) aviso(ok);
    guardar(); return true;
  }
  function guardar() { if (U.e) C.guardar(U.e); }
  function enPreparacion() { return U.e && U.e.fase === "preparacion"; }

  // Descripción corta de un objeto.
  function descItem(id) {
    var it = D.equipo[id];
    if (!it) return "—";
    var p = [];
    if (it.cat === "cc") p.push("Daño " + it.dano, "Parada " + signo(it.parada), nombreAtr(it.atr) + (it.prec ? " " + signo(it.prec) : ""));
    if (it.cat === "dist") p.push("Daño " + it.dano, it.alcance + '"', nombreAtr(it.atr) + (it.prec ? " " + signo(it.prec) : ""));
    if (it.cat === "escudo") p.push("Parada " + signo(it.parada));
    if (it.cat === "armadura") p.push("Reducción " + it.red, "Durabilidad " + it.dur, "Esquiva " + signo(it.esquiva));
    if (it.cat === "consumible") p.push(it.desc);
    (it.esp || []).forEach(function (s) {
      var n = { dobleGolpe: "Doble golpe", rompe: "Rompearmaduras", doblePar: "Doble parada", veneno: "Veneno", lenta: "Lenta (1 disparo)", magia: "Magia", perfora: "Ignora armadura", dosManos: "Dos manos", cubre: "Cubre", sombras: "Sombras" }[s];
      if (n) p.push(n);
    });
    return p.join(" · ");
  }
  var DESC_ESP = {
    dobleGolpe: "Doble golpe: en tu turno puedes asignar dos dados a golpear a la vez.",
    rompe: "Rompearmaduras: un impacto deja inutilizada la armadura.",
    doblePar: "Doble parada: una vez por combate, un dado de parada elimina dos dados rivales.",
    veneno: "Veneno: cada impacto envenena (1 daño en el mantenimiento).",
    lenta: "Lenta: solo un disparo por activación.",
    magia: "Ataque mágico: usa Magia.", perfora: "Ignora la Reducción de la armadura.",
    dosManos: "A dos manos: no permite escudo."
  };
  function tituloItem(id) {
    var it = D.equipo[id];
    if (!it) return "";
    return it.nombre + ". " + descItem(id) + ". " + (it.esp || []).map(function (s) { return DESC_ESP[s] || ""; }).join(" ");
  }
  function nombreItem(id) { return id ? D.equipo[id].nombre : "—"; }

  // ---------- Render principal ----------
  U.render = function () {
    var app = document.getElementById("app");
    var html;
    if (!U.e) html = vistaInicio();
    else if (U.e.finalizada) html = vistaFinal();
    else html = vistaJuego();
    if (U.dialogo) html += vistaDialogo();
    app.innerHTML = html;
  };

  // ---------- Pantalla de inicio ----------
  function vistaInicio() {
    var guardada = C.cargar();
    var ini = U.inicio;
    var h = '<div class="contenedor"><div class="portada">' + ico("niebla", "grande") +
      "<h1>Gremios de la Niebla</h1>" +
      '<p class="lema">Una niebla gris devora la ciudad barrio a barrio. Siete gremios se disputan lo que queda: contratos, reliquias y fama. ' +
      "Dirige a tu gremio durante la campaña, manda a tu gente a los encargos, prepara cada batalla… y decide cuánto te importa que la ciudad sobreviva. " +
      "Si la Niebla llena su medidor, <b>todos</b> perdéis.</p></div>";
    if (guardada && guardada.bandas) {
      var bj = guardada.bandas[0];
      h += '<div class="panel aviso oro"><div class="fila entre"><div><b>Partida guardada:</b> ' + esc(bj.nombre) + " · sesión " + guardada.sesion + " de " + guardada.sesiones +
        (guardada.finalizada ? " (terminada)" : "") + "</div><div class=\"fila\">" + boton("Continuar", "continuar", {}, "principal") + " " +
        boton("Borrar partida", "borrar", {}, "peligro") + "</div></div></div>";
    }
    h += '<div class="panel"><h2>1. Elige tu gremio</h2><div class="rejilla ancha">';
    D.gremios.forEach(function (g) {
      var sel = ini.gremio === g.id;
      h += '<div class="tarjeta elegible gremio-card' + (sel ? " elegida" : "") + '" data-acc="elegirGremio" data-id="' + g.id + '">' +
        '<span class="franja" style="background:' + g.color + '"></span>' +
        '<div class="cab"><span style="color:' + g.color + '">' + ico(g.icono, "medio") + "</span><div><h3>" + esc(g.nombre) + '</h3><small>' + esc(g.oficio) + " · " + esc(g.base) + "</small></div></div>" +
        '<div class="lema">«' + esc(g.lema) + "»</div><div>" + esc(g.desc) + '</div><div class="etiquetas">' +
        g.habGremio.map(function (hb) { return etq(D.habilidades[hb].nombre, "oro", D.habilidades[hb].desc); }).join("") + "</div>" +
        '<small>Banda inicial: ' + g.bandaInicial.map(function (t) { return esc(g.datacards[t].nombre); }).join(", ") + "</small></div>";
    });
    h += "</div></div>";
    h += '<div class="panel"><h2>2. Prepara la campaña</h2><div class="opciones-inicio">' +
      '<label>Nombre de tu banda<br><input type="text" id="nombreBanda" maxlength="40" placeholder="' + esc(JG.gremio(ini.gremio).nombre) + '" value="' + esc(ini.nombre) + '"></label>' +
      "<div>Duración<br>" + [[4, "Ligera (4 sesiones)"], [8, "Intermedia (8)"], [12, "Larga (12)"]].map(function (d) {
        return '<label class="opcion-radio" style="display:inline-flex;margin-right:6px"><input type="radio" name="duracion" value="' + d[0] + '"' + (ini.sesiones === d[0] ? " checked" : "") + "> " + d[1] + "</label>";
      }).join("") + "</div>" +
      "<div>" + boton(ico("espadas") + " Comenzar campaña", "comenzar", {}, "principal") + "</div></div>" +
      '<p class="tenue">Te enfrentarás a tres gremios rivales controlados por la IA, cada uno con su propia personalidad. La partida se guarda sola en este navegador.</p></div>';
    h += creditos() + "</div>";
    return h;
  }
  function creditos() {
    return '<p class="creditos">Iconos de <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a> (Lorc, Delapouite, DarkZaitzev, Skoll, Zeromancer, Carl Olsen) bajo licencia CC BY 3.0. Basado en el diseño del wargame de escaramuzas.</p>';
  }

  // ---------- Juego ----------
  var FASES = [["encargos", "Encargos"], ["batalla", "Batalla"], ["resolucion", "Resolución"], ["preparacion", "Preparación"]];
  var PESTANAS = [["fase", "Fase actual"], ["banda", "Banda"], ["base", "Base"], ["mercado", "Mercado"], ["clasificacion", "Clasificación"], ["cronicas", "Crónicas"], ["noticias", "Noticias"], ["ayuda", "Cómo se juega"]];

  function vistaJuego() {
    var e = U.e;
    var h = barra();
    h += '<div class="contenedor"><div class="fases">';
    var idx = FASES.map(function (f) { return f[0]; }).indexOf(e.fase);
    FASES.forEach(function (f, i) { h += '<span class="fase ' + (i === idx ? "activa" : i < idx ? "hecha" : "") + '">' + (i + 1) + ". " + f[1] + "</span>"; });
    h += '</div><nav class="pestanas">';
    PESTANAS.forEach(function (p) { h += '<button class="pestana' + (U.tab === p[0] ? " activa" : "") + '" data-acc="tab" data-id="' + p[0] + '">' + p[1] + "</button>"; });
    h += "</nav>";
    var v = { fase: vistaFase, banda: vistaBanda, base: vistaBase, mercado: vistaMercado, clasificacion: vistaClasificacion, cronicas: vistaCronicas, noticias: vistaNoticias, ayuda: vistaAyuda }[U.tab];
    h += v() + creditos() + "</div>";
    return h;
  }

  function barra() {
    var e = U.e, b = C.jugador(e), g = JG.gremio(b.gremio);
    var f = C.fraccionAmenaza(e), proy = C.proyeccionNiebla(e);
    return '<header class="barra"><div class="barra-in">' +
      '<div class="marca"><span style="color:' + g.color + '">' + ico(g.icono, "medio") + '</span><div><div class="nombre">' + esc(b.nombre) + '</div><div class="sub">' +
      esc(g.oficio) + " · Sesión " + e.sesion + " de " + e.sesiones + " · Tier " + C.tierActual(e) + "</div></div></div>" +
      '<div class="recursos">' +
      '<span class="recurso" title="Influencia: oro, contactos y favores. Paga equipo, reclutas, edificios y locaciones.">' + ico("monedas") + " <b>" + b.influencia + "</b> Influencia</span>" +
      '<span class="recurso" title="Experiencia: pozo común de la banda para subir niveles.">' + ico("libro") + " <b>" + b.xp + "</b> Exp.</span>" +
      '<span class="recurso" title="Renombre: gana la campaña quien más tenga al final.">' + ico("laurel") + " <b>" + b.renombre + "</b> Renombre</span></div>" +
      '<div class="niebla-barra" title="' + esc(D.amenaza.desc) + ' La línea discontinua marca adónde llegará la próxima vez que avance."><div class="tit"><span>' + ico("niebla") + " " + esc(D.amenaza.nombre) + "</span><span>" + e.amenaza.valor + " / " + e.amenaza.max +
      (C.sesionCaida(e) ? ' · <b style="color:#f0a597">sin contención cae en la sesión ' + C.sesionCaida(e) + "</b>" : "") + "</span></div>" +
      '<div class="medidor' + (f >= 0.6 ? " alerta" : "") + '"><span style="width:' + Math.min(100, 100 * f) + '%"></span>' +
      '<i class="proy" style="left:' + Math.min(100, 100 * (e.amenaza.valor + D.amenaza.avance(C.tierActual(e))) / e.amenaza.max) + '%"></i></div></div>' +
      "</div></header>";
  }

  function avisoNiebla() {
    var e = U.e;
    var caida = C.sesionCaida(e);
    if (C.nieblaInminente(e)) return '<div class="aviso rojo">' + ico("niebla") + " <b>¡La ciudad caerá al final de esta sesión</b> si nadie contiene la Niebla! Manda a alguien a la Muralla de Faroles, al Templo de la Llama Eterna o a tu Atalaya.</div>";
    if (caida && caida - e.sesion <= 2) return '<div class="aviso niebla">' + ico("niebla") + " Si nadie la contiene, la Niebla llenará su medidor en la <b>sesión " + caida + "</b> y todos perderéis. Los rivales también contienen, pero no siempre lo suficiente.</div>";
    return "";
  }

  // ---------- Pestaña: fase actual ----------
  function vistaFase() {
    var e = U.e;
    if (e.fase === "encargos") return vistaEncargos();
    if (e.fase === "batalla") return vistaBatalla();
    if (e.fase === "resolucion") return vistaResolucion();
    if (e.fase === "preparacion") return vistaPreparacion();
    return "";
  }

  function textoRiesgo(n) {
    if (!n) return "sin riesgo";
    return "falla con " + (n === 1 ? "1" : "1–" + n) + " en 1D6";
  }

  function vistaEncargos() {
    var e = U.e, b = C.jugador(e);
    var turno = C.turnoEncargos(e);
    var miTurno = turno === b.id;
    var h = avisoNiebla();
    var eventos = C.eventosDe(e, e.sesion);
    if (eventos.length) h += eventos.map(function (ev) { return '<div class="aviso oro">' + ico("pergamino") + " <b>" + esc(ev.titulo) + ".</b> " + esc(ev.texto) + "</div>"; }).join("");
    h += '<div class="panel"><div class="fila entre"><div><h2>' + ico("mapa") + " Fase de Encargos</h2>";
    if (miTurno) h += "<p><b>Es tu turno.</b> Elige una locación del mapa y manda a alguien, o pasa si ya no quieres mandar a nadie más.</p>";
    else if (turno) h += "<p>Turno de " + esc(C.banda(e, turno).nombre) + "…</p>";
    else h += "<p>Todos los gremios han terminado de elegir locaciones. Revisa tu base y continúa a la batalla.</p>";
    h += '<p class="tenue">Cada locación del mapa admite a un solo trabajador y cuesta Influencia. Los edificios de tu base hacen lo mismo gratis y sin bloquear a nadie. ' +
      "<b>Rápido</b>: termina antes de la batalla y la miniatura combate, pero arriesga un percance. <b>Lento</b>: termina después y la miniatura no combate.</p></div>" +
      '<div class="fila">' + (miTurno ? boton("Pasar", "pasar", {}, "", false, "No mandar a nadie más al mapa esta sesión") : "") +
      (!turno ? boton(ico("espadas") + " Ir a la batalla", "terminarEncargos", {}, "principal") : "") + "</div></div></div>";

    // Mapa
    h += '<div class="panel"><h3>Mapa de la ciudad</h3><div class="rejilla">';
    var abiertas = C.locacionesAbiertas(e).map(function (l) { return l.id; });
    D.locaciones.forEach(function (l) {
      var abierta = abiertas.indexOf(l.id) >= 0;
      var cerrada = e.cerradas.indexOf(l.id) >= 0;
      var ocup = e.encargos.asignaciones.filter(function (a) { return a.origen === "mapa" && a.destino === l.id; });
      var libre = abierta && C.capacidadLibre(e, l.id);
      var enc = D.encargos[l.encargo];
      h += '<div class="tarjeta' + (!libre ? " ocupada" : "") + '"><div class="cab">' + ico(l.icono, "medio") + "<div><h3>" + esc(l.nombre) + "</h3><small>" + esc(enc.nombre) + "</small></div></div>" +
        "<div>" + esc(enc.desc) + '</div><div class="etiquetas">' + etq(ico("monedas") + " " + l.coste, "oro") +
        etq("Rápido: " + textoRiesgo(l.riesgo[0] + (l.riesgo[0] ? C.riesgoExtra(e) : 0))) + etq("Lento: " + textoRiesgo(l.riesgo[1] + (l.riesgo[1] ? C.riesgoExtra(e) : 0))) +
        (l.soloLento ? etq("Solo lento", "azul") : "") + "</div>";
      if (cerrada) h += '<div class="etq rojo">Devorada por la Niebla</div>';
      else if (!abierta) h += '<small>Se abre ' + (l.evento ? "con un evento de la campaña (tier " + l.tier + ")" : "en el tier " + l.tier) + ".</small>";
      ocup.forEach(function (a) {
        var bb = C.banda(e, a.banda);
        h += '<div><span style="color:' + bb.color + '">■</span> ' + esc(bb.nombre) + ": " + a.pids.map(function (id) { return esc(C.personaje(bb, id).nombre); }).join(" y ") + " (" + MODO[a.modo] + ")</div>";
      });
      if (libre && miTurno) h += boton("Mandar a alguien", "abrirAsignar", { origen: "mapa", destino: l.id }, "", b.influencia < l.coste, b.influencia < l.coste ? "No tienes Influencia suficiente" : "");
      h += "</div>";
    });
    h += "</div></div>";

    // Base
    h += '<div class="panel"><h3>' + ico("castillo") + " Tu base: " + esc(JG.gremio(b.gremio).base) + '</h3><div class="rejilla">';
    Object.keys(b.edificios).forEach(function (id) {
      var ed = D.edificios[id], enc = D.encargos[ed.encargo];
      var a = e.encargos.asignaciones.filter(function (x) { return x.banda === b.id && x.origen === "base" && x.destino === id; })[0];
      h += '<div class="tarjeta"><div class="cab">' + ico(ed.icono, "medio") + "<div><h3>" + esc(ed.nombre) + (b.edificios[id] > 1 ? " (nivel 2)" : "") + "</h3><small>" + esc(enc.nombre) + "</small></div></div><div>" + esc(enc.desc) + "</div>";
      if (a) h += "<div>" + ico("bota") + " " + esc(C.personaje(b, a.pids[0]).nombre) + " (" + MODO[a.modo] + ")" + (a.resuelto ? "" : " " + boton("Quitar", "quitarBase", { destino: id }, "mini")) + "</div>";
      else h += boton("Asignar a alguien", "abrirAsignar", { origen: "base", destino: id });
      h += "</div>";
    });
    h += "</div></div>";
    return h;
  }

  function vistaBatalla() {
    var e = U.e, b = C.jugador(e);
    var par = C.parejaDelJugador(e);
    var rival = C.banda(e, par.bandas[0] === b.id ? par.bandas[1] : par.bandas[0]);
    var gr = JG.gremio(rival.gremio), gj = JG.gremio(b.gremio);
    var esc0 = D.escenarios.filter(function (s) { return s.id === par.escenario; })[0];
    var disp = C.disponiblesBatalla(e, b);
    if (!e.batalla.alineacion) e.batalla.alineacion = disp.map(function (p) { return p.id; });
    var h = avisoNiebla();
    if (e.encargos.informe) {
      var mias = e.encargos.informe.filter(function (l) { return l.banda === b.id; });
      if (mias.length) h += '<div class="panel"><h3>Encargos rápidos</h3>' + mias.map(function (l) { return "<p>" + esc(l.texto) + "</p>"; }).join("") + "</div>";
    }
    h += '<div class="panel"><div class="marcador"><div class="lado"><span style="color:' + gj.color + '">' + ico(gj.icono, "grande") + "</span><h3>" + esc(b.nombre) + "</h3><small>" + b.victorias + "V " + b.empates + "E " + b.derrotas + 'D</small></div><div class="tanteo">vs</div>' +
      '<div class="lado"><span style="color:' + gr.color + '">' + ico(gr.icono, "grande") + "</span><h3>" + esc(rival.nombre) + "</h3><small>" + esc(gr.oficio) + " · " + rival.victorias + "V " + rival.empates + "E " + rival.derrotas + "D</small></div></div>" +
      '<div class="aviso oro"><b>' + esc(esc0.nombre) + ".</b> " + esc(esc0.desc) + "</div>" +
      "<p><b>Proezas de esta batalla</b> (quien las cumpla gana un título y +1 Renombre): " +
      par.proezas.map(function (id) { var p = D.proezas.filter(function (x) { return x.id === id; })[0]; return etq(p.nombre, "oro", p.desc) + " <small>" + esc(p.desc) + "</small>"; }).join(" · ") + "</p></div>";

    h += '<div class="dos"><div class="panel"><h3>Tu alineación</h3>';
    if (!disp.length) h += '<p class="aviso rojo">No tienes a nadie disponible: perderás por incomparecencia.</p>';
    disp.forEach(function (p) {
      var on = e.batalla.alineacion.indexOf(p.id) >= 0;
      h += '<label class="opcion-radio"><input type="checkbox" data-cambio="alinear" data-id="' + p.id + '"' + (on ? " checked" : "") + "> <div><b>" + esc(p.nombre) + "</b> · " + esc(p.tipoNombre) + " (nivel " + p.nivel + ")" +
        (p.lider ? " " + etq("Líder", "oro") : "") + (p.percance ? " " + etq("Percance: −1 Vida", "rojo") : "") + (p.encargo ? " " + etq("Encargo rápido", "azul") : "") +
        '<br><small>' + esc(nombreItem(p.armaCC)) + (p.armaDist ? ", " + esc(nombreItem(p.armaDist)) : "") + (p.escudo ? ", " + esc(nombreItem(p.escudo)) : "") + (p.armadura ? ", " + esc(nombreItem(p.armadura)) : "") +
        " · Vida " + p.vida + "</small></div></label>";
    });
    b.contratados.forEach(function (c) { h += '<div class="opcion-radio">' + ico("monedas") + " <div><b>" + esc(c.nombre) + "</b> · " + esc(c.tipoNombre) + " (contratado para esta batalla)</div></div>"; });
    var noDisp = C.vivos(b).filter(function (p) { return disp.indexOf(p) < 0; });
    if (noDisp.length) h += '<p class="tenue">No combaten: ' + noDisp.map(function (p) { return esc(p.nombre) + (p.herido >= e.sesion ? " (herido)" : " (encargo lento)"); }).join(", ") + ".</p>";
    h += '</div><div class="panel"><h3>Plan de batalla</h3><p class="tenue">Tus miniaturas actúan solas según la postura. Las órdenes se juegan en la fase de órdenes de la ronda que más convenga.</p>';
    [["agresiva", "Agresiva", "Carga a la mínima ocasión y no guarda acciones para defenderse de disparos."],
      ["equilibrada", "Equilibrada", "Carga cuando puede llegar y guarda una acción solo con escudo o mucha Agilidad."],
      ["defensiva", "Defensiva", "Solo carga si tiene ventaja; guarda acciones para defenderse."]].forEach(function (o) {
      h += '<label class="opcion-radio"><input type="radio" name="postura" data-cambio="postura" value="' + o[0] + '"' + (e.batalla.postura === o[0] ? " checked" : "") + "> <div><b>" + o[1] + "</b><br><small>" + o[2] + "</small></div></label>";
    });
    h += "<h4>Órdenes que llevas (máximo 2)</h4>";
    var hay = false;
    Object.keys(b.ordenes).forEach(function (o) {
      for (var i = 0; i < b.ordenes[o]; i++) {
        hay = true;
        var n = e.batalla.ordenes.filter(function (x) { return x === o; }).length;
        var on = i < n;
        h += '<label class="opcion-radio"><input type="checkbox" data-cambio="orden" data-id="' + o + '" data-i="' + i + '"' + (on ? " checked" : "") + "> <div><b>" + esc(D.ordenes[o].nombre) + "</b><br><small>" + esc(D.ordenes[o].desc) + "</small></div></label>";
      }
    });
    if (!hay) h += '<p class="tenue">No tienes órdenes. Se compran en el Mercado durante la Preparación.</p>';
    h += '<p class="tenue">Consumibles (se usan solos): ' + b.inventario.pocion + " pociones, " + b.inventario.antidoto + " antídotos, " + b.inventario.elixir + " elixires.</p>";
    h += boton(ico("espadas") + " ¡A la batalla!", "jugarBatalla", {}, "principal") + "</div></div>";

    h += '<div class="panel"><h3>' + esc(rival.nombre) + " — informe de los espías</h3>" + tablaBanda(rival, C.disponiblesBatalla(e, rival)) + "</div>";
    return h;
  }

  function tablaBanda(b, lista) {
    var h = '<div class="tabla-scroll"><table><tr><th>Miniatura</th><th>Tipo</th><th class="num">Nv</th><th>F/A/M/Me</th><th class="num">Vida</th><th>Equipo</th></tr>';
    lista.forEach(function (p) {
      h += "<tr><td>" + esc(p.nombre) + (p.lider ? " ★" : "") + "</td><td>" + esc(p.tipoNombre) + '</td><td class="num">' + p.nivel + "</td><td>" + [p.fue, p.agi, p.mag, p.men].join("/") +
        '</td><td class="num">' + p.vida + "</td><td><small>" + [p.armaCC, p.armaDist, p.escudo, p.armadura].filter(Boolean).map(nombreItem).map(esc).join(", ") + "</small></td></tr>";
    });
    return h + "</table></div>";
  }

  function vistaResolucion() {
    var e = U.e, b = C.jugador(e);
    var h = "";
    var cr = e.cronicas[e.sesion];
    if (cr) h += htmlCronica(cr, true);
    h += '<div class="panel"><h3>' + ico("pergamino") + " Resolución de la sesión</h3>";
    (e.resolucion[b.id] || []).forEach(function (l) { h += "<p>" + esc(l) + "</p>"; });
    if (e.resolucion.amenaza) h += '<p class="aviso niebla">' + esc(e.resolucion.amenaza) + "</p>";
    h += "<h4>La otra batalla</h4>";
    e.batalla.parejas.filter(function (p) { return p.bandas.indexOf(b.id) < 0; }).forEach(function (p) {
      var r = p.resultado, n0 = C.banda(e, p.bandas[0]).nombre, n1 = C.banda(e, p.bandas[1]).nombre;
      h += "<p>" + esc(n0) + " <b>" + r.puntos[0] + " – " + r.puntos[1] + "</b> " + esc(n1) + " · " + esc(r.escenarioNombre) + (r.ganador >= 0 ? " · gana " + esc(r.ganador === 0 ? n0 : n1) : " · empate") + "</p>";
    });
    h += '<div class="separador"></div>' + boton("Pasar a la preparación", "aPreparacion", {}, "principal") + "</div>";
    return h;
  }

  function vistaPreparacion() {
    var e = U.e, b = C.jugador(e);
    var subibles = C.vivos(b).filter(function (p) { return !C.puedeSubir(e, b, p); });
    var h = avisoNiebla();
    h += '<div class="panel"><h2>' + ico("mochila") + " Fase de Preparación</h2><p>Gasta tu Experiencia e Influencia antes de cerrar la sesión. Todo se hace en las pestañas:</p><ul>" +
      "<li><b>Banda</b>: subir de nivel (" + (subibles.length ? subibles.length + " miniatura(s) pueden subir ahora" : "nadie puede subir ahora") + "), equipar lo del almacén, despedir.</li>" +
      "<li><b>Mercado</b>: comprar equipo, consumibles y órdenes, reclutar o contratar mercenarios.</li>" +
      "<li><b>Base</b>: construir o mejorar edificios.</li></ul>" +
      '<p>Al terminar pagarás el <b>mantenimiento</b>: ' + C.mantenimiento(b) + " de Influencia (1 por miniatura y 1 por edificio)." +
      (b.influencia < C.mantenimiento(b) ? ' <span class="etq rojo">No te llega: perderás 1 de Renombre.</span>' : "") + "</p>";
    var prox = e.sesion < e.sesiones ? C.eventosDe(e, e.sesion + 1) : [];
    if (prox.length) h += '<p class="aviso oro">Próxima sesión: ' + prox.map(function (ev) { return "<b>" + esc(ev.titulo) + "</b>"; }).join(", ") + ".</p>";
    h += boton(e.sesion >= e.sesiones ? "Terminar la campaña" : "Terminar la sesión " + e.sesion, "terminarSesion", {}, "principal") + "</div>";
    h += '<div class="panel"><h3>Clasificación</h3>' + tablaClasificacion() + "</div>";
    return h;
  }

  // ---------- Crónica de batalla ----------
  function htmlCronica(cr, completa) {
    var r = cr.resultado, yo = cr.ladoJugador;
    var cls = r.ganador === yo ? "victoria" : r.ganador === -1 ? "empate" : "derrota";
    var txt = r.ganador === yo ? "Victoria" : r.ganador === -1 ? "Empate" : "Derrota";
    var g0 = JG.gremio(cr.gremios[0]), g1 = JG.gremio(cr.gremios[1]);
    var h = '<div class="panel"><div class="resultado-banner ' + cls + '">' + txt + " · " + esc(r.escenarioNombre) + "</div>" +
      '<div class="marcador"><div class="lado"><span style="color:' + cr.colores[0] + '">' + ico(g0.icono, "grande") + "</span><h3>" + esc(cr.bandas[0]) + '</h3><small>' + r.bajas[0] + ' bajas causadas</small></div><div class="tanteo">' + r.puntos[0] + " – " + r.puntos[1] +
      '</div><div class="lado"><span style="color:' + cr.colores[1] + '">' + ico(g1.icono, "grande") + "</span><h3>" + esc(cr.bandas[1]) + "</h3><small>" + r.bajas[1] + " bajas causadas</small></div></div>";
    // Destacados
    var mvp = r.miniaturas.slice().sort(function (a, b) { return (b.st.bajas * 3 + b.st.danoHecho) - (a.st.bajas * 3 + a.st.danoHecho); })[0];
    if (mvp) h += "<p>" + ico("medalla") + " <b>Mejor guerrero:</b> " + esc(mvp.nombre) + " (" + esc(mvp.tipo) + ", " + esc(cr.bandas[mvp.lado]) + "): " + mvp.st.bajas + " bajas, " + mvp.st.danoHecho + " de daño.</p>";
    if (r.proezas.length) h += "<p>" + ico("trofeo") + " " + r.proezas.map(function (p) { var d = D.proezas.filter(function (x) { return x.id === p.proeza; })[0]; return "<b>" + esc(d.nombre) + "</b>: " + esc(p.nombre); }).join(" · ") + "</p>";
    // Crónica por rondas
    h += "<details" + (completa ? " open" : "") + "><summary>Crónica de la batalla</summary><div class=\"cronica\">";
    var rondaActual = -1;
    r.cronica.forEach(function (c) {
      if (c.tipo === "ronda") { h += '<div class="ronda-cab">' + esc(c.texto) + "</div>"; rondaActual = c.r; return; }
      var color = c.lado === 0 || c.lado === 1 ? cr.colores[c.lado] : "var(--borde)";
      h += '<div class="linea ' + c.tipo + '" style="border-left-color:' + color + '">' + esc(c.texto) + "</div>";
    });
    h += "</div></details>";
    // Estadísticas
    h += "<details><summary>Estadísticas por miniatura</summary><div class=\"tabla-scroll\"><table><tr><th>Miniatura</th><th>Banda</th><th class=\"num\">Daño hecho</th><th class=\"num\">Recibido</th><th class=\"num\">Bajas</th><th class=\"num\">Paradas</th><th class=\"num\">Esquivas</th><th>Estado</th></tr>";
    r.miniaturas.forEach(function (m) {
      h += '<tr class="' + (m.lado === yo ? "tuyo" : "") + '"><td>' + esc(m.nombre) + (m.lider ? " ★" : "") + "<br><small>" + esc(m.tipo) + "</small></td><td>" + esc(cr.bandas[m.lado]) + '</td><td class="num">' + m.st.danoHecho + '</td><td class="num">' + m.st.danoRecibido +
        '</td><td class="num">' + m.st.bajas + '</td><td class="num">' + m.st.paradas + '</td><td class="num">' + m.st.esquivas + "</td><td>" + (m.fuera ? etq("Fuera de combate", "rojo") : etq(m.hp + "/" + m.vidaMax, "verde")) + "</td></tr>";
    });
    h += "</table></div></details></div>";
    return h;
  }

  // ---------- Pestaña: banda ----------
  function tarjetaPersonaje(p) {
    var e = U.e, b = C.jugador(e);
    var prep = enPreparacion();
    var h = '<div class="tarjeta"><span class="franja" style="background:' + b.color + '"></span><div class="fila entre"><div><h3>' + esc(p.nombre) + "</h3><small>" + esc(p.tipoNombre) + " · nivel " + p.nivel + "</small></div><div class=\"etiquetas\">" +
      (p.lider ? etq("Líder", "oro") : "") + (p.bestia ? etq("Bestia") : "") + (p.herido >= e.sesion ? etq(p.herido > e.sesion || e.fase === "encargos" || e.fase === "batalla" ? "Herido: se pierde la próxima batalla" : "Herido", "rojo", "Puedes curarlo antes en el Hospital o la Enfermería (encargo lento).") : "") +
      (p.encargo && (e.fase === "encargos" || e.fase === "batalla") ? etq("Encargo " + MODO[p.encargo.modo], "azul") : "") + (p.percance ? etq("Percance: −1 Vida", "rojo") : "") + "</div></div>";
    h += '<div class="stats">' + [["fue", "FUE"], ["agi", "AGI"], ["mag", "MAG"], ["men", "MEN"], ["vida", "VIDA"], ["acc", "ACC"], ["mov", "MOV"]].map(function (s) {
      return "<div><b>" + p[s[0]] + (s[0] === "mov" ? '"' : "") + "</b><span>" + s[1] + "</span></div>";
    }).join("") + "</div>";
    h += '<div class="equipo">';
    [["armaCC", "Cuerpo a c.", "espadas"], ["armaDist", "Distancia", "arco"], ["escudo", "Escudo", "escudo"], ["armadura", "Armadura", "yelmo"]].forEach(function (r) {
      var id = p[r[0]];
      h += '<div class="ranura" title="' + esc(tituloItem(id)) + '"><span class="lbl">' + r[1] + "</span>" + (id ? ico(D.equipo[id].icono) + " " + esc(D.equipo[id].nombre) + ' <small class="tenue">' + esc(descItem(id)) + "</small>" : '<span class="tenue">—</span>') +
        (prep && id && r[0] !== "armaCC" && !p.bestia ? " " + boton("Quitar", "desequipar", { pid: p.id, ranura: r[0] }, "mini") : "") + "</div>";
    });
    h += '</div><div class="etiquetas">' + p.hab.map(function (hb) { var d = D.habilidades[hb]; return d ? etq(d.nombre, "", d.desc) : ""; }).join("") +
      p.titulos.map(function (t) { return etq("★ " + t, "oro"); }).join("") + p.cicatrices.map(function (c) { return etq("Cicatriz: " + c.texto, "rojo"); }).join("") + "</div>";
    h += "<small class=\"tenue\">" + p.batallas + " batallas · " + p.bajas + " bajas</small>";
    if (prep) {
      var err = C.puedeSubir(e, b, p);
      h += '<div class="fila">' + boton(ico("medalla") + " Subir de nivel (" + C.costeSubir(p) + " Exp.)", "abrirSubir", { pid: p.id }, err ? "" : "principal", !!err, err || "") +
        (!p.lider ? boton("Despedir", "despedir", { pid: p.id }, "peligro mini") : "") + "</div>";
    }
    return h + "</div>";
  }

  function vistaBanda() {
    var e = U.e, b = C.jugador(e), prep = enPreparacion();
    var h = "";
    if (!prep) h += '<div class="aviso">Subir niveles, equipar y despedir solo se puede hacer en la fase de Preparación.</div>';
    h += '<div class="panel"><div class="fila entre"><h2>' + esc(b.nombre) + "</h2><div class=\"etiquetas\">" + etq(C.vivos(b).length + " / " + D.bandaMax + " miniaturas") +
      etq("Tope de brecha: " + D.brecha + " niveles sobre la más baja") + etq(b.xp + " Experiencia", "oro") + "</div></div>" +
      '<div class="rejilla ancha">' + C.vivos(b).map(tarjetaPersonaje).join("") + "</div></div>";
    // Almacén
    h += '<div class="panel"><h3>' + ico("cofre") + " Almacén</h3>";
    if (!b.almacen.length) h += '<p class="tenue">Vacío. Lo que compres, forjes o ganes en batalla aparecerá aquí.</p>';
    else {
      h += '<div class="tabla-scroll"><table><tr><th>Objeto</th><th>Características</th><th></th></tr>';
      b.almacen.forEach(function (id, i) {
        var ops = C.vivos(b).filter(function (p) { return !C.puedeEquipar(p, id); }).map(function (p) { return '<option value="' + p.id + '">' + esc(p.nombre) + "</option>"; }).join("");
        h += "<tr><td>" + ico(D.equipo[id].icono) + " " + esc(D.equipo[id].nombre) + " " + etq("Tier " + D.equipo[id].tier) + "</td><td><small>" + esc(descItem(id)) + "</small></td><td>" +
          (prep ? (ops ? '<select id="equipar_' + i + '">' + ops + "</select> " + boton("Equipar", "equipar", { i: i }, "mini") + " " : "") + boton("Vender (" + C.precioVenta(id) + ")", "vender", { i: i }, "mini") : "") + "</td></tr>";
      });
      h += "</table></div>";
    }
    h += '<p>Consumibles: ' + ico("corazon") + " " + b.inventario.pocion + " pociones · " + ico("veneno") + " " + b.inventario.antidoto + " antídotos · " + ico("caldero") + " " + b.inventario.elixir + " elixires</p>";
    var ords = Object.keys(b.ordenes).filter(function (o) { return b.ordenes[o] > 0; });
    h += "<p>Órdenes: " + (ords.length ? ords.map(function (o) { return esc(D.ordenes[o].nombre) + " ×" + b.ordenes[o]; }).join(", ") : '<span class="tenue">ninguna</span>') + "</p></div>";
    if (b.caidos.length) h += '<div class="panel"><h3>' + ico("calavera") + " Caídos</h3>" + b.caidos.map(function (c) { return "<p>" + esc(c.nombre) + " — " + esc(c.tipo) + ", nivel " + c.nivel + ", cayó en la sesión " + c.sesion + ".</p>"; }).join("") + "</div>";
    return h;
  }

  // ---------- Pestaña: base ----------
  function vistaBase() {
    var e = U.e, b = C.jugador(e), prep = enPreparacion();
    var h = '<div class="panel"><h2>' + ico("castillo") + " " + esc(JG.gremio(b.gremio).base) + "</h2><p class=\"tenue\">Cada edificio permite hacer gratis su encargo, sin bloquear el mapa. Nivel 2 (desde el tier 2): rinde un 50% más. Cada edificio cuesta 1 de mantenimiento por sesión.</p>" +
      (prep ? "" : '<div class="aviso">Construir solo se puede en la fase de Preparación.</div>') + '<div class="rejilla">';
    Object.keys(D.edificios).forEach(function (id) {
      var ed = D.edificios[id], nivel = b.edificios[id] || 0, coste = C.costeEdificio(b, id);
      var puede = prep && nivel < 2 && (nivel === 0 || C.tierActual(e) >= 2) && b.influencia >= coste;
      var motivo = nivel >= 2 ? "Nivel máximo" : nivel === 1 && C.tierActual(e) < 2 ? "Mejorar requiere el tier 2" : b.influencia < coste ? "Falta Influencia" : !prep ? "Solo en Preparación" : "";
      h += '<div class="tarjeta' + (nivel ? "" : " ocupada") + '"><div class="cab">' + ico(ed.icono, "medio") + "<div><h3>" + esc(ed.nombre) + "</h3><small>" + (nivel ? "Nivel " + nivel : "Sin construir") + "</small></div></div><div>" + esc(ed.desc) + " " +
        esc(D.encargos[ed.encargo].desc) + "</div>" + (nivel < 2 ? boton((nivel ? "Mejorar" : "Construir") + " (" + coste + ")", "construir", { id: id }, puede ? "principal" : "", !puede, motivo) : "") + "</div>";
    });
    return h + "</div></div>";
  }

  // ---------- Pestaña: mercado ----------
  function vistaMercado() {
    var e = U.e, b = C.jugador(e), prep = enPreparacion();
    var t = C.tienda(e);
    var cats = [["cc", "Cuerpo a cuerpo"], ["dist", "Distancia"], ["escudo", "Escudos"], ["armadura", "Armaduras"], ["consumible", "Consumibles"], ["ordenes", "Órdenes"], ["reclutas", "Reclutas"], ["contratados", "Mercenarios"]];
    var h = (prep ? "" : '<div class="aviso">Comprar solo se puede en la fase de Preparación.</div>') +
      '<div class="panel"><div class="fila entre"><h2>' + ico("tienda") + ' Mercado</h2><span class="etq oro">' + b.influencia + " Influencia</span></div>" +
      '<p class="tenue">Equipo de tier ' + Math.min(2, C.tierActual(e)) + " o inferior. El equipo de tier 3 solo se consigue en mazmorras y batallas.</p><nav class=\"pestanas\">" +
      cats.map(function (c) { return '<button class="pestana' + (U.filtro === c[0] ? " activa" : "") + '" data-acc="filtro" data-id="' + c[0] + '">' + c[1] + "</button>"; }).join("") + "</nav>";
    if (["cc", "dist", "escudo", "armadura", "consumible"].indexOf(U.filtro) >= 0) {
      h += '<div class="tabla-scroll"><table><tr><th>Objeto</th><th>Características</th><th class="num">Precio</th><th></th></tr>';
      t.filter(function (id) { return D.equipo[id].cat === U.filtro; }).sort(function (x, y) { return D.equipo[x].coste - D.equipo[y].coste; }).forEach(function (id) {
        var it = D.equipo[id];
        h += '<tr title="' + esc(tituloItem(id)) + '"><td>' + ico(it.icono) + " " + esc(it.nombre) + " " + etq("Tier " + it.tier) + "</td><td><small>" + esc(descItem(id)) + '</small></td><td class="num">' + it.coste + "</td><td>" +
          boton("Comprar", "comprar", { id: id }, "mini", !prep || b.influencia < it.coste) + "</td></tr>";
      });
      h += "</table></div>";
    } else if (U.filtro === "ordenes") {
      h += '<div class="rejilla">' + Object.keys(D.ordenes).map(function (id) {
        var o = D.ordenes[id];
        return '<div class="tarjeta"><div class="cab">' + ico(o.icono, "medio") + "<h3>" + esc(o.nombre) + "</h3></div><div>" + esc(o.desc) + '</div><small class="tenue">Tienes ' + (b.ordenes[id] || 0) + ". Se gasta al usarla.</small>" +
          boton("Comprar (" + o.coste + ")", "comprarOrden", { id: id }, "", !prep || b.influencia < o.coste) + "</div>";
      }).join("") + "</div>";
    } else if (U.filtro === "reclutas") {
      var g = JG.gremio(b.gremio);
      h += '<p class="tenue">Los reclutas entran al nivel de tu miniatura más baja (nivel ' + C.nivelMinimo(b) + "). Cada nivel por encima del 1 cuesta 5 de Influencia más.</p><div class=\"rejilla\">";
      Object.keys(g.datacards).filter(function (tp) { return !g.datacards[tp].lider; }).forEach(function (tp) {
        var d = g.datacards[tp], c = C.costeReclutar(e, b, tp);
        h += '<div class="tarjeta"><h3>' + esc(d.nombre) + "</h3><small>F" + d.fue + " A" + d.agi + " M" + d.mag + " Me" + d.men + " · Vida " + d.vida + " · " + d.acc + " acciones · Mov " + d.mov + '"</small><small>' +
          d.equipo.map(nombreItem).map(esc).join(", ") + '</small><div class="etiquetas">' + d.hab.map(function (hb) { return etq(D.habilidades[hb].nombre, "", D.habilidades[hb].desc); }).join("") + "</div>" +
          boton("Reclutar (" + c + ")", "reclutar", { tipo: tp }, "", !prep || b.influencia < c || C.vivos(b).length >= D.bandaMax) + "</div>";
      });
      h += "</div>";
    } else {
      h += '<p class="tenue">Mercenarios para la próxima batalla (como mucho 2). Se van después.' + (b.gremio === "mercenarios" ? " Tu gremio los contrata a mitad de precio." : "") + "</p><div class=\"rejilla\">";
      D.contratados.forEach(function (c) {
        var coste = C.costeContratado(b, c);
        h += '<div class="tarjeta"><h3>' + esc(c.nombre) + "</h3><small>F" + c.fue + " A" + c.agi + " · Vida " + c.vida + " · " + c.equipo.map(nombreItem).map(esc).join(", ") + "</small>" +
          boton("Contratar (" + coste + ")", "contratar", { id: c.id }, "", !prep || b.influencia < coste || b.contratados.length >= 2) + "</div>";
      });
      h += "</div>";
      if (b.contratados.length) h += "<p>Contratados: " + b.contratados.map(function (c) { return esc(c.nombre) + " (" + esc(c.tipoNombre) + ")"; }).join(", ") + "</p>";
    }
    return h + "</div>";
  }

  // ---------- Clasificación, crónicas, noticias, ayuda ----------
  function tablaClasificacion() {
    var e = U.e;
    var h = '<div class="tabla-scroll"><table><tr><th>#</th><th>Gremio</th><th class="num">Renombre</th><th class="num">V-E-D</th><th class="num">Miniaturas</th><th class="num">Nivel medio</th><th class="num">Niebla contenida</th><th>Carácter</th></tr>';
    C.clasificacion(e).forEach(function (b, i) {
      var g = JG.gremio(b.gremio), v = C.vivos(b);
      h += '<tr class="' + (b.jugador ? "tuyo" : "") + '"><td>' + (i + 1) + '</td><td><span style="color:' + b.color + '">' + ico(g.icono) + "</span> " + esc(b.nombre) + (b.jugador ? " (tú)" : "") + '</td><td class="num"><b>' + b.renombre + '</b></td><td class="num">' +
        b.victorias + "-" + b.empates + "-" + b.derrotas + '</td><td class="num">' + v.length + '</td><td class="num">' + (v.length ? (JG.suma(v, function (p) { return p.nivel; }) / v.length).toFixed(1) : "—") + '</td><td class="num">' + b.contencion +
        "</td><td>" + (b.personalidad ? esc(b.personalidad.nombre) : "—") + "</td></tr>";
    });
    return h + "</table></div>";
  }
  function vistaClasificacion() {
    var e = U.e;
    var h = '<div class="panel"><h2>' + ico("podio") + " Clasificación</h2>" + tablaClasificacion() +
      '<p class="tenue">Al final gana quien tenga más Renombre: victorias (3; empate 1), proezas (1), mazmorras y contener la Niebla (1 por encargo). Quien más Niebla haya contenido recibe +3 al final.</p></div>';
    h += '<div class="panel"><h3>Resultados por sesión</h3>';
    if (!e.historial.length) h += '<p class="tenue">Aún no se ha jugado ninguna batalla.</p>';
    e.historial.slice().reverse().forEach(function (hs) {
      h += "<p><b>Sesión " + hs.sesion + ":</b> " + hs.batallas.map(function (bt) {
        var n0 = C.banda(e, bt.bandas[0]).nombre, n1 = C.banda(e, bt.bandas[1]).nombre;
        return esc(n0) + " " + bt.puntos[0] + "–" + bt.puntos[1] + " " + esc(n1);
      }).join(" · ") + "</p>";
    });
    return h + "</div>";
  }
  function vistaCronicas() {
    var e = U.e;
    var ses = Object.keys(e.cronicas).map(Number).sort(function (a, b) { return b - a; });
    if (!ses.length) return '<div class="panel"><p class="tenue">Aún no has jugado ninguna batalla.</p></div>';
    var sel = U.cronica && e.cronicas[U.cronica] ? U.cronica : ses[0];
    var h = '<div class="panel"><div class="fila">' + ses.map(function (s) { return boton("Sesión " + s, "verCronica", { s: s }, s === sel ? "principal mini" : "mini"); }).join("") + "</div></div>";
    return h + htmlCronica(e.cronicas[sel], true);
  }
  function vistaNoticias() {
    var e = U.e;
    var h = '<div class="panel"><h2>' + ico("pergamino") + " Noticias</h2>";
    var ult = null;
    e.noticias.forEach(function (n) {
      if (n.sesion !== ult) { h += '<div class="ronda-cab">Sesión ' + n.sesion + "</div>"; ult = n.sesion; }
      h += '<div class="linea ' + (n.tipo === "amenaza" ? "mant" : n.tipo === "evento" ? "proeza" : "") + '">' + esc(n.texto) + "</div>";
    });
    return h + "</div>";
  }
  function vistaAyuda() {
    return '<div class="panel"><h2>Cómo se juega</h2>' +
      "<p>Diriges un gremio durante una campaña de 4, 8 o 12 sesiones. Las batallas se juegan solas con las reglas del wargame; tú decides todo lo demás.</p>" +
      "<h3>Cada sesión tiene cuatro fases</h3><ol>" +
      "<li><b>Encargos.</b> Por turnos (empieza quien tiene menos Renombre), cada gremio manda a una miniatura a una locación del mapa, que queda bloqueada para los demás. Tus edificios hacen lo mismo gratis. Rápido = la miniatura combate pero arriesga un percance; lento = no combate.</li>" +
      "<li><b>Batalla.</b> Elige alineación, postura y órdenes. El escenario decide cuántas rondas hay y cómo se puntúa.</li>" +
      "<li><b>Resolución.</b> Recompensas, heridas de quienes cayeron, proezas, encargos lentos y avance de la Niebla.</li>" +
      "<li><b>Preparación.</b> Gasta Experiencia (subir niveles) e Influencia (equipo, reclutas, edificios, órdenes). Pagas el mantenimiento.</li></ol>" +
      "<h3>Monedas</h3><p><b>Experiencia</b>: pozo común de la banda; subir de nivel cuesta más cada vez y ninguna miniatura puede pasar 2 niveles por encima de la más baja. <b>Influencia</b>: todo lo demás. <b>Renombre</b>: decide quién gana.</p>" +
      "<h3>La Niebla Hambrienta</h3><p>Avanza cada sesión. Si llena su medidor, la ciudad cae y <b>todos</b> perdéis. Contenerla (Muralla de Faroles o Atalaya) cuesta una miniatura, pero da Renombre. La línea discontinua del medidor muestra adónde llegará si nadie hace nada. Con más del 50%, los encargos son más peligrosos; con más del 75%, devora una locación por sesión.</p>" +
      "<h3>Batallas</h3><ul><li>3D6 por acción; cada dado se compara por separado con el umbral 6. El 1 siempre falla, el 6 siempre acierta y da un dado extra.</li>" +
      "<li>Cuerpo a cuerpo: siempre combaten los dos; empieza quien inicia el combate. Cada dado se usa para golpear, parar o esquivar, y se puede parar o esquivar al momento en que el rival golpea.</li>" +
      "<li>Disparo: el objetivo puede gastar una acción para defenderse; después cuenta la cobertura (5+ anula cada éxito).</li>" +
      "<li>Ayudas: un aliado trabado con el enemigo permite repetir un dado; dos, repetir y tirar uno extra.</li>" +
      "<li>Quien queda fuera de combate tira en la tabla de heridas: puede morir, quedarse una cicatriz o perderse la próxima batalla.</li></ul>" +
      "<h3>Consejos</h3><ul><li>Las armas de Agilidad van con personajes ágiles; las de Fuerza, con los fuertes.</li><li>Una Enfermería salva vidas: +1 en la tabla de heridas.</li><li>Las mazmorras dan el mejor equipo, pero mandan a dos miniaturas fuera de la batalla.</li><li>Vigila la proyección de la Niebla: los rivales no siempre la contendrán por ti.</li></ul></div>";
  }

  // ---------- Pantalla final ----------
  function vistaFinal() {
    var e = U.e, b = C.jugador(e);
    var cl = C.clasificacion(e);
    var h = '<div class="contenedor"><div class="final-banner">' + ico(e.derrota ? "niebla" : "laurel", "grande");
    if (e.derrota) h += '<div class="grande">La Niebla devoró la ciudad</div><p>Mientras los gremios peleaban entre sí, la Niebla Hambrienta llenó las calles. Nadie gana esta campaña.</p>';
    else if (cl[0].jugador) h += '<div class="grande">¡' + esc(b.nombre) + ' domina la ciudad!</div><p>Tu gremio termina la campaña con más Renombre que nadie.</p>';
    else h += '<div class="grande">' + esc(cl[0].nombre) + " gana la campaña</div><p>Tu gremio termina en la posición " + (cl.indexOf(b) + 1) + " de 4.</p>";
    h += '</div><div class="panel"><h3>Clasificación final</h3>' + tablaClasificacion() + "</div>" +
      '<div class="panel"><h3>Tu banda</h3><p>' + b.victorias + " victorias, " + b.empates + " empates y " + b.derrotas + " derrotas. Niebla contenida: " + b.contencion + ". Caídos: " + b.caidos.length + ".</p>" +
      tablaBanda(b, C.vivos(b)) + '</div><div class="panel fila">' + boton("Nueva campaña", "nuevaCampana", {}, "principal") + " " + boton("Ver noticias", "verNoticiasFinal") + "</div>" +
      (U.verNoticias ? vistaNoticias() : "") + creditos() + "</div>";
    return h;
  }

  // ---------- Diálogos ----------
  function vistaDialogo() {
    var d = U.dialogo, e = U.e, b = e ? C.jugador(e) : null;
    var h = '<div class="velo" data-acc="cerrarFondo"><div class="dialogo" role="dialog" aria-modal="true">';
    if (d.tipo === "asignar") {
      var esMapa = d.origen === "mapa";
      var loc = esMapa ? D.locaciones.filter(function (l) { return l.id === d.destino; })[0] : null;
      var ed = esMapa ? null : D.edificios[d.destino];
      var encargo = esMapa ? loc.encargo : ed.encargo;
      var enc = D.encargos[encargo];
      var cand = C.vivos(b).filter(function (p) { return C.disponibleEncargo(e, b, p, encargo) && (encargo !== "curar" ? !(p.herido >= e.sesion) : (p.herido || p.cicatrices.length)); });
      var soloLento = (loc && loc.soloLento) || encargo === "curar";
      h += "<h2>" + esc(esMapa ? loc.nombre : ed.nombre) + "</h2><p>" + esc(enc.desc) + "</p>";
      if (!cand.length) h += '<p class="aviso rojo">No tienes a nadie disponible para este encargo.</p>';
      else {
        var ops = cand.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nombre) + " — " + esc(p.tipoNombre) + " (Nv " + p.nivel + ", F" + p.fue + " A" + p.agi + " M" + p.mag + " Me" + p.men + ")</option>"; }).join("");
        h += '<label>Miniatura<br><select id="asig1">' + ops + "</select></label>";
        if (encargo === "mazmorra") h += '<br><label>Segunda miniatura (opcional; sola tiene −3)<br><select id="asig2"><option value="">— nadie —</option>' + ops + "</select></label>";
        h += "<h4>Modo</h4>" +
          '<label class="opcion-radio"><input type="radio" name="modo" value="rapido"' + (soloLento ? " disabled" : " checked") + "> <div><b>Rápido</b>: termina antes de la batalla; la miniatura combate. Riesgo: " + (loc ? textoRiesgo(loc.riesgo[0] + (loc.riesgo[0] ? C.riesgoExtra(e) : 0)) : "sin riesgo") + " (percance: −1 Vida en la batalla).</div></label>" +
          '<label class="opcion-radio"><input type="radio" name="modo" value="lento"' + (soloLento ? " checked" : "") + "> <div><b>Lento</b>: termina después de la batalla; la miniatura no combate. Riesgo: " + (loc ? textoRiesgo(loc.riesgo[1] + (loc.riesgo[1] ? C.riesgoExtra(e) : 0)) : "sin riesgo") + " (herida: se pierde la próxima batalla).</div></label>";
        if (esMapa && loc.coste) h += "<p>Coste: <b>" + loc.coste + "</b> Influencia. Mandar a alguien gasta tu turno.</p>";
      }
      h += '<div class="acciones">' + boton("Cancelar", "cerrar") + (cand.length ? boton("Confirmar", "confirmarAsignar", {}, "principal") : "") + "</div>";
    } else if (d.tipo === "subir") {
      var p = C.personaje(b, d.pid);
      h += "<h2>" + esc(p.nombre) + " sube al nivel " + (p.nivel + 1) + "</h2><p>Coste: " + C.costeSubir(p) + " de Experiencia. Elige una mejora:</p>";
      C.opcionesMejora(e, p).forEach(function (o, i) {
        h += '<label class="opcion-radio"><input type="radio" name="mejora" value="' + esc(o.id) + '"' + (i === 0 ? " checked" : "") + "> <div>" + esc(o.texto) + "</div></label>";
      });
      h += '<div class="acciones">' + boton("Cancelar", "cerrar") + boton("Subir de nivel", "confirmarSubir", {}, "principal") + "</div>";
    } else if (d.tipo === "confirmar") {
      h += "<h2>" + esc(d.titulo) + "</h2><p>" + esc(d.texto) + '</p><div class="acciones">' + boton("Cancelar", "cerrar") + boton(esc(d.boton || "Confirmar"), d.acc, d.datos || {}, d.peligro ? "peligro" : "principal") + "</div>";
    }
    return h + "</div></div>";
  }

  // ---------- Acciones ----------
  function tras() {
    var e = U.e;
    if (e && e.fase === "encargos") C.avanzarIAEncargos(e);
    guardar();
    U.render();
  }
  var A = {
    tab: function (d) { U.tab = d.id; U.render(); window.scrollTo(0, 0); },
    filtro: function (d) { U.filtro = d.id; U.render(); },
    elegirGremio: function (d) { leerInicio(); U.inicio.gremio = d.id; U.render(); },
    comenzar: function () {
      leerInicio();
      var g = JG.gremio(U.inicio.gremio);
      U.e = C.nueva({ gremio: g.id, sesiones: U.inicio.sesiones, nombre: U.inicio.nombre.trim() || g.nombre });
      U.tab = "fase";
      tras();
      aviso("¡Comienza la campaña! Empieza mandando a tu gente a los encargos.");
    },
    continuar: function () { U.e = C.cargar(); U.tab = "fase"; tras(); },
    borrar: function () { U.dialogo = { tipo: "confirmar", titulo: "Borrar la partida", texto: "Se perderá la campaña guardada. ¿Seguro?", acc: "borrarSi", peligro: true, boton: "Borrar" }; U.render(); },
    borrarSi: function () { C.borrar(); U.dialogo = null; U.render(); },
    nuevaCampana: function () { C.borrar(); U.e = null; U.verNoticias = false; U.render(); window.scrollTo(0, 0); },
    verNoticiasFinal: function () { U.verNoticias = !U.verNoticias; U.render(); },
    cerrar: function () { U.dialogo = null; U.render(); },
    cerrarFondo: function (d, el, ev) { if (ev.target === el) A.cerrar(); },
    abrirAsignar: function (d) { U.dialogo = { tipo: "asignar", origen: d.origen, destino: d.destino }; U.render(); },
    confirmarAsignar: function () {
      var d = U.dialogo, e = U.e, b = C.jugador(e);
      var p1 = document.getElementById("asig1").value;
      var s2 = document.getElementById("asig2");
      var pids = [p1];
      if (s2 && s2.value && s2.value !== p1) pids.push(s2.value);
      var modo = (document.querySelector('input[name="modo"]:checked') || {}).value || "rapido";
      var err = C.asignar(e, b, d.origen, d.destino, pids, modo);
      if (err) return aviso(err, true);
      U.dialogo = null;
      tras();
    },
    quitarBase: function (d) { hecho(C.quitarAsignacionBase(U.e, C.jugador(U.e), d.destino)); U.render(); },
    pasar: function () { var err = C.pasar(U.e, C.jugador(U.e)); if (err) return aviso(err, true); tras(); },
    terminarEncargos: function () { C.terminarEncargos(U.e); tras(); window.scrollTo(0, 0); },
    jugarBatalla: function () {
      var e = U.e;
      if (e.batalla.alineacion && !e.batalla.alineacion.length && C.disponiblesBatalla(e, C.jugador(e)).length) return aviso("Elige al menos una miniatura para la batalla.", true);
      C.jugarBatallas(e);
      tras(); window.scrollTo(0, 0);
    },
    aPreparacion: function () { C.aPreparacion(U.e); tras(); window.scrollTo(0, 0); },
    terminarSesion: function () {
      var e = U.e, b = C.jugador(e);
      var sub = C.vivos(b).some(function (p) { return !C.puedeSubir(e, b, p); });
      if (sub && !U.dialogo) {
        U.dialogo = { tipo: "confirmar", titulo: "¿Terminar la sesión?", texto: "Todavía puedes subir de nivel a alguna miniatura con tu Experiencia. La Experiencia no se pierde, pero las mejoras llegan antes si la gastas ahora.", acc: "terminarSesionSi", boton: "Terminar igualmente" };
        return U.render();
      }
      A.terminarSesionSi();
    },
    terminarSesionSi: function () { U.dialogo = null; C.terminarSesion(U.e); U.tab = "fase"; tras(); window.scrollTo(0, 0); },
    abrirSubir: function (d) { U.dialogo = { tipo: "subir", pid: d.pid }; U.render(); },
    confirmarSubir: function () {
      var op = (document.querySelector('input[name="mejora"]:checked') || {}).value;
      var p = C.personaje(C.jugador(U.e), U.dialogo.pid);
      var err = C.subirNivel(U.e, C.jugador(U.e), U.dialogo.pid, op);
      if (err) return aviso(err, true);
      U.dialogo = null; guardar(); aviso(p.nombre + " sube al nivel " + p.nivel + "."); U.render();
    },
    despedir: function (d) {
      var p = C.personaje(C.jugador(U.e), d.pid);
      U.dialogo = { tipo: "confirmar", titulo: "Despedir a " + p.nombre, texto: "Quien se va puede vengarse (robar Influencia o romper pociones). Su equipo se queda en el almacén.", acc: "despedirSi", datos: { pid: d.pid }, peligro: true, boton: "Despedir" };
      U.render();
    },
    despedirSi: function (d) { U.dialogo = null; var r = C.despedir(U.e, C.jugador(U.e), d.pid); guardar(); aviso(r); U.render(); },
    desequipar: function (d) { hecho(C.desequipar(U.e, C.jugador(U.e), d.pid, d.ranura)); U.render(); },
    equipar: function (d) {
      var sel = document.getElementById("equipar_" + d.i);
      hecho(C.equipar(U.e, C.jugador(U.e), sel.value, Number(d.i)), "Equipado.");
      U.render();
    },
    vender: function (d) { hecho(C.vender(U.e, C.jugador(U.e), Number(d.i)), "Vendido."); U.render(); },
    comprar: function (d) { hecho(C.comprar(U.e, C.jugador(U.e), d.id), D.equipo[d.id].nombre + (D.equipo[d.id].cat === "consumible" ? " comprado." : " comprado: está en el almacén (pestaña Banda).")); U.render(); },
    comprarOrden: function (d) { hecho(C.comprarOrden(U.e, C.jugador(U.e), d.id), "Orden comprada."); U.render(); },
    reclutar: function (d) { hecho(C.reclutar(U.e, C.jugador(U.e), d.tipo), "¡Nuevo recluta en la banda!"); U.render(); },
    contratar: function (d) { hecho(C.contratar(U.e, C.jugador(U.e), d.id), "Mercenario contratado para la próxima batalla."); U.render(); },
    construir: function (d) { hecho(C.construir(U.e, C.jugador(U.e), d.id), D.edificios[d.id].nombre + " listo."); U.render(); },
    verCronica: function (d) { U.cronica = Number(d.s); U.render(); }
  };
  U._acciones = A; // para las pruebas
  function leerInicio() {
    var n = document.getElementById("nombreBanda");
    if (n) U.inicio.nombre = n.value;
    var r = document.querySelector('input[name="duracion"]:checked');
    if (r) U.inicio.sesiones = Number(r.value);
  }

  // Cambios en casillas de batalla
  function cambio(el) {
    var e = U.e;
    if (!e || !e.batalla) return;
    if (el.dataset.cambio === "alinear") {
      var l = e.batalla.alineacion, id = el.dataset.id;
      if (el.checked && l.indexOf(id) < 0) l.push(id);
      if (!el.checked) e.batalla.alineacion = l.filter(function (x) { return x !== id; });
    } else if (el.dataset.cambio === "postura") e.batalla.postura = el.value;
    else if (el.dataset.cambio === "orden") {
      var marcadas = Array.prototype.slice.call(document.querySelectorAll('input[data-cambio="orden"]:checked'));
      if (marcadas.length > 2) { el.checked = false; return aviso("Como mucho, 2 órdenes por batalla.", true); }
      e.batalla.ordenes = marcadas.map(function (x) { return x.dataset.id; });
    }
    guardar();
  }

  // ---------- Arranque ----------
  function arrancar() {
    document.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-acc]");
      if (!el || el.disabled) return;
      var f = A[el.dataset.acc];
      if (!f) return;
      if (el.dataset.acc === "cerrarFondo" && ev.target !== el) return;
      try { f(el.dataset, el, ev); } catch (err) { console.error(err); aviso("Error: " + err.message, true); }
    });
    document.addEventListener("change", function (ev) {
      if (ev.target.dataset && ev.target.dataset.cambio) cambio(ev.target);
      if (ev.target.name === "duracion") U.inicio.sesiones = Number(ev.target.value);
    });
    document.addEventListener("input", function (ev) { if (ev.target.id === "nombreBanda") U.inicio.nombre = ev.target.value; });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && U.dialogo) A.cerrar(); });
    window.addEventListener("error", function (ev) { aviso("Error: " + ev.message, true); });
    U.render();
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
    else arrancar();
  }
})();
