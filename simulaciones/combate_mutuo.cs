// Simulación del combate mutuo (reglas 5.3) con juego óptimo (minimax). v2
// Cada jugador maximiza: daño hecho - daño recibido + BONO_MUERTE si mata
// (y lo resta si muere). Si una miniatura llega a 0 de vida, el combate acaba.
// Supuestos (ver pendientes.md):
//  - Golpear = dado + Atributo + Precisión.
//  - Cada 6 natural da 1 dado extra que no vuelve a explotar.
//  - Asignar es obligatorio (se puede descartar un dado, pero no guardarlo).
//  - Parar y Esquivar se usan en tu turno contra un dado del rival aún no
//    usado, y ambos dados se van. Parar: dado + Parada >= 6 (un 6 rival solo
//    se para con un 6). Esquivar: dado + Agilidad + Esquiva de armadura >=
//    dado rival + su golpe.
//  - Un golpe declarado impacta directamente.
//  - Un 6 natural siempre tiene éxito, también al esquivar.
//  - Un impacto que la armadura reduce a 0 también gasta Durabilidad.
using System;
using System.Collections.Generic;

public class Perfil {
    public string nombre;
    public int golpe, parada, esquiva, dano, reduccion, durabilidad, velocidad, vida;
    public Perfil(string n, int g, int p, int e, int da, int red, int dur, int vel, int vida) {
        nombre = n; golpe = g; parada = p; esquiva = e; dano = da;
        reduccion = red; durabilidad = dur; velocidad = vel; this.vida = Math.Min(vida, 15);
    }
    // Copia con otra armadura (Reducción, Durabilidad, Esquiva) y/o vida.
    public Perfil Con(string n, int red, int dur, int esqArmadura, int vida) {
        return new Perfil(n, golpe, parada, esquiva + esqArmadura, dano, red, dur, velocidad, vida);
    }
}

public class Resultado {
    public double danoSinReaccion, muereSinReaccion;
    public double[] dano = new double[2], muere = new double[2];
    public double[,] uso = new double[2, 4]; // golpe, parada, esquiva, descarte
}

public class CombateMutuo {
    const double BONO_MUERTE = 10;
    Perfil[] pl = new Perfil[2];
    bool gasolina;
    // Variante a probar: al declarar un golpe, el defensor puede gastar al
    // momento un dado para pararlo o esquivarlo, sin perder su turno.
    public bool reactiva;
    Dictionary<long, double> memo = new Dictionary<long, double>();
    Random rng = new Random(12345);

    class Estado {
        public int[,] c = new int[2, 7];
        public int turno, pend;
        public int[] d = new int[2], hp = new int[2];
        public Estado Copia() {
            Estado e = new Estado();
            Array.Copy(c, e.c, c.Length);
            e.turno = turno; e.pend = pend;
            e.d[0] = d[0]; e.d[1] = d[1]; e.hp[0] = hp[0]; e.hp[1] = hp[1];
            return e;
        }
        public int Total(int p) { int s = 0; for (int f = 1; f <= 6; f++) s += c[p, f]; return s; }
        public long Clave() {
            long k = 0;
            for (int p = 0; p < 2; p++) for (int f = 1; f <= 6; f++) k = k * 8 + c[p, f];
            k = k * 2 + turno; k = k * 8 + d[0]; k = k * 8 + d[1];
            k = k * 16 + pend; k = k * 16 + hp[0]; k = k * 16 + hp[1];
            return k;
        }
    }

    class Mov { public Estado sig; public double premio; public int actor; public int tipo; }
    const int GOLPE = 0, PARADA = 1, ESQUIVA = 2, DESCARTE = 3, ENCAJA = 4, PASA = 5;

    public CombateMutuo(Perfil a, Perfil b, bool gas) { pl[0] = a; pl[1] = b; gasolina = gas; }

    public static bool Exito(int dado, int mod, int umbral) {
        if (dado == 1) return false;
        if (dado == 6) return true;
        return dado + mod >= umbral;
    }

    List<Mov> Hijos(Estado s) {
        List<Mov> r = new List<Mov>();
        if (s.hp[0] == 0 || s.hp[1] == 0) return r;
        int yo = s.turno, op = 1 - yo;
        if (s.pend > 0) {
            // Defensa reactiva: 'yo' recibe un golpe hecho con un dado de valor
            // s.pend por 'op' y puede pararlo o esquivarlo con un dado.
            int v = s.pend;
            for (int w = 1; w <= 6; w++) {
                if (s.c[yo, w] == 0) continue;
                bool para = Exito(w, pl[yo].parada, 6) && (v != 6 || w == 6);
                bool esquiva = w != 1 && (w == 6 || w + pl[yo].esquiva >= v + pl[op].golpe);
                if (!para && !esquiva) continue;
                Estado e = s.Copia(); e.c[yo, w]--; e.pend = 0;
                r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = para ? PARADA : ESQUIVA });
            }
            Estado t = s.Copia(); t.pend = 0;
            int dm = pl[op].dano;
            if (t.d[yo] > 0) { dm = Math.Max(0, dm - pl[yo].reduccion); t.d[yo]--; }
            int real = Math.Min(dm, t.hp[yo]);
            t.hp[yo] -= real;
            double u = real + (t.hp[yo] == 0 ? BONO_MUERTE : 0);
            r.Add(new Mov { sig = t, premio = (yo == 1 ? u : -u), actor = yo, tipo = ENCAJA });
            return r;
        }
        if (s.Total(yo) == 0) {
            if (s.Total(op) == 0) return r;
            Estado e = s.Copia(); e.turno = op;
            r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = PASA });
            return r;
        }
        for (int v = 1; v <= 6; v++) {
            if (s.c[yo, v] == 0) continue;
            if (Exito(v, pl[yo].golpe, 6) && reactiva && s.Total(op) > 0) {
                Estado e = s.Copia(); e.c[yo, v]--; e.turno = op; e.pend = v;
                r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = GOLPE });
            } else if (Exito(v, pl[yo].golpe, 6)) {
                Estado t = s.Copia(); t.c[yo, v]--; t.turno = op;
                int dm = pl[yo].dano;
                if (t.d[op] > 0) { dm = Math.Max(0, dm - pl[op].reduccion); t.d[op]--; }
                int real = Math.Min(dm, t.hp[op]);
                t.hp[op] -= real;
                double u = real + (t.hp[op] == 0 ? BONO_MUERTE : 0);
                r.Add(new Mov { sig = t, premio = (op == 1 ? u : -u), actor = yo, tipo = GOLPE });
            }
            for (int u = 1; u <= 6; u++) {
                if (s.c[op, u] == 0) continue;
                if (!(v != 1 && (v == 6 || v + pl[yo].esquiva >= u + pl[op].golpe))) continue;
                Estado e = s.Copia(); e.c[yo, v]--; e.c[op, u]--; e.turno = op;
                if (gasolina) {
                    for (int f = 1; f <= 6; f++) {
                        if (e.c[yo, f] == 0) continue;
                        Estado e2 = e.Copia(); e2.c[yo, f]--;
                        r.Add(new Mov { sig = e2, premio = 0, actor = yo, tipo = ESQUIVA });
                    }
                } else r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = ESQUIVA });
            }
            if (Exito(v, pl[yo].parada, 6)) {
                for (int u = 1; u <= 6; u++) {
                    if (s.c[op, u] == 0 || (u == 6 && v != 6)) continue;
                    Estado e = s.Copia(); e.c[yo, v]--; e.c[op, u]--; e.turno = op;
                    r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = PARADA });
                }
            }
            Estado x = s.Copia(); x.c[yo, v]--; x.turno = op;
            r.Add(new Mov { sig = x, premio = 0, actor = yo, tipo = DESCARTE });
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

    // Sigue la línea óptima, cuenta qué opciones se usan y devuelve el estado final.
    Estado Jugar(Estado s, Resultado r) {
        while (true) {
            List<Mov> h = Hijos(s);
            if (h.Count == 0) return s;
            bool max = h[0].actor == 0;
            Mov mejor = null; double best = max ? double.NegativeInfinity : double.PositiveInfinity;
            foreach (Mov m in h) {
                double x = m.premio + V(m.sig);
                if (max ? x > best + 1e-9 : x < best - 1e-9) { best = x; mejor = m; }
            }
            if (mejor.tipo <= DESCARTE) r.uso[mejor.actor, mejor.tipo]++;
            s = mejor.sig;
        }
    }

    int[] Tirada(int n) {
        int[] c = new int[7]; int total = n;
        for (int i = 0; i < total; i++) {
            int v = rng.Next(1, 7); c[v]++;
            if (v == 6 && i < n) total++;
        }
        return c;
    }

    // Combate a muerte: intercambios seguidos conservando vida y Durabilidad.
    // Los intercambios pares los empieza pl[0] y los impares pl[1] (cada uno
    // ataca en su activación y el otro reacciona). Cada intercambio se juega de
    // forma óptima, pero sin planificar los siguientes.
    // Devuelve: [gana pl0, gana pl1, nadie muere, media de intercambios].
    public double[] Duelo(int pruebas, int maxIntercambios) {
        double[] r = new double[4];
        Resultado basura = new Resultado();
        for (int t = 0; t < pruebas; t++) {
            int[] hp = { pl[0].vida, pl[1].vida }, d = { pl[0].durabilidad, pl[1].durabilidad };
            int k = 0;
            while (k < maxIntercambios && hp[0] > 0 && hp[1] > 0) {
                Estado s = new Estado();
                int[] a = Tirada(3), b = Tirada(3);
                for (int f = 1; f <= 6; f++) { s.c[0, f] = a[f]; s.c[1, f] = b[f]; }
                s.turno = k % 2;
                for (int p = 0; p < 2; p++) { s.d[p] = d[p]; s.hp[p] = hp[p]; }
                Estado fin = Jugar(s, basura);
                for (int p = 0; p < 2; p++) { d[p] = fin.d[p]; hp[p] = fin.hp[p]; }
                k++;
            }
            if (hp[1] == 0) r[0]++; else if (hp[0] == 0) r[1]++; else r[2]++;
            r[3] += k;
        }
        for (int i = 0; i < 4; i++) r[i] /= pruebas;
        return r;
    }

    // pl[0] = atacante (jugador activo), pl[1] = defensor que reacciona.
    // inicia: -1 = por Velocidad (empate: atacante); 0 = atacante; 1 = defensor.
    public Resultado Ejecutar(int pruebas, int inicia, int dadosAtacante) {
        if (inicia < 0) inicia = pl[1].velocidad > pl[0].velocidad ? 1 : 0;
        Resultado r = new Resultado();
        for (int t = 0; t < pruebas; t++) {
            Estado s = new Estado();
            int[] a = Tirada(dadosAtacante), b = Tirada(3);
            for (int f = 1; f <= 6; f++) { s.c[0, f] = a[f]; s.c[1, f] = b[f]; }
            s.turno = inicia;
            for (int p = 0; p < 2; p++) { s.d[p] = pl[p].durabilidad; s.hp[p] = pl[p].vida; }
            Estado fin = Jugar(s, r);
            for (int p = 0; p < 2; p++) {
                r.dano[p] += pl[p].vida - fin.hp[p];
                if (fin.hp[p] == 0) r.muere[p]++;
            }
            // Referencia: el defensor no reacciona y el atacante tira para golpear.
            int dur = pl[1].durabilidad, total = 0;
            for (int f = 1; f <= 6; f++)
                for (int i = 0; i < a[f]; i++)
                    if (Exito(f, pl[0].golpe, 6)) {
                        int dm = pl[0].dano;
                        if (dur > 0) { dm = Math.Max(0, dm - pl[1].reduccion); dur--; }
                        total += dm;
                    }
            r.danoSinReaccion += Math.Min(total, pl[1].vida);
            if (total >= pl[1].vida) r.muereSinReaccion++;
        }
        r.danoSinReaccion /= pruebas; r.muereSinReaccion /= pruebas;
        for (int p = 0; p < 2; p++) {
            r.dano[p] /= pruebas; r.muere[p] /= pruebas;
            double tot = 0; for (int k = 0; k < 4; k++) tot += r.uso[p, k];
            for (int k = 0; k < 4; k++) r.uso[p, k] /= Math.Max(1, tot);
        }
        return r;
    }
}
