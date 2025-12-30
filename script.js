// ==============================
// CONFIGURACIÓN DEL SPRITE
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;


// ==============================
// DEFINICIÓN DEL JUEGO (TUTE)
// ==============================

// Palos del Tute con su fila real en el sprite
const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
];

// Valores reales del Tute (sin 8 ni 9) con su columna en el sprite
const VALORES = [
    { nombre: "as", columna: 0 },
    { nombre: "dos", columna: 1 },
    { nombre: "tres", columna: 2 },
    { nombre: "cuatro", columna: 3 },
    { nombre: "cinco", columna: 4 },
    { nombre: "seis", columna: 5 },
    { nombre: "siete", columna: 6 },
    // columnas 7 y 8 (ocho y nueve) se ignoran
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

    return baraja; // 40 cartas
}


// ==============================
// PUNTUACIÓN DEL TUTE
// ==============================

function puntosCarta(valor) {
    switch (valor) {
        case "as":
            return 11;
        case "tres":
            return 10;
        case "rey":
            return 4;
        case "caballo":
            return 3;
        case "sota":
            return 2;
        default:
            return 0;
    }
}

function puntosMano(mano) {
    let total = 0;

    mano.forEach(carta => {
        total += puntosCarta(carta.valor);
    });

    return total;
}


// ==============================
// REPARTO DE CARTAS (10)
// ==============================

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // Layout forzado desde JS (estable)
    mesa.style.display = "flex";
    mesa.style.gap = "10px";
    mesa.style.overflowX = "auto";
    mesa.style.padding = "10px";
    mesa.style.alignItems = "flex-start";

    // Crear y barajar la baraja
    const baraja = crearBaraja();
    baraja.sort(() => Math.random() - 0.5);

    // Mano real del Tute (10 cartas)
    const mano = baraja.slice(0, 10);

    // Mostrar cartas
    mano.forEach(carta => {
        const div = document.createElement("div");

        div.style.width = ANCHO_CARTA + "px";
        div.style.height = ALTO_CARTA + "px";

        div.style.backgroundImage = "url('cartas/baraja.png')";
        div.style.backgroundRepeat = "no-repeat";

        const x = carta.columna * ANCHO_CARTA;
        const y = carta.fila * ALTO_CARTA;

        div.style.backgroundPosition = `-${x}px -${y}px`;

        mesa.appendChild(div);
    });

    // Mostrar puntos de la mano (prueba lógica)
    const puntos = puntosMano(mano);

    const info = document.createElement("div");
    info.style.color = "white";
    info.style.marginLeft = "20px";
    info.style.fontSize = "18px";
    info.textContent = "Puntos de la mano: " + puntos;

    mesa.appendChild(info);
}
