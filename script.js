function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const carta = document.createElement("div");
    carta.className = "carta";

    mesa.appendChild(carta);
}
