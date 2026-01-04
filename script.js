alert("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// MODELO DE MESA (NUEVO)
// ==============================

// Asientos fijos en la mesa: 0,1,2,3
// El motor SIEMPRE trabaja con asientos, no con personas reales
const ASIENTOS = [0, 1, 2, 3];

// Parejas por asiento (regla fija del Tute)
const PAREJAS_POR_ASIENTO = {
    0: 0, // asiento 0 → pareja 0
    2: 0, // asiento 2 → pareja 0
    1: 1, // asiento 1 → pareja 1
    3: 1  // asiento 3 → pareja 1
};

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let esperandoAutomatico = false;

let triunfo = null;
let cartaTriunfo = null;

let asientoQueDa = null; // antes jugadorQueDa

let bazasJugadas = 0;
let manoTerminada = false;

// ==============================
// DATOS DEL TUTE
// ==============================

const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
];

const ORDEN_VALORES = [
    "dos",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "sota",
    "caballo",
    "rey",
    "tres",
    "as"
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
    PALOS.forEach(palo => {
        VALORES.forEach(valor => {
            baraja.push({
                palo: palo.nombre,
                valor: valor.nombre,
                fila: palo.fila,
                columna: valor.columna
            });
        });
    });
    return baraja;
}

// ==============================
// REPARTO + TRIUNFO
// ==============================

function repartir() {
    document.body.style.backgroundColor = "#0b5c3b";
    document.body.style.margin = "0";

    jugadores = ASIENTOS.map(asiento => ({
        asiento,
        mano: [],
        bazas: []
    }));

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    // Elegir asiento que da SOLO la primera mano
    if (asientoQueDa === null) {
        asientoQueDa = Math.floor(Math.random() * 4);
    }

    // Reparto
    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    // Triunfo: carta real de la mano del que da
    const manoDelQueDa = jugadores[asientoQueDa].mano;
    cartaTriunfo = manoDelQueDa[Math.floor(Math.random() * manoDelQueDa.length)];
    triunfo = cartaTriunfo.palo;

    // Sale el siguiente asiento
    turnoActual = (asientoQueDa + 1) % 4;

    bazaActual = [];
    esperandoAutomatico = false;
    bazasJugadas = 0;
    manoTerminada = false;

    render();
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(jugador) {
    if (bazaActual.length === 0) return jugador.mano;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = jugador.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length > 0) return delPalo;

    const triunfos = jugador.mano.filter(c => c.palo === triunfo);
    if (triunfos.length > 0) return triunfos;

    return jugador.mano;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, indiceReal) {
    if (manoTerminada) return;

    const jugador = jugadores[asiento];
    const carta = jugador.mano.splice(indiceReal, 1)[0];

    bazaActual.push({ asiento, carta });

    if (bazaActual.length === 4) {
        render();
        setTimeout(resolverBaza, 1200);
        return;
    }

    turnoActual = (turnoActual + 1) % 4;
    esperandoAutomatico = false;
    render();
}

// ==============================
// JUGADOR AUTOMÁTICO
// ==============================

function jugarAutomatico() {
    if (manoTerminada) return;
    if (turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    if (!jugador || jugador.mano.length === 0) return;

    const legales = cartasLegales(jugador);
    const cartaElegida = legales[0];
    const indiceReal = jugador.mano.indexOf(cartaElegida);

    jugarCarta(turnoActual, indiceReal);
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(jugada => {
        const c = jugada.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) {
            ganadora = jugada;
            return;
        }

        if (c.palo === g.palo) {
            const v1 = ORDEN_VALORES.indexOf(c.valor);
            const v2 = ORDEN_VALORES.indexOf(g.valor);
            if (v1 > v2) ganadora = jugada;
        }
    });

    jugadores[ganadora.asiento].bazas.push([...bazaActual]);
    bazasJugadas++;

    turnoActual = ganadora.asiento;
    bazaActual = [];
    esperandoAutomatico = false;

    if (bazasJugadas === 10) {
        manoTerminada = true;
    }

    render();
}

// ==============================
// RENDER GENERAL
// ==============================

function render() {
    renderMesaJugador();
    renderRivales();
    renderBaza();
    renderTurno();
    renderTriunfo();
    renderFinDeMano();

    if (
        !manoTerminada &&
        turnoActual !== 0 &&
        bazaActual.length < 4 &&
        !esperandoAutomatico
    ) {
        esperandoAutomatico = true;
        setTimeout(jugarAutomatico, 600);
    }
}

// ==============================
// RENDER JUGADOR HUMANO (ASIENTO 0)
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);
        const esLegal = legales.includes(carta);

        div.style.opacity = esLegal ? "1" : "0.4";
        div.style.marginLeft = index === 0 ? "0px" : "-120px";
        div.style.zIndex = index;
        div.style.transition = "transform 0.15s ease";

        if (esLegal && !manoTerminada) {
            div.onmouseenter = () => {
                div.style.transform = "translateY(-40px)";
                div.style.zIndex = 1000;
            };
            div.onmouseleave = () => {
                div.style.transform = "translateY(0)";
                div.style.zIndex = index;
            };
            div.onclick = () => {
                if (turnoActual !== 0) return;
                jugarCarta(0, index);
            };
        }

        mesa.appendChild(div);
    });
}

// ==============================
// TRIUNFO
// ==============================

function renderTriunfo() {
    let cont = document.getElementById("triunfo");
    if (!cont) {
        cont = document.createElement("div");
        cont.id = "triunfo";
        cont.style.textAlign = "center";
        cont.style.marginTop = "10px";
        document.body.appendChild(cont);
    }

    cont.innerHTML = "";
    cont.style.color = "white";
    cont.textContent = "Triunfo";

    if (cartaTriunfo) {
        const carta = crearCartaDiv(cartaTriunfo);
        carta.style.margin = "10px auto";
        cont.appendChild(carta);
    }
}

// ==============================
// FIN DE MANO
// ==============================

function renderFinDeMano() {
    let div = document.getElementById("fin-mano");
    if (!div) {
        div = document.createElement("div");
        div.id = "fin-mano";
        div.style.color = "white";
        div.style.textAlign = "center";
        div.style.fontSize = "20px";
        div.style.marginTop = "10px";
        document.body.appendChild(div);
    }
    div.textContent = manoTerminada ? "Fin de la mano" : "";
}

// ==============================
// RIVALES (ASIENTOS 1,2,3)
// ==============================

function renderRivales() {
    renderRival(1, "arriba");
    renderRival(2, "izquierda");
    renderRival(3, "derecha");
}

function renderRival(asiento, posicion) {
    let cont = document.getElementById("rival-" + asiento);
    if (!cont) {
        cont = document.createElement("div");
        cont.id = "rival-" + asiento;
        cont.style.position = "absolute";
        document.body.appendChild(cont);
    }

    if (posicion === "arriba") {
        cont.style.top = "20px";
        cont.style.left = "50%";
        cont.style.transform = "translateX(-50%)";
        cont.style.display = "flex";
    }
    if (posicion === "izquierda") {
        cont.style.left = "20px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }
    if (posicion === "derecha") {
        cont.style.right = "20px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    cont.innerHTML = "";
    jugadores[asiento].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
}

// ==============================
// BAZA
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";

    baza.style.display = "flex";
    baza.style.justifyContent = "center";
    baza.style.marginTop = "20px";

    bazaActual.forEach(jugada => {
        const div = crearCartaDiv(jugada.carta);
        div.style.margin = "0 10px";
        baza.appendChild(div);
    });
}

// ==============================
// TURNO
// ==============================

function renderTurno() {
    let info = document.getElementById("turno");
    if (!info) {
        info = document.createElement("div");
        info.id = "turno";
        info.style.color = "white";
        info.style.textAlign = "center";
        document.body.appendChild(info);
    }
    info.textContent = "Turno del asiento " + turnoActual;
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

    const x = carta.columna * ANCHO_CARTA;
    const y = carta.fila * ALTO_CARTA;
    div.style.backgroundPosition = `-${x}px -${y}px`;

    return div;
}

function crearDorsoDiv() {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";

    const x = DORSO.columna * ANCHO_CARTA;
    const y = DORSO.fila * ALTO_CARTA;
    div.style.backgroundPosition = `-${x}px -${y}px`;

    return div;
}

// ==============================
// BOTÓN
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRepartir").addEventListener("click", repartir);
});
