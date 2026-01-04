console.log("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let esperandoAutomatico = false;

let jugadorQueDa = null;
let cartaTriunfo = null;
let triunfo = null;

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

    jugadores = [
        { id: 0, mano: [] },
        { id: 1, mano: [] },
        { id: 2, mano: [] },
        { id: 3, mano: [] }
    ];

    bazaActual = [];
    esperandoAutomatico = false;

    if (jugadorQueDa === null) {
        jugadorQueDa = Math.floor(Math.random() * 4);
    }

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    // TRIUNFO REAL (DE LA MANO DEL QUE DA)
    const manoQueDa = jugadores[jugadorQueDa].mano;
    cartaTriunfo = manoQueDa[Math.floor(Math.random() * manoQueDa.length)];
    triunfo = cartaTriunfo.palo;

    turnoActual = (jugadorQueDa + 1) % 4;

    render();
}

// ==============================
// CARTAS LEGALES (ASISTIR + TRIUNFO)
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

function jugarCarta(idJugador, indice) {
    const jugador = jugadores[idJugador];
    const carta = jugador.mano.splice(indice, 1)[0];

    bazaActual.push({ jugador: idJugador, carta });

    if (bazaActual.length === 4) {
        render();
        setTimeout(() => {
            bazaActual = [];
            turnoActual = (turnoActual + 1) % 4;
            render();
        }, 1200);
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
    if (turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    if (!jugador || jugador.mano.length === 0) return;

    const legales = cartasLegales(jugador);
    const carta = legales[0];
    const indice = jugador.mano.indexOf(carta);

    jugarCarta(turnoActual, indice);
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

    if (turnoActual !== 0 && bazaActual.length < 4 && !esperandoAutomatico) {
        esperandoAutomatico = true;
        setTimeout(jugarAutomatico, 600);
    }
}

// ==============================
// MESA JUGADOR
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const legales = cartasLegales(jugadores[0]);

    jugadores[0].mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);
        const esLegal = legales.includes(carta);

        div.style.opacity = esLegal ? "1" : "0.4";
        div.style.marginLeft = index === 0 ? "0px" : "-120px";
        div.style.transition = "transform 0.15s";

        if (esLegal) {
            div.onmouseenter = () => div.style.transform = "translateY(-40px)";
            div.onmouseleave = () => div.style.transform = "translateY(0)";
            div.onclick = () => turnoActual === 0 && jugarCarta(0, index);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RIVALES
// ==============================

function renderRivales() {
    renderRival(1, "arriba");
    renderRival(2, "izquierda");
    renderRival(3, "derecha");
}

function renderRival(id, posicion) {
    let cont = document.getElementById("rival-" + id);
    if (!cont) {
        cont = document.createElement("div");
        cont.id = "rival-" + id;
        cont.style.position = "absolute";
        document.body.appendChild(cont);
    }

    cont.innerHTML = "";

    if (posicion === "arriba") {
        cont.style.top = "10px";
        cont.style.left = "50%";
        cont.style.transform = "translateX(-50%)";
        cont.style.display = "flex";
    }

    if (posicion === "izquierda") {
        cont.style.left = "10px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    if (posicion === "derecha") {
        cont.style.right = "10px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
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
        baza.appendChild(crearCartaDiv(jugada.carta));
    });
}

// ==============================
// INFO
// ==============================

function renderTurno() {
    const div = document.getElementById("turno");
    div.textContent = "Turno del jugador " + turnoActual;
}

function renderTriunfo() {
    const div = document.getElementById("triunfo");
    div.innerHTML = "Triunfo:<br>";
    div.appendChild(crearCartaDiv(cartaTriunfo));
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
