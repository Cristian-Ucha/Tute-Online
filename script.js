// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

const TIEMPO_CANTICOS = 5000; // 5 segundos

// ==============================
// CONSTANTES
// ==============================

const ASIENTOS = [0,1,2,3];
const PAREJA = { 0:0, 2:0, 1:1, 3:1 };

const PUNTOS_CARTA = {
    as: 11,
    tres: 10,
    rey: 4,
    caballo: 3,
    sota: 2
};

const ORDEN_PODER = [
    "dos","cuatro","cinco","seis","siete",
    "sota","caballo","rey","tres","as"
];

// ==============================
// ESTADO GLOBAL
// ==============================

let estadoPartido = "jugando";   // jugando | finalizado
let estadoMano = "jugando";      // jugando | cantando | finalizada

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

let triunfo = null;
let cartaTriunfo = null;

let repartidor = null;
let primeraMano = true;

let bazasJugadas = 0;

let parejaPuedeCantar = [false,false];
let cantadoEstaBaza = [ [false,false],[false,false] ];

let puntosMano = [0,0];
let puntosCanticos = [0,0];

let manosGanadas = [0,0];

// ==============================
// DATOS CARTAS
// ==============================

const PALOS = [
    { nombre:"oros", fila:0 },
    { nombre:"copas", fila:1 },
    { nombre:"espadas", fila:2 },
    { nombre:"bastos", fila:3 }
];

const VALORES = [
    { nombre:"as", columna:0 },
    { nombre:"dos", columna:1 },
    { nombre:"tres", columna:2 },
    { nombre:"cuatro", columna:3 },
    { nombre:"cinco", columna:4 },
    { nombre:"seis", columna:5 },
    { nombre:"siete", columna:6 },
    { nombre:"sota", columna:9 },
    { nombre:"caballo", columna:10 },
    { nombre:"rey", columna:11 }
];

// ==============================
// BARAJA
// ==============================

function crearBaraja(){
    const b=[];
    PALOS.forEach(p=>VALORES.forEach(v=>{
        b.push({
            palo:p.nombre,
            valor:v.nombre,
            fila:p.fila,
            columna:v.columna
        });
    }));
    return b;
}

// ==============================
// PODER
// ==============================

function poder(c){ return ORDEN_PODER.indexOf(c.valor); }

function cartaGana(a,b){
    if(a.palo===triunfo && b.palo!==triunfo) return true;
    if(a.palo!==triunfo && b.palo===triunfo) return false;
    if(a.palo!==b.palo) return false;
    return poder(a)>poder(b);
}

// ==============================
// ORDENAR MANO
// ==============================

function ordenarMano(j){
    j.mano.sort((a,b)=>{
        if(a.palo===triunfo && b.palo!==triunfo) return -1;
        if(a.palo!==triunfo && b.palo===triunfo) return 1;
        if(a.palo!==b.palo) return a.palo.localeCompare(b.palo);
        return poder(a)-poder(b);
    });
}

// ==============================
// REPARTIR MANO
// ==============================

function repartirMano(){
    estadoMano="jugando";

    jugadores = ASIENTOS.map(a=>({
        asiento:a,
        mano:[],
        posiblesCanticos:[],
        canticosRealizados:[]
    }));

    puntosMano=[0,0];
    puntosCanticos=[0,0];
    parejaPuedeCantar=[false,false];
    cantadoEstaBaza=[[false,false],[false,false]];
    bazasJugadas=0;
    bazaActual=[];

    const baraja=crearBaraja().sort(()=>Math.random()-0.5);

    if(primeraMano){
        repartidor=Math.floor(Math.random()*4);
        primeraMano=false;
    }else{
        repartidor=(repartidor+1)%4;
    }

    for(let i=0;i<10;i++){
        jugadores.forEach(j=>j.mano.push(baraja.pop()));
    }

    cartaTriunfo=jugadores[repartidor].mano[
        Math.floor(Math.random()*jugadores[repartidor].mano.length)
    ];
    triunfo=cartaTriunfo.palo;

    jugadores.forEach(ordenarMano);

    turnoActual=(repartidor+1)%4;

    recalcularCanticos();
    render();
    turnoIA();
}

// ==============================
// CÁNTICOS
// ==============================

function recalcularCanticos(){
    jugadores.forEach(j=>{
        j.posiblesCanticos=[];
        PALOS.forEach(p=>{
            const rey=j.mano.some(c=>c.palo===p.nombre && c.valor==="rey");
            const caballo=j.mano.some(c=>c.palo===p.nombre && c.valor==="caballo");
            const ya=j.canticosRealizados.some(c=>c.palo===p.nombre);
            if(rey && caballo && !ya){
                j.posiblesCanticos.push({
                    palo:p.nombre,
                    puntos:p.nombre===triunfo?40:20
                });
            }
        });
    });
}

function indicePareja(asiento){ return asiento===0||asiento===1?0:1; }

function puedeCantar(j){
    const p=PAREJA[j.asiento];
    const idx=indicePareja(j.asiento);
    return (
        estadoMano==="cantando" &&
        parejaPuedeCantar[p] &&
        !cantadoEstaBaza[p][idx] &&
        j.posiblesCanticos.length>0
    );
}

function ejecutarCantico(j){
    if(!puedeCantar(j)) return;
    const c=j.posiblesCanticos[0];
    j.canticosRealizados.push(c);

    const p=PAREJA[j.asiento];
    const idx=indicePareja(j.asiento);

    cantadoEstaBaza[p][idx]=true;
    puntosCanticos[p]+=c.puntos;

    mostrarAviso(`Jugador ${j.asiento} canta ${c.puntos} en ${c.palo}`);
    recalcularCanticos();
    render();
}

// ==============================
// JUGAR CARTA
// ==============================

function cartasLegales(j){
    if(bazaActual.length===0) return j.mano;

    const dom=bazaActual.reduce((g,x)=>cartaGana(x.carta,g.carta)?x:g).carta;
    const palo=bazaActual[0].carta.palo;

    const delPalo=j.mano.filter(c=>c.palo===palo);
    if(delPalo.length){
        const sup=delPalo.filter(c=>cartaGana(c,dom));
        return sup.length?sup:delPalo;
    }

    const tr=j.mano.filter(c=>c.palo===triunfo);
    if(tr.length){
        const sup=tr.filter(c=>cartaGana(c,dom));
        return sup.length?sup:tr;
    }
    return j.mano;
}

function jugarCarta(asiento,idx){
    if(estadoMano!=="jugando") return;

    const j=jugadores[asiento];
    const c=j.mano.splice(idx,1)[0];
    bazaActual.push({asiento,carta:c});

    ordenarMano(j);
    recalcularCanticos();

    if(bazaActual.length===4){
        render();
        setTimeout(resolverBaza,1200);
        return;
    }

    turnoActual=(turnoActual+1)%4;
    render();
    turnoIA();
}

// ==============================
// IA
// ==============================

function turnoIA(){
    if(estadoMano!=="jugando" || turnoActual===0) return;

    setTimeout(()=>{
        const j=jugadores[turnoActual];
        const l=cartasLegales(j);
        jugarCarta(turnoActual,j.mano.indexOf(l[0]));
    },700);
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza(){
    let g=bazaActual[0];
    bazaActual.forEach(j=>{ if(cartaGana(j.carta,g.carta)) g=j; });

    const p=PAREJA[g.asiento];
    parejaPuedeCantar=[false,false];
    parejaPuedeCantar[p]=true;
    cantadoEstaBaza=[[false,false],[false,false]];

    bazaActual.forEach(j=>{
        puntosMano[p]+=PUNTOS_CARTA[j.carta.valor]||0;
    });

    turnoActual=g.asiento;
    bazaActual=[];
    bazasJugadas++;

    if(bazasJugadas===10){
        finalizarMano();
        return;
    }

    estadoMano="cantando";
    render();

    setTimeout(()=>{
        estadoMano="jugando";
        render();
        turnoIA();
    },TIEMPO_CANTICOS);
}

// ==============================
// FINAL DE MANO / PARTIDO
// ==============================

function finalizarMano(){
    estadoMano="finalizada";

    const total0=puntosMano[0]+puntosCanticos[0];
    const total1=puntosMano[1]+puntosCanticos[1];

    if(total0>total1) manosGanadas[0]++;
    else manosGanadas[1]++;

    mostrarResultadoMano(total0,total1);

    if(manosGanadas[0]===8 || manosGanadas[1]===8){
        estadoPartido="finalizado";
        mostrarResultadoPartido();
        return;
    }

    setTimeout(repartirMano,5000);
}

// ==============================
// UI RESULTADOS
// ==============================

function mostrarResultadoMano(p0,p1){
    mostrarAviso(
        `Fin de mano — Pareja 0: ${p0} | Pareja 1: ${p1}`
    );
}

function mostrarResultadoPartido(){
    mostrarAviso(
        `FIN DEL PARTIDO — Ganador Pareja ${manosGanadas[0]===8?0:1}`
    );
}

// ==============================
// AVISO
// ==============================

function mostrarAviso(txt){
    let d=document.getElementById("aviso");
    if(!d){
        d=document.createElement("div");
        d.id="aviso";
        d.style.position="absolute";
        d.style.top="40%";
        d.style.left="50%";
        d.style.transform="translateX(-50%)";
        d.style.background="rgba(0,0,0,0.85)";
        d.style.color="white";
        d.style.padding="20px";
        d.style.fontSize="20px";
        d.style.borderRadius="12px";
        d.style.zIndex="99999";
        document.body.appendChild(d);
    }
    d.textContent=txt;
    d.style.display="block";
    setTimeout(()=>d.style.display="none",4000);
}

// ==============================
// RENDER (simplificado)
// ==============================

function render(){
    // reutiliza tu render actual (mesa, rivales, baza, triunfo, botón cantar)
}

// ==============================
// INICIO
// ==============================

document.getElementById("btnRepartir").onclick=repartirMano;
