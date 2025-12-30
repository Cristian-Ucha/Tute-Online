// Tamaño de cada carta en el sprite
const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

// Palos del Tute (cada palo corresponde a una fila del sprite)
const PALOS = [
    "oros",     // fila 0
    "copas",    // fila 1
    "espadas",  // fila 2
    "bastos"    // fila 3
];

// Valores reales del Tute con su columna en el sprite
// (se excluyen ocho y nueve)
const VALORES = [
    { nombre: "as", columna: 0 },
    { nombre: "dos", columna: 1 },
    { nombre: "tres", columna: 2 },
    { nombre: "cuatro", columna: 3 },
    { nombre: "cinco", columna: 4 },
    { nombre: "seis", columna: 5 },
    { nombre: "siete", columna: 6 },
    // columnas 7 y 8 (ocho y nueve) NO se usan
    { nombre: "sota", columna: 9 },
    { nombre: "caballo", columna: 10 },
    { nombre: "rey", columna: 11 }
];

// Crear la baraja completa del Tute (40 cartas)
function crearBaraja() {
    const baraja = [];

    PALOS.forEach((palo, fila) => {
        VALORES.forEach(valor => {
            baraja.push({
                palo: palo,
                valor: valor.nombre,
                fila: fila,
                columna: valor.columna
            });
        });
    });

    return baraja;
}

// Repartir 5 cartas aleatorias
function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // Forzamos layout estable desde JavaScript
    mesa.style.display = "flex";
    mesa.style.gap = "10px";
    mesa.style.overflowX = "auto";
    mesa.style.padding = "10px";

    // Crear y barajar la baraja
    const baraja = crearBaraja();
    baraja.sort(() => Math.random() - 0.5);

    // Mano de 5 cartas
    const mano = baraja.slice(0, 5);

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
}

}


