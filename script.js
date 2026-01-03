alert("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

// ==============================
// DATOS DEL TUTE
// ==============================

const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
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
// REPARTO A 4 JUGADORES
// ==============================

function repartir() {
    document.body.style.backgroundColor = "#0b5c3b";
    document.body.style.margin = "0";

    const mesa = document.getElementById("mesa");
    const baza = document.getElementById("baza");
    mesa.innerHTML = "";
    baza.innerHTML = "";

    jugadores = [
        { id: 0, mano: [], bazas: [] },
        { id: 1, mano: [], bazas: [] },
        { id: 2, mano: [], bazas: [] },
        { id: 3, mano: [], bazas: [] }
    ];

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    // Reparto real: 10 cartas por jugador
    for (let i = 0; i < 10; i++) {
        jugadores.forEach(jugador => {
            jugador.mano.push(baraja.pop());
        });
    }

    turnoActual = 0;
    bazaActual = [];

    render();
}

// ==============================
// RENDER GENERAL
// ==============================

function render() {
    renderManoJugador();
    renderBaza();
    renderTurno();
}

// ==============================
// MANO DEL JUGADOR 0 (HUMANO)
// ==============================

function renderManoJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const mano = jugadores[0].mano;

    mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);

        div.style.marginLeft = index === 0 ? "0px" : "-120px";
        div.style.zIndex = index;
        div.style.transition = "transform 0.15s ease";

        // Hover
        div.addEventListener("mouseenter", () => {
            div.style.transform = "translateY(-40px)";
            div.style.zIndex = 1000;
        });

        div.addEventListener("mouseleave", () => {
            div.style.transform = "translateY(0)";
            div.style.zIndex = index;
        });

        // Solo se puede jugar si es tu turno
        div.addEventListener("click", () => {
            if (turnoActual !== 0) return;
            jugarCarta(0, index);
        });

        mesa.appendChild(div);
    });
}

// ==============================
// BAZA
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";

    baza.style.display = "flex";
    baza.style.justifyContent = "center";
    baza.style.marginTop = "30px";

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
        info.style.marginTop = "10px";
        document.body.appendChild(info);
    }

    info.textContent = "Turno del jugador " + turnoActual;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(idJugador, indiceCarta) {
    const jugador = jugadores[idJugador];
    const carta = jugador.mano.splice(indiceCarta, 1)[0];

    bazaActual.push({
        jugador: idJugador,
        carta: carta
    });

    // Avanzar turno
    turnoActual = (turnoActual + 1) % 4;

    render();
}

// ==============================
// CARTA VISUAL
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

// ==============================
// BOTÓN
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("btnRepartir")
        .addEventListener("click", repartir);
});
