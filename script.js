function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const cartas = [
        "As de Oros",
        "Tres de Copas",
        "Rey de Espadas",
        "Sota de Bastos",
        "Siete de Oros"
    ];

    cartas.forEach(carta => {
        const div = document.createElement("div");
        div.textContent = carta;
        div.className = "carta";
        mesa.appendChild(div);
    });
}
