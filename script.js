const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

// Palos reales del Tute
const PALOS = ["oros", "copas", "espadas", "bastos"];

// Valores reales del Tute
const VALORES = [
    "as",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "sota",
    "caballo",
    "rey"
];

// Crear la baraja completa (40 cartas)
function crearBaraja() {
    const baraja = [];

    PALOS.forEach((palo, fila) => {
        VALORES.forEach((valor, columna) => {
            baraja.push({
                palo,
                valor,
                fila,
                columna
            });
        });
    });

    return baraja;
}


