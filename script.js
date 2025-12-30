const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const carta = document.createElement("div");
    carta.className = "carta";
    carta.style.backgroundPosition = "0px 0px";

    mesa.appendChild(carta);
}
