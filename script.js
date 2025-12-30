// ==============================
// CONFIGURACIÓN DEL SPRITE
// ==============================

const ANCHO_CARTA = 140;
const ALTO_CARTA = 215;


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
// PUNTUACIÓN DEL TUTE
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
    let total = 0;
    mano.forEach(carta => total += puntosCarta(carta.valor));
    return total;
}


// ==============================
// REPARTO DE CARTAS (10)
// ==============================

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // layout estable
    mesa.style.display = "flex";
    mesa.style.gap = "6px";
    mesa.style.justifyContent = "center";

    const baraja = crearBaraja();
    baraja.sort(() => Math.random() - 0.5);

    const mano = baraja.slice(0, 10);

    mano.forEach(carta => {
        const div = document.createElement("div");

        div.style.width = ANCHO_CARTA + "px";
        div.style.height = ALTO_CARTA + "px";
        div.style.backgroundImage = "url('cartas/baraja.png')";
        div.style.backgroundRepeat = "no-repeat";

        const x = carta.columna * 208; // ojo: usamos tamaño REAL del sprite
        const y = carta.fila * 319;

        div.style.backgroundPosition = `-${x}px -${y}px`;
        div.style.backgroundSize = "2496px 1595px"; // fuerza escalado correcto

        mesa.appendChild(div);
    });

    // MOSTRAR PUNTUACIÓN DEBAJO
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
        info.style.marginTop = "12px";
        info.style.fontSize = "18px";
        info.style.color = "white";
        info.style.textAlign = "center";
        document.body.appendChild(info);
    }

    info.textContent = "Puntos de la mano: " + puntosMano(mano);
}
