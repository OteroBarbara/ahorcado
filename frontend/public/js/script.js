var imagenes = []
for (let i = 0; i<6; i++){
    imagenes[i]=`<img src='img/ahorcado${i}.png' alt='Imagen ahorcado con ${i} intentos restantes'>`
}

function cargarPalabra(){
    let palabra = document.getElementById('palabra').value.toUpperCase(); 

    if ((palabra != "")  && (!/(\d|\W)/gm.test(palabra))) {
        fetch("/ahorcado/newgame", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({pal: palabra}),
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('compartir-link').innerHTML = "Reta a un jugador a adivinar la palabra compartiéndole el siguiente link:<br>" + location.href + "2?idPartida=" + data.idpartida;
            document.getElementById('expectar').innerHTML ='<p>Clickea el siguiente botón para expectar la partida de quién desafiaste:</p><a target="_blank" href="/ahorcado2/expectador?idPartida='+data.idpartida+'" onclick="consultarEstado('+data.idpartida+')">Expectar partida</A>'
        });
    }else{
        alert("Debe ingresar una palabra, sin números ni espacios");
    }
}

function cargarPlayer2() {
    fetch(`/ahorcado2/newgame${location.search}`)
    .then(res => res.json())
    .then(data => {
        iniciarJuego(data.palabraOculta, data.intentos, data.historial);
    });
}

function iniciarJuego(palabra, intentos, historial) {
    document.getElementById('palabraOculta').innerHTML = palabra;
    document.getElementById('intentos').innerHTML = intentos;
    document.getElementById('historial').innerHTML = historial;
    document.getElementById('imagenAhorcado').innerHTML = imagenes[intentos];
}

function probarLetra() {
    let letra = document.getElementById("letra").value.toUpperCase();
    if ((letra.length == 1)&&(letra >= 'A')&&(letra <= 'Z')){
        fetch(`/ahorcado2/newgame${location.search}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({letter: letra}),
        })
        .then(res =>  res.json())
        .then(data => {
            if (data != undefined){
                iniciarJuego(data.palabraOculta, data.intentos, data.historial); //Actualizo lo que se ve en pantalla
                if (data.adivino === true){
                    alert("Ganaste el juego");
                }else if (data.intentos === 0){
                    alert("Perdiste el juego");
                }
            }else{
                throw Error();
            }
        })
        .catch(err => alert("Se agotaron los intentos"));
    }else{
        alert('Debe ingresar una letra');
    }
    
}

//expectar partida:
function expectarPartida(){
    document.getElementById('compartir-link-ep').innerHTML = "http://localhost:3001/ahorcado2" + location.search;
    consultarEstado();
}

function consultarEstado(){
    fetch(`/ahorcado/consultaEstado${location.search}`)
    .then(res => res.json())
    .then (data => {
        console.log("esperando");
        if(data != undefined){
            cargarPlayer2();
            if (data.estado == true){
                alert("El otro jugador ha adivinado la palabra y ganado el juego.");
                throw new Error
            }else if (data.estado == false){
                alert("El otro jugador ha agotado sus intentos y perdido el juego.");
                throw new Error
            }
            else if (data.estado == "sin terminar"){
                console.log(data.estado)
            }
        }
    })
    .then (setTimeout(consultarEstado,1500))
    .catch(err => console.log("juego terminado"));
}

