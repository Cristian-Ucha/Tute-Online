// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// MODELO
// ==============================

const ASIENTOS = [0, 1, 2, 3];
const PAREJAS_POR_ASIENTO = { 0: 0, 2: 0, 1: 1, 3: 1 };

const PUNTOS_CARTA = {
    as: 11,
    tres: 10,
    rey: 4,
    caballo: 3,
    sota: 2
};

// ==============================
// ESTADO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

let triunfo = null;
let cartaTriunfo = null;
let asientoQueDa = null;

let bazasJugadas = 0;
let manoTerminada = false;
let puntosPareja = [0, 0];

let esperandoIA = false;
let esperandoSalidaInicial = false; // 🔴 CLAVE

// ==============================
// DATOS TUTE
// ==============================

const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
];

const ORDEN_VALORES = [
    "dos", "cuatro", "cinco", "seis", "siete",
    "sota", "caballo", "rey", "tres", "as"
];

const VALORES = [
    { nombre: "as", columna: 0 },
    { nombre: "dos", columna: 1 },
    { nombre: "tres", columna: 2 },
    { nombre: "cuatro", columna: 3 },
    { nombre: "cinco", columna: 4 },
    { nombre: "seis", columna: 5 },
    { nombre: "siete", columna: 6 },
    { nombre: "sota", columna: 9 },
    { nombre: "caballo", columna: 10 },
    { nombre: "rey", columna: 11 }
];

// ==============================
// BARAJA
// ==============================

function crearBaraja() {
    const baraja = [];
    PALOS.forEach(p =>
        VALORES.forEach(v =>
            baraja.push({
                palo: p.nombre,
                valor: v.nombre,
                fila: p.fila,
                columna: v.columna
            })
        )
    );
    return baraja;
}

// ==============================
// REPARTO
// ==============================

function repartir() {
    jugadores = ASIENTOS.map(a => ({ asiento: a, mano: [] }));
    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (asientoQueDa === null) {
        asientoQueDa = Math.floor(Math.random() * 4);
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    const mano = jugadores[asientoQueDa].mano;
    cartaTriunfo = mano[Math.floor(Math.random() * mano.length)];
    triunfo = cartaTriunfo.palo;

    // 🔴 sale el siguiente al que da
    turnoActual = (asientoQueDa + 1) % 4;

    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;
    puntosPareja = [0, 0];

    esperandoIA = false;
    esperandoSalidaInicial = true; // 🔴 clave

    document.getElementById("fin-mano").style.display = "none";
    render();
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(jugador) {
    if (bazaActual.length === 0) return jugador.mano;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = jugador.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length) return delPalo;

    const triunfos = jugador.mano.filter(c => c.palo === triunfo);
    if (triunfos.length) return triunfos;

    return jugador.mano;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, indice) {
    if (manoTerminada) return;

    const jugador = jugadores[asiento];
    const carta = jugador.mano.splice(indice, 1)[0];

    bazaActual.push({ asiento, carta });
    esperandoIA = false;

    // 🔴 ya ha salido alguien
    esperandoSalidaInicial = false;

    if (bazaActual.length === 4) {
        setTimeout(resolverBaza, 1200);
    } else {
        turnoActual = (turnoActual + 1) % 4;
    }

    render();
}

// ==============================
// IA
// ==============================

function jugarAutomatico() {
    if (manoTerminada) return;
    if (turnoActual === 0) return;
    if (esperandoIA) return;
    if (bazaActual.length === 4) return;

    // 🔴 espera visual al inicio de la mano
    if (esperandoSalidaInicial) {
        esperandoIA = true;
        setTimeout(() => {
            esperandoIA = false;
            jugarAutomatico();
        }, 600);
        return;
    }

    esperandoIA = true;

    setTimeout(() => {
        const jugador = jugadores[turnoActual];
        const legales = cartasLegales(jugador);
        const carta = legales[0];
        const indice = jugador.mano.indexOf(carta);
        jugarCarta(turnoActual, indice);
    }, 600);
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(j => {
        const c = j.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) {
            ganadora = j;
        } else if (
            c.palo === g.palo &&
            ORDEN_VALORES.indexOf(c.valor) > ORDEN_VALORES.indexOf(g.valor)
        ) {
            ganadora = j;
        }
    });

    const pareja = PAREJAS_POR_ASIENTO[ganadora.asiento];
    bazaActual.forEach(j =>
        puntosPareja[pareja] += PUNTOS_CARTA[j.carta.valor] || 0
    );

    turnoActual = ganadora.asiento;
    bazaActual = [];
    bazasJugadas++;

    if (bazasJugadas === 10) {
        manoTerminada = true;
    }

    esperandoSalidaInicial = true; // 🔴 nueva baza
    render();
}

// ==============================
// RENDER
// ==============================

function render() {
    renderMesaJugador();
    renderRivales();
    renderBaza();
    renderTriunfo();

    document.getElementById("turno").textContent =
        "Turno del asiento " + turnoActual;

    if (manoTerminada) {
        const f = document.getElementById("fin-mano");
        f.style.display = "block";
        f.innerHTML = `
            <strong>Fin de la mano</strong><br><br>
            Pareja 0 (0 y 2): ${puntosPareja[0]} puntos<br>
            Pareja 1 (1 y 3): ${puntosPareja[1]} puntos
        `;
    } else {
        jugarAutomatico();
    }
}

// ==============================
// RENDER MANO HUMANA
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((carta, i) => {
        const div = crearCartaDiv(carta);
        div.classList.add("carta");
        div.style.zIndex = i;

        const esLegal = legales.includes(carta);
        div.style.opacity = esLegal ? "1" : "0.4";

        if (esLegal && turnoActual === 0 && !manoTerminada) {
            div.onclick = () => jugarCarta(0, i);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RENDER RIVALES
// ==============================

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const cont = document.getElementById("rival-" + id);
        cont.innerHTML = "";
        jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
    });
}

// ==============================
// RENDER BAZA
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";
    bazaActual.forEach(j => baza.appendChild(crearCartaDiv(j.carta)));
}

// ==============================
// RENDER TRIUNFO
// ==============================

function renderTriunfo() {
    const cont = document.getElementById("triunfo");
    cont.innerHTML = "Triunfo<br>";
    cont.appendChild(crearCartaDiv(cartaTriunfo));
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(carta) {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition =
        `-${carta.columna * ANCHO_CARTA}px -${carta.fila * ALTO_CARTA}px`;
    return div;
}

function crearDorsoDiv() {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return div;
}

// ==============================
// BOTÓN
// ==============================

document.getElementById("btnRepartir").onclick = repartir;
