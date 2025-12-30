// ==============================
// CONFIGURACIÓN REAL DEL SPRITE
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;


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

function puntosMano(mano) {
    return mano.reduce((total, carta) => total + puntosCarta(carta.valor), 0);
}


// ==============================
// REPARTO REAL (10 CARTAS)
// ==============================

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // Layout tipo juego real (solapado)
    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);
    const mano = baraja.slice(0, 10);

    mano.forEach((carta, index) => {
        const div = document.createElement("div");

        div.style.width = ANCHO_CARTA + "px";
        div.style.height = ALTO_CARTA + "px";
        div.style.backgroundImage = "url('cartas/baraja.png')";
        div.style.backgroundRepeat = "no-repeat";

        const x = carta.columna * ANCHO_CARTA;
        const y = carta.fila * ALTO_CARTA;

        div.style.backgroundPosition = `-${x}px -${y}px`;

        // SOLAPAMIENTO (CLAVE)
        div.style.marginLeft = index === 0 ? "0px" : "-120px";

        mesa.appendChild(div);
    });

    mostrarPuntuacion(mano);
}


// ==============================
// MOSTRAR PUNTUACIÓN
// ==============================

function mostrarPuntuacion(mano) {
    let info = document.getElementById("puntuacion");

    if (!info) {
        info = document.createElement("div");
        info.id = "puntuacion";
        info.style.marginTop = "10px";
        info.style.fontSize = "20px";
        info.style.color = "white";
        info.style.textAlign = "center";
        document.body.appendChild(info);
    }

    info.textContent = "Puntos de la mano: " + puntosMano(mano);
}
