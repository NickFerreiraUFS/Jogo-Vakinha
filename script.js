let context;
let musicPlay = true;
let stopGame = false;
let gameOver = false;
let gameOverMusic = true;
let naveImage;
let enemyImage;
let conectionImage;
let bulletImage;
let countdown = 3; 
let countingDown = true; 


let vilaoXProp = 0.2;
let vilaoYProp = 0.2;

let tempo = 0;
let ultimoUpdate = Date.now();



document.addEventListener("click", () => {
        console.log("clicou");
        if (gameOver) {
            resetGame();
        }
});

document.addEventListener("keydown", function(event){
    if (event.key == "m" && musicPlay){
        musicPlay = false;
        musicaFundo.pause();
    }
    else if (event.key == "m" && !musicPlay){
        musicPlay = true;
        musicaFundo.play();
    }
})

function startCountdown() {
    let interval = setInterval(() => {
        countdown--;
        if(countdown <= 0){
            countingDown = false;
            clearInterval(interval);
            spawninimigo = setInterval(spawnInim,800);
        }
    }, 1000);
}


window.onload = function(){
    board = document.getElementById("board");
    context = board.getContext("2d");

    musicaFundo = new Audio("./Projeto_novo.mp3");
    musicaFundo.loop = true;
    musicaFundo.volume = 0.9;
    musicaFundo.play();


    board.width = board.clientWidth;
    board.height = board.clientHeight;

    const larguraTela = board.width;
    const alturaTela = board.height;
    
    const tamanhoInicial = larguraTela/10;
    const xInicial = larguraTela/2 - tamanhoInicial/2;
    const yInicial = alturaTela/2 - tamanhoInicial/2;

    loadImage();
    move();

    jogador = new nave(xInicial,yInicial,tamanhoInicial,tamanhoInicial);

    nucleo = new struct(larguraTela/2.35,alturaTela/2.8);

    this.requestAnimationFrame(gameLoop);
    startCountdown();

    window.addEventListener('resize', handleResize);
    handleResize(); 

}

// 4. FUNÇÃO PARA LIDAR COM O REDIMENSIONAMENTO DA JANELA
function handleResize() {
    const larguraAntiga = board.width || board.clientWidth;
    const alturaAntiga = board.height || board.clientHeight;

    // --- guarda proporções atuais do vilão em relação à tela ---
    let nPropX = 0, nPropY = 0;
    if(jogador){
        nPropX = jogador.posX / larguraAntiga;
        nPropY = jogador.posY / alturaAntiga;
    }

    // --- aplica novo tamanho do canvas ---

    const novaLargura = board.clientWidth;
    const novaAltura = board.clientHeight;

    board.width = novaLargura;
    board.height = novaAltura;

    if (jogador) {
        const proporcaoOriginal = jogador.width / jogador.height; // mantém proporção
        jogador.width = novaLargura / 10; 
        jogador.height = jogador.width / proporcaoOriginal; // ajusta mantendo proporção
        jogador.posX = nPropX * novaLargura;
        jogador.posY = nPropY * novaAltura;
    }


    if (vilao) {
        const novoTamanhoVilao = novaLargura / 20;
        vilao.width = novoTamanhoVilao;
        vilao.height = novoTamanhoVilao;

        // reposiciona mantendo proporção
        vilao.posX = propX * novaLargura;
        vilao.posY = propY * novaAltura;
    }
}



function loadImage (){
    naveImage = new Image();
    naveImage.src = "./NAVE.png";

    enemyImage = new Image();
    enemyImage.src = "./enimy.png";

    conectionImage = new Image();
    conectionImage.src = "./ligacao.png";

    bulletImage = new Image();
    bulletImage.src = "./bullet.png";

    backgroundImage = new Image();
    backgroundImage.src = "./fundo.png"

    bulletEfect = new Audio("./video-game-hit-noise-001-135821.mp3");
    gameOverEfect= new Audio("./pixel-game-over-319170.mp3");

}

//objetos

class nave{
    constructor(posX, posY, height, width){
        this.posX = posX;
        this.posY = posY;
        this.height = height;
        this.width = width;
        this.img = naveImage;
        this.ultPos = true;
        this.block = false;
        this.pontos = 0;
        this.loaded = false;
        this.img.onload = () =>{
            this.loaded = true;
        };
    }

    draw(){
        if(!context) return;
        if(this.loaded){
            context.save();

            if (velX < -0.1) { 
                this.ultPos = false;
                // indo para esquerda → espelha
                context.scale(-1, 1);
                context.drawImage(
                    this.img,
                    -this.posX - this.width,
                    this.posY,
                    this.width,
                    this.height
                );
            } else if (velX > 0.1) {
                this.ultPos = true;
                // normal (indo para direita ou parado)
                context.drawImage(
                    this.img,
                    this.posX,
                    this.posY,
                    this.width,
                    this.height
                );
            } else{
                if(this.ultPos){context.drawImage(
                    this.img,
                    this.posX,
                    this.posY,
                    this.width,
                    this.height)
                } else{
                    context.scale(-1, 1);
                    context.drawImage(
                        this.img,
                        -this.posX - this.width,
                        this.posY,
                        this.width,
                        this.height
                    );
                }
            }

            context.restore();
        }
    }
}

let bullets = [];

class bullet{
    constructor(posX,posY, lastPos){
        this.posX = posX;
        this.posY = posY;
        this.img = bulletImage;
        this.height = jogador.height*0.3;
        this.width = jogador.width*0.3;
        this.velDisp = lastPos ? 8 : -8;
        this.loaded = this.img.complete;
        this.img.onload = () =>{
            this.loaded = true;
        }
    }

    avanc(){
        this.posX +=this.velDisp;
    }

    draw(){
        if(!context) return;
        if(this.loaded){
            context.drawImage(
                this.img,
                this.posX,
                this.posY,
                this.width,
                this.height
            );
        }
    }
}

let enemys = [];

class enemy{
    constructor(posX,posY){
        this.posX= posX;
        this.posY= posY;
        this.velX = 0;
        this.velY = 0;
        this.atrito = 0.8;
        this.height = jogador.height*0.9;
        this.width = jogador.width * 0.9;
        this.img = enemyImage;
        this.loaded = this.img.complete;
        this.img.onload = () =>{
            this.loaded = true;
        }
    }

    draw(){
        if(!context) return;
        if(this.loaded){
            context.drawImage(
                this.img,
                this.posX,
                this.posY,
                this.width,
                this.height
            )
        }
    }

    kill() {
        if(this.posX < nucleo.posX + nucleo.width*0.25){
            this.velX+=0.7;
        }
        if(this.posX > nucleo.posX + nucleo.width*0.25){
            this.velX-=0.7;
        }
        if(this.posY < nucleo.posY + nucleo.height*0.35){
            this.velY+=0.7;
        }
        if(this.posY > nucleo.posY + nucleo.height*0.25){
            this.velY-=0.7;
        }
    }
}
class struct{
    constructor(posX,posY){
        this.posX = posX;
        this.posY = posY;
        this.life = 10;
        this.width = jogador.width*1.5;
        this.height = jogador.height*1.5;
        this.img = conectionImage;
        this.loaded = true;
        
    }
    draw(){
        if(!context) return;
        if(this.loaded){
            context.save();

            // move o contexto para o centro da imagem
            context.translate(this.posX + this.width/2, this.posY + this.height/2);

            // rotaciona 90 graus (pi/2 radianos)
            context.rotate(Math.PI / 2);

            // desenha a imagem centralizada
            context.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);

            context.restore();
            
        }
        
    }
}



//movimentação

let moveKeys = [];

function move(){
    document.addEventListener('keydown',function(event){
        moveKeys[event.key] = true;
})
    document.addEventListener('keyup', function(event){
        delete moveKeys[event.key];
    })
};



let atrito = 0.9;
let velX = 0;
let velY = 0;
const acl = 0.5
let spacePressed = false;

function spawnInim() {
    let x, y;
    const side = Math.floor(Math.random() * 4); // 0: topo, 1: direita, 2: baixo, 3: esquerda

    switch(side) {
        case 0: // direita
            x = board.width + 50; // 50px fora da tela
            y = Math.random() * board.height;
            break;
        case 1: // esquerda
            x = -50; // 50px à esquerda da tela
            y = Math.random() * board.height;
            break;
        case 2: // topo
            y = -50;
            x = Math.random() * board.width;
            break;
        case 3:
            y = board.height + 50;
            x = Math.random() * board.width;
            break;
    }

    const newEnemy = new enemy(x, y);
    enemys.push(newEnemy);
}


function resetGame() {
    stopGame = false;
    gameOver = false;

    jogador.posX = board.width / 2 - jogador.width / 2;
    jogador.posY = board.height / 2 - jogador.height / 2;
    velX = 0;
    velY = 0;
    moveKeys = [];
    spacePressed = false;

    nucleo.life = 10;
    tempo = 0;

    enemys = [];
    bullets = [];

    // limpa timers antigos
    if(spawninimigo) clearInterval(spawninimigo);
    if(timer) clearInterval(timer);

    // reinicia timers
    spawninimigo = setInterval(spawnInim, 800);
    timer = setInterval(() => { tempo++; }, 1000);
    
    musicaFundo.currentTime = 0;
    musicaFundo.play();
    gameOverMusic = true;
}


function formatarTempo(segundos) {
    let minutos = Math.floor(segundos / 60);
    let segs = segundos % 60;
    let minStr = minutos < 10 ? "0" + minutos : minutos;
    let segStr = segs < 10 ? "0" + segs : segs;
    return minStr + ":" + segStr;
}

timer = setInterval(() => {
    tempo++;
}, 1000);


function gameLoop(){
    context.clearRect(0,0,board.width, board.height);
     if(countingDown){
        context.fillStyle = 'white';
        context.font = '100px Arial';
        context.textAlign = 'center';
        context.fillText(countdown, board.width/2, board.height/2);

        requestAnimationFrame(gameLoop);
        return;
    }
    if(stopGame){
        telaGameOver();
        if(gameOverMusic){
            musicaFundo.pause();
            gameOverEfect.volume = 0.3;
            gameOverEfect.play();
            gameOverMusic = false;
        }
        requestAnimationFrame(gameLoop); // continua rodando o loop
        return;
    }else{
        
    }

    if(backgroundImage){
        context.drawImage(backgroundImage, 0,0,board.width,board.height)
    }else{
        context.fillStyle = 'rgb(69, 41, 74)';
        context.fillRect(0,0,board.width, board.height);
    }
    
    context.imageSmoothingEnabled = false;

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText("Pontos: " + jogador.pontos, board.width*0.1, 40);

    context.fillText("LIFE: " + nucleo.life*10, board.width/2.37, 40);
    

    context.fillText("Tempo: " +  formatarTempo(tempo) + "s", board.width - 250, 40);

    nucleo.draw();

    if(!jogador.block && !stopGame){
        if (moveKeys['ArrowUp']) {
        velY -=acl
        if(velY > 20){ velY = 20;} 
        }
        if (moveKeys['ArrowDown']) {
            velY +=acl
            if(velY >20){ velY = 20;} 
        }
        if (moveKeys['ArrowLeft']) {
            velX -=acl
            if(velX > 20){ velX = 20;} 
        }
        if (moveKeys['ArrowRight']) {
            velX +=acl
            if(velX > 20){ velX = 20;} 
        }
        if (moveKeys[' ']) {
            if (!spacePressed) { 
                bullets.push(new bullet(jogador.posX + jogador.width/4, jogador.posY + jogador.height/2.5, jogador.ultPos));
                spacePressed = true;
                bulletEfect.currentTime = 0;
                bulletEfect.volume = 0.1;
                bulletEfect.play();
            }
        }
        else {
            spacePressed = false;
        }
    }

    for(let i = 0; i < bullets.length; i++){
        let b = bullets[i];
        b.avanc();
        b.draw();

        if(b.posX < 0 || b.posX > board.width){
            bullets.splice(i,1);
            i--;
        }
    }

    for(let i = 0; i < enemys.length;i++){
        enemys[i].draw();
        if(!stopGame){
            enemys[i].kill();
        }else{
            enemys[i].velX = 0;
            enemys[i].velY = 0;
        }
        enemys[i].posX += enemys[i].velX;
        enemys[i].posY += enemys[i].velY;

        // aplica atrito para o movimento ficar mais suave
        enemys[i].velX *= enemys[i].atrito;
        enemys[i].velY *= enemys[i].atrito;
        if(enemys[i].posX + enemys[i].width/5 > jogador.posX && enemys[i].posX < jogador.posX + jogador.width/2 && enemys[i].posY > jogador.posY && enemys[i].posY < jogador.posY + jogador.width/2.5 && !jogador.block){
            enemys.splice(i,1);
            jogador.block = true;
            jogador.pontos -=5;
            setTimeout(() => {
                jogador.block = false
            }, 1000);
            i--;
        }

       let inimigosParaRemover = new Set();
       let balasParaRemover = new Set();

        // checa colisões
        for (let i = 0; i < enemys.length; i++) {
            const e = enemys[i];

            // colisão com as ligações
            if (
                    e.posX + e.width/5 > nucleo.posX &&
                    e.posX < nucleo.posX + nucleo.height/2 &&
                    e.posY > nucleo.posY &&
                    e.posY < nucleo.posY + nucleo.width/2.5
            ) {
                inimigosParaRemover.add(i); // remove inimigo também
                nucleo.life--;
            }

            // colisão com balas
            for (let j = 0; j < bullets.length; j++) {
                const b = bullets[j];
                if (
                    e.posX < b.posX + b.width/2 &&   
                    e.posX + e.width > b.posX + b.width/2 &&    
                    e.posY < b.posY + b.height &&   
                    e.posY + e.height > b.posY    
                ) {
                    inimigosParaRemover.add(i);
                    balasParaRemover.add(j);
                    jogador.pontos +=10
                }
            }
        }

        // remove inimigos e balas depois do loop
        enemys = enemys.filter((_, idx) => !inimigosParaRemover.has(idx));
        bullets = bullets.filter((_, idx) => !balasParaRemover.has(idx));

}

    velY *= atrito;
    velX *= atrito;

    jogador.posY += velY;
    jogador.posX += velX;

    if(jogador.posX < 0){
        jogador.posX = 0;
    }
    if(jogador.posY < 0){
        jogador.posY = 0;  
    }
    if(jogador.posX + jogador.width > board.width){
        jogador.posX = board.width - jogador.width;
    }
    if(jogador.posY + jogador.height > board.height){
        jogador.posY = board.height - jogador.height;
    }
    if (nucleo.life <= 0) {
        stopGame = true;
        gameOver = true;
        clearInterval(spawninimigo);
        clearInterval(timer);
    }

    jogador.draw();

    requestAnimationFrame(gameLoop);
}

function telaGameOver(){
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0,0, board.width,board.height);

    context.fillStyle = 'red';
    context.font = '70px Arial';
    context.fillText("GAME OVER!", board.width/3, board.height/2);

    context.fillStyle = 'red';
    context.font = '40px Arial';
    context.fillText("Clique para recomeçar", board.width/2.8, board.height/1.3);
}
