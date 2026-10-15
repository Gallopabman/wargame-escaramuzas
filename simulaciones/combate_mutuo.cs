// Simulación del combate mutuo (reglas 5.3) con juego óptimo (minimax).
// Cada jugador maximiza (daño hecho - daño recibido) del intercambio.
// Supuestos (ver pendientes.md): Golpear = dado + Modificador + Hit;
// cada 6 natural da 1 dado extra que no vuelve a explotar; asignar es
// obligatorio (se puede descartar un dado, pero no guardarlo).
using System;
using System.Collections.Generic;

public class Perfil {
    public string nombre;
    public int golpe, parada, esquiva, dano, dureza, durabilidad, velocidad;
    public Perfil(string n, int g, int p, int e, int da, int du, int dur, int vel) {
        nombre = n; golpe = g; parada = p; esquiva = e; dano = da;
        dureza = du; durabilidad = dur; velocidad = vel;
    }
}

public class CombateMutuo {
    Perfil[] pl = new Perfil[2];
    bool gasolina;
    Dictionary<long, double> memo = new Dictionary<long, double>();
    Random rng = new Random(12345);

    // Estado: dados por cara de cada jugador, turno, durabilidad, golpe pendiente.
    class Estado {
        public int[,] c = new int[2, 7];
        public int turno, pend;
        public int[] d = new int[2];
        public Estado Copia() {
            Estado e = new Estado();
            Array.Copy(c, e.c, c.Length);
            e.turno = turno; e.pend = pend; e.d[0] = d[0]; e.d[1] = d[1];
            return e;
        }
        public int Total(int p) { int s = 0; for (int f = 1; f <= 6; f++) s += c[p, f]; return s; }
        public long Clave() {
            long k = 0;
            for (int p = 0; p < 2; p++) for (int f = 1; f <= 6; f++) k = k * 8 + c[p, f];
            return ((k * 2 + turno) * 8 + d[0]) * 8 * 16 + d[1] * 16 + pend;
        }
    }

    class Mov { public Estado sig; public double premio; public int actor; public string tipo; }

    public CombateMutuo(Perfil a, Perfil b, bool gas) { pl[0] = a; pl[1] = b; gasolina = gas; }

    static bool Exito(int dado, int mod, int umbral) {
        if (dado == 1) return false;
        if (dado == 6) return true;
        return dado + mod >= umbral;
    }

    List<Mov> Hijos(Estado s) {
        List<Mov> r = new List<Mov>();
        int yo = s.turno, op = 1 - yo;
        if (s.pend > 0) {
            // Nodo de respuesta: 'yo' es el defensor de un golpe de valor s.pend.
            for (int w = 1; w <= 6; w++) {
                if (s.c[yo, w] == 0) continue;
                if (!(w != 1 && (w == 6 || w + pl[yo].esquiva >= s.pend))) continue;
                Estado e = s.Copia(); e.c[yo, w]--; e.pend = 0;
                if (gasolina) {
                    for (int f = 1; f <= 6; f++) {
                        if (e.c[yo, f] == 0) continue;
                        Estado e2 = e.Copia(); e2.c[yo, f]--;
                        r.Add(new Mov { sig = e2, premio = 0, actor = yo, tipo = "esquiva" });
                    }
                } else r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = "esquiva" });
            }
            Estado t = s.Copia(); t.pend = 0;
            int dm = pl[op].dano;
            if (t.d[yo] > 0) { dm = Math.Max(0, dm - pl[yo].dureza); t.d[yo]--; }
            r.Add(new Mov { sig = t, premio = (yo == 1 ? dm : -dm), actor = yo, tipo = "encaja" });
            return r;
        }
        if (s.Total(yo) == 0) {
            if (s.Total(op) == 0) return r;
            Estado e = s.Copia(); e.turno = op;
            r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = "pasa" });
            return r;
        }
        for (int v = 1; v <= 6; v++) {
            if (s.c[yo, v] == 0) continue;
            if (Exito(v, pl[yo].golpe, 6)) {
                Estado e = s.Copia(); e.c[yo, v]--; e.turno = op; e.pend = v + pl[yo].golpe;
                r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = "golpe" });
            }
            if (Exito(v, pl[yo].parada, 6)) {
                for (int u = 1; u <= 6; u++) {
                    if (s.c[op, u] == 0 || (u == 6 && v != 6)) continue;
                    Estado e = s.Copia(); e.c[yo, v]--; e.c[op, u]--; e.turno = op;
                    r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = "parada" });
                }
            }
            Estado x = s.Copia(); x.c[yo, v]--; x.turno = op;
            r.Add(new Mov { sig = x, premio = 0, actor = yo, tipo = "descarte" });
        }
        return r;
    }

    double V(Estado s) {
        long k = s.Clave(); double res;
        if (memo.TryGetValue(k, out res)) return res;
        List<Mov> h = Hijos(s);
        if (h.Count == 0) { memo[k] = 0; return 0; }
        bool max = h[0].actor == 0;
        double best = max ? double.NegativeInfinity : double.PositiveInfinity;
        foreach (Mov m in h) {
            double x = m.premio + V(m.sig);
            if (max ? x > best : x < best) best = x;
        }
        memo[k] = best; return best;
    }

    // Sigue la línea óptima y cuenta qué opciones se usan.
    void Jugar(Estado s, Dictionary<string, int>[] uso, double[] dano) {
        while (true) {
            List<Mov> h = Hijos(s);
            if (h.Count == 0) return;
            bool max = h[0].actor == 0;
            Mov mejor = null; double best = max ? double.NegativeInfinity : double.PositiveInfinity;
            foreach (Mov m in h) {
                double x = m.premio + V(m.sig);
                if (max ? x > best + 1e-9 : x < best - 1e-9) { best = x; mejor = m; }
            }
            if (mejor.tipo != "pasa") {
                int n; uso[mejor.actor].TryGetValue(mejor.tipo, out n);
                uso[mejor.actor][mejor.tipo] = n + 1;
            }
            if (mejor.premio > 0) dano[1] += mejor.premio;
            if (mejor.premio < 0) dano[0] -= mejor.premio;
            s = mejor.sig;
        }
    }

    int[] Tirada() {
        int[] c = new int[7]; int n = 3;
        for (int i = 0; i < n; i++) { int v = rng.Next(1, 7); c[v]++; if (v == 6 && i < 3) n++; }
        return c;
    }

    // pl[0] = atacante (jugador activo), pl[1] = defensor que reacciona.
    public string Ejecutar(int pruebas, bool carga) {
        int inicia = carga ? 0 : (pl[1].velocidad > pl[0].velocidad ? 1 : 0);
        Dictionary<string, int>[] uso = { new Dictionary<string, int>(), new Dictionary<string, int>() };
        double[] dano = new double[2];
        double sinReaccion = 0;
        for (int t = 0; t < pruebas; t++) {
            Estado s = new Estado();
            int[] a = Tirada(), b = Tirada();
            for (int f = 1; f <= 6; f++) { s.c[0, f] = a[f]; s.c[1, f] = b[f]; }
            s.turno = inicia; s.d[0] = pl[0].durabilidad; s.d[1] = pl[1].durabilidad;
            Jugar(s, uso, dano);
            // Referencia: el defensor no reacciona y el atacante tira para golpear.
            int dur = pl[1].durabilidad;
            for (int f = 1; f <= 6; f++)
                for (int i = 0; i < a[f]; i++)
                    if (Exito(f, pl[0].golpe, 6)) {
                        int dm = pl[0].dano;
                        if (dur > 0) { dm = Math.Max(0, dm - pl[1].dureza); dur--; }
                        sinReaccion += dm;
                    }
        }
        Func<int, string> fmt = delegate (int p) {
            int tot = 0; foreach (int v in uso[p].Values) tot += v;
            string o = "";
            foreach (string k in new string[] { "golpe", "parada", "esquiva", "encaja", "descarte" }) {
                int n; uso[p].TryGetValue(k, out n);
                o += string.Format("{0} {1,3:0}%  ", k, 100.0 * n / Math.Max(1, tot));
            }
            return o;
        };
        return string.Format(
            "{0} ataca a {1}{2}{3}\n" +
            "  Sin reacción: {1} recibe {4:0.00}\n" +
            "  Combate mutuo: {1} recibe {5:0.00} | {0} recibe {6:0.00} | empieza {7}\n" +
            "  Uso {0}: {8}\n  Uso {1}: {9}\n",
            pl[0].nombre, pl[1].nombre, carga ? " (carga)" : "", gasolina ? " [esquiva con gasolina]" : "",
            sinReaccion / pruebas, dano[1] / pruebas, dano[0] / pruebas, pl[inicia].nombre,
            fmt(0), fmt(1));
    }
}
