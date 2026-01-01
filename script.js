alert("script.js cargado");

// ==============================
// CONFIGURACIÓN REAL DEL SPRITE
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;


// ==============================
// ESTADO DEL JUEGO
// ==============================

let manoJugador = [];
let bazaActual = [];


// ==============================
// DEFINICIÓN DEL JUEGO (TUTE)
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
// CREACIÓN DE LA BARAJA
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
// PUNTUACIÓN
// ==============================

function puntosCarta(valor) {
    switch (valor) {
        case "as": return 11;
        case "tres": return 10;
        case "rey": return 4;
        case "caballo": return 3;
        case "sota": return 2;
        default: return 0;
    }
}


// ==============================
// REPARTO
// ==============================

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    document.body.style.backgroundColor = "#0b5c3b";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";
    mesa.style.position = "relative";

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    manoJugador = baraja.slice(0, 10);
    bazaActual = [];

    renderMano();
    renderBaza();
}


// ==============================
// RENDER MANO
// ==============================

function renderMano() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    manoJugador.forEach((carta, index) => {
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

        // Click → jugar carta
        div.addEventListener("click", () => {
            jugarCarta(index);
        });

        mesa.appendChild(div);
    });
}


// ==============================
// RENDER BAZA
// ==============================

function renderBaza() {
    let zona = document.getElementById("baza");

    if (!zona) {
        zona = document.createElement("div");
        zona.id = "baza";
        zona.style.display = "flex";
        zona.style.justifyContent = "center";
        zona.style.marginTop = "30px";
        zona.style.minHeight = ALTO_CARTA + "px";
        document.body.appendChild(zona);
    }

    zona.innerHTML = "";

    bazaActual.forEach(carta => {
        const div = crearCartaDiv(carta);
        div.style.margin = "0 10px";
        zona.appendChild(div);
    });
}


// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(indice) {
    const carta = manoJugador.splice(indice, 1)[0];
    bazaActual.push(carta);

    renderMano();
    renderBaza();
}


// ==============================
// CREAR CARTA VISUAL
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

        .getElementById("btnRepartir")
        .addEventListener("click", repartir);
});
