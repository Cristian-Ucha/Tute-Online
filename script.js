alert("script.js cargado");
const ANCHO_CARTA = 208; // 2496 / 12
const ALTO_CARTA = 319;  // 1595 / 5

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";
    const cartas = [
        { fila: 0, columna: 0 }, 
        { fila: 0, columna: 11 }, 
        { fila: 1, columna: 0 },   
        { fila: 2, columna: 0 },   
        { fila: 4, columna: 0 }    
    ];

    cartas.forEach(carta => {
        const div = document.createElement("div");
        div.className = "carta";

        const x = carta.columna * ANCHO_CARTA;
        const y = carta.fila * ALTO_CARTA;

        div.style.backgroundPosition = `-${x}px -${y}px`;

        mesa.appendChild(div);
    });
}
