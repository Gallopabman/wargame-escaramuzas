// Utilidades: azar reproducible, dados y nombres.
var JG = globalThis.JG = globalThis.JG || {};

(function () {
  // Generador mulberry32: con la misma semilla, la misma partida.
  function Azar(semilla) {
    this.estado = (semilla >>> 0) || 1;
  }
  Azar.prototype.siguiente = function () {
    var t = (this.estado += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Azar.prototype.entero = function (min, max) {
    return min + Math.floor(this.siguiente() * (max - min + 1));
  };
  Azar.prototype.d6 = function () { return this.entero(1, 6); };
  // 1D3 con un D6: 1-2 = 1, 3-4 = 2, 5-6 = 3.
  Azar.prototype.d3 = function () { return Math.ceil(this.d6() / 2); };
  Azar.prototype.dados = function (n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push(this.d6());
    return r;
  };
  Azar.prototype.elegir = function (lista) {
    return lista[Math.floor(this.siguiente() * lista.length)];
  };
  Azar.prototype.barajar = function (lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(this.siguiente() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  Azar.prototype.probabilidad = function (p) { return this.siguiente() < p; };

  JG.Azar = Azar;
  // Azar global de la partida; la campaña lo sustituye por uno con semilla.
  JG.azar = new Azar(Date.now());

  JG.limitar = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  JG.suma = function (lista, f) {
    var s = 0;
    for (var i = 0; i < lista.length; i++) s += f ? f(lista[i]) : lista[i];
    return s;
  };
  JG.copia = function (o) { return JSON.parse(JSON.stringify(o)); };
  JG.idUnico = (function () {
    var n = 0;
    return function (prefijo) { n++; return (prefijo || "id") + "_" + Date.now().toString(36) + "_" + n; };
  })();

  // Nombres de fantasía en castellano.
  var NOMBRES = ["Aldric", "Beltrán", "Casandra", "Darío", "Elvira", "Fausto", "Gilda", "Hernán", "Inés",
    "Jimena", "Lope", "Mencía", "Nuño", "Olalla", "Pelayo", "Quiteria", "Rodrigo", "Sancha", "Tello",
    "Urraca", "Vela", "Ximena", "Zoe", "Bermudo", "Leonor", "Garcí", "Estefanía", "Fruela", "Ermesinda",
    "Ordoño", "Teresa", "Munio", "Aldonza", "Gonzalo", "Brianda", "Diego", "Mafalda", "Íñigo", "Toda",
    "Velasco", "Oria", "Ramiro", "Godina", "Sisebuto", "Egilona", "Adosinda", "Silo", "Froila"];
  var APODOS = ["el Tuerto", "la Sombra", "Mano de Hierro", "el Pálido", "la Viuda", "Sietevidas",
    "el Mudo", "la Zorra", "Rompehuesos", "el Callado", "la Grulla", "Medianoche", "el Cojo",
    "Ojo de Cuervo", "la Ceniza", "el Breve", "Cuchilla", "el Devoto", "la Roja", "Piedraseca",
    "el Hambriento", "la Brasa", "Tresdedos", "el Manso", "Lengua de Plata", "el Rezagado"];
  JG.nombreAleatorio = function (azar) {
    azar = azar || JG.azar;
    return azar.elegir(NOMBRES) + " " + azar.elegir(APODOS);
  };
  JG.nombreBestia = function (azar, tipo) {
    azar = azar || JG.azar;
    var n = ["Colmillo", "Garra", "Niebla", "Ceniza", "Trueno", "Sombra", "Brasa", "Escarcha", "Musgo", "Hollín"];
    return tipo + " " + azar.elegir(n);
  };
})();
