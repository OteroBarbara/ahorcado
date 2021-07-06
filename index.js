const express = require('express');
const app = express();
const fs = require("fs");
const PORT = 3001;
const path = require('path');
const shortID = require('shortid');

console.log("Iniciado");
app.use(express.static(path.resolve(__dirname,'frontend/public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

//routes
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend/index.html'))
})

app.get('/ahorcado', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend/nuevapartida.html'));
})

app.get('/ahorcado2', (req, res) => {
    if (req.query.idPartida != undefined) {
        res.sendFile(path.resolve(__dirname, 'frontend/player2.html'))
    }else{
        res.send('error 404 not found');
    }
})

app.get('/ahorcado2/newgame', (req, res) => {
    let id = req.query.idPartida;
    if (id != undefined){
        let partida = JSON.parse(fs.readFileSync("game.json")).find(game => game.idPartida == id);
        res.json(partida);
    }else{
        res.send('error 404 not found');
    }
})

app.get('/ahorcado2/expectador', (req, res) => {
    let id = req.query.idPartida;
    if (id != undefined){
        res.sendFile(path.resolve(__dirname, 'frontend/player1.html'))
    }else{
        res.send('error 404 not found');
    }
})

//juego
app.post('/ahorcado/newgame', (req, res) => {
    // instrucciones cuando envía una palabra
    let word = req.body.pal.toUpperCase();
    if ((word != "") && (!/(\d|\W)/gm.test(word))){
        let secretword = "";
        for (let i = 0 ; i < word.length ; i++){
            secretword += "_";
        };
        let codigo = shortID.generate();
        let infoPartida = {
            idPartida: codigo,
            intentos: 5,
            palabra: word,
            palabraOculta: secretword,
            adivino: false,
            historial: ""
        }
        let data = JSON.parse(fs.readFileSync('game.json'));
        data.push(infoPartida);
        fs.writeFile('game.json', JSON.stringify(data), (err) => {console.log(err)});
        return res.json({palabra: word.pal , idpartida: codigo});
    }else{
        res.send(undefined);
    }
})

app.post('/ahorcado2/newgame', (req, res) => {
    let id = req.query.idPartida;
    let letra = req.body.letter.toUpperCase();
    if ((id != undefined)&&(letra.length == 1)&&(letra >= 'A')&&(letra <= 'Z')){
        let partidas = JSON.parse(fs.readFileSync("game.json"));
        let partidaEnCurso = partidas.find(game => game.idPartida == id);
        if(partidaEnCurso.intentos > 0){
            if (!(partidaEnCurso.historial.includes(letra))){
                let word = partidaEnCurso.palabra;
                partidaEnCurso.historial += letra + ' ';
                if (word.includes(letra)){
                    let palabra = word.split('');
                    let palabraOculta = partidaEnCurso.palabraOculta.split('');
                    for (let i=0; i<palabra.length; i++){
                        if(palabra[i]==letra){
                            palabraOculta[i] = letra;
                        }
                    }
                    let secretword = palabraOculta.join('');
                    partidaEnCurso.palabraOculta = secretword;
                    if (word == secretword){
                        partidaEnCurso.adivino = true;
                    }
                }else{
                    partidaEnCurso.intentos --;
                }
                fs.writeFile('game.json', JSON.stringify(partidas), (err) => {console.log(err)});
            }
            res.json(partidaEnCurso);
        }else{
            res.send(undefined);
        }   
    }else{
        res.end();
    }
})

//consulta de estado
app.get('/ahorcado/consultaEstado', (req, res) => {
    let partidas = JSON.parse(fs.readFileSync("game.json"));
    let partidaEnCurso = partidas.find(game => game.idPartida == req.query.idPartida);
    if (partidaEnCurso.adivino == true){
        res.json({estado: true});
    }else if (partidaEnCurso.intentos == 0){
        res.json({estado: false});
    }else{
        res.json({estado: "sin terminar"});
    }
})


//escuchando al puerto
app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`) 
});
