(function () {

// Проверка наличия данных в SessionStorage. Если данных нет, принимаются параметры "по умолчанию":

if (sessionStorage.getItem('options') === null) {
    let optionsDefault = {
        'nameLeft': 'Player1',
        'nameRight': 'Player2',
        'pointsToWin': '3',
    }
    sessionStorage.setItem('options', JSON.stringify(optionsDefault));
}

// Получение данных из SessionStorage для применения в игре:

let options = JSON.parse(sessionStorage.getItem('options'));

// Создание звуковых эффектов касаний мяча и празднований гола:

const touchAudio= new Audio("http://www.simphonics.com/library/WaveFiles/Production%20Wavefiles/Aircraft/A320%20-%20321/CompStall.wav")
const goalAudio= new Audio("https://mrclan.com/fastdl/tfc/sound/cheer.wav")
const winAudio= new Audio("https://www.talkingwav.com/wp-content/uploads/2017/10/cramer-23.wav")

function soundInit() {
    touchAudio.play();
    goalAudio.play();
    winAudio.play();
    touchAudio.pause();
    goalAudio.pause();
    winAudio.pause();
}

function winSound() {
    winAudio.currentTime=0;
    winAudio.play();
}


function touchSound() {
    touchAudio.currentTime=0;
    touchAudio.play();
}

function goalSound() {
    goalAudio.currentTime=0;
    goalAudio.play();
}

soundInit();

const gamePage = document.querySelector('#game');

// создаём табло:

const scoreboard = document.createElement("div");
scoreboard.setAttribute("id", "scoreboard");
let scoreboardHeight = 100;
scoreboard.style.cssText += `height: ${scoreboardHeight}px`;
gamePage.append(scoreboard);

// Табло включает в себя: имя игрока слева, его текущее количество голов, ...

const scoreboardPlayerLeft = document.createElement("div");
const leftPlayerName = document.createElement("p");
scoreboardPlayerLeft.append(leftPlayerName);
leftPlayerName.setAttribute("id", "leftPlayerName");
const leftPlayerCount = document.createElement("p");
leftPlayerCount.setAttribute("id", "leftPlayerCount");
scoreboardPlayerLeft.append(leftPlayerCount);
scoreboard.append(scoreboardPlayerLeft);

// ... кнопку паузы, кнопку отключения звука и строчку, информирующую игроков, до скольки очков ведётся игра, ...
const scoreboardGameInfo = document.createElement("div");
scoreboardGameInfo.setAttribute("id", "scoreboardGameInfo");
const pauseBtn = document.createElement("button");
pauseBtn.innerHTML = 'Pause';
scoreboardGameInfo.append(pauseBtn);
const scoreboardSoundImg = document.createElement("div");
scoreboardSoundImg.setAttribute("id", "SoundLogo");
scoreboardSoundImg.classList.add("sound-on");
scoreboardGameInfo.append(scoreboardSoundImg);
const goalsNeedToWin = document.createElement("p");
scoreboardGameInfo.append(goalsNeedToWin);
scoreboard.append(scoreboardGameInfo);

// по щелчку иконка звука становится перечёркнутой
scoreboardSoundImg.onclick = function(){
	scoreboardSoundImg.classList.toggle("sound-off");
}

// функция отключения звука
scoreboardSoundImg.addEventListener('click', soundOff);
function soundOff () {
    touchAudio.volume = 0;
    goalAudio.volume = 0;
    winAudio.volume = 0;
    scoreboardSoundImg.removeEventListener('click', soundOff);
    scoreboardSoundImg.addEventListener('click', soundOn);
}
function soundOn () {
    touchAudio.volume = 1;
    goalAudio.volume = 1;
    winAudio.volume = 1;
    scoreboardSoundImg.removeEventListener('click', soundOn);
    scoreboardSoundImg.addEventListener('click', soundOff);
}

// ... имя игрока справа, его текущее количество голов:

const scoreboardPlayerRight = document.createElement("div");
const rightPlayerName = document.createElement("p");
rightPlayerName.setAttribute("id", "rightPlayerName");
scoreboardPlayerRight.append(rightPlayerName);
const rightPlayerCount = document.createElement("p");
rightPlayerCount.setAttribute("id", "rightPlayerCount");
scoreboardPlayerRight.append(rightPlayerCount);
scoreboard.append(scoreboardPlayerRight);

// Задание начального счёта:

let countLeft = 0;
let countRight = 0;

// Задание  размеров холста и поля: 

let canvasWidth = 1280;
let canvasHeight = canvasWidth*2/5;

let fieldWidth = canvasWidth/4*3;
let fieldHeight = canvasHeight/20*19;

let areaH = {
    leftSide: (canvasWidth - fieldWidth)/2,
    rightSide: (canvasWidth - fieldWidth)/2 + fieldWidth,
    height: (canvasHeight - fieldHeight)/2 + fieldHeight,
    floor: (canvasHeight - fieldHeight)/2,
    centerLine: canvasWidth/2,
};

// Задание ширины ворот и положения штанг:

let targetWidth = fieldWidth/25;
let targetHeight = fieldHeight/3;

let highPost = canvasHeight/2 - targetHeight/2;
let lowPost = canvasHeight/2 + targetHeight/2;

// Задание размеров штрафной:

let boxWidth = fieldWidth/8;
let boxHeight = fieldHeight*3/5;

// Задание характеристик и расположения вратарей:

let gkWidth = targetWidth;
let gkHeight = targetHeight/4;

let gkLeftPosY = canvasHeight/2 - gkHeight/2;
let gkRightPosY = canvasHeight/2 - gkHeight/2; 

// Задание характеристик и расположения полевых игроков:

let playersRadius = fieldWidth/25;

let leftPlayerPosX = canvasWidth/2 - fieldWidth/4;
let leftPlayerPosY = canvasHeight/2;

let rightPlayerPosX = canvasWidth/2 + fieldWidth/4;
let rightPlayerPosY = canvasHeight/2;

// Задание характеристик мяча:

let ball = {
    radius: playersRadius/4,
    posX: canvasWidth/2,
    posY: canvasHeight/2,
    frictK: 0.998,
    speedX: 0,
    speedY: 0,
};
    
//  Создание полотна канвас

const canvas = document.createElement("canvas");
canvas.setAttribute("id", "canvas");
gamePage.append(canvas);

const field = document.getElementById("canvas");
const ctx = field.getContext("2d");

// Создание блоков с анимированными игроками: 

const PlayerLeft = document.createElement("div");
PlayerLeft.classList.add('left-player');
gamePage.append(PlayerLeft);

const PlayerRight = document.createElement("div");
PlayerRight.classList.add('right-player');
gamePage.append(PlayerRight);

// Запуск анимации:

// Переменная для последующей остановки анимации:
let forAnimation = true;

let timer = requestAnimationFrame(game);

// Отрисовка всех элементов поля и игроков:

function playGround () {

    // Заполнение табло

    leftPlayerName.innerHTML = `${options['nameLeft']}`;
    leftPlayerCount.innerHTML = `${countLeft}`;

    if (options['pointsToWin'] === '1') {
        goalsNeedToWin.innerHTML = `Игра ведётся до ${options['pointsToWin']} очка`
    } else {
        goalsNeedToWin.innerHTML = `Игра ведётся до ${options['pointsToWin']} очков`
    }

    rightPlayerName.innerHTML = `${options['nameRight']}`;
    rightPlayerCount.innerHTML = `${countRight}`;

    // Полотно канвас:

    canvas.setAttribute("width", canvasWidth);
    canvas.setAttribute("height", canvasHeight);

    ctx.fillStyle = "LightGray";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);      
    ctx.fill();

    // Рисуем поле и контур:

    fieldWidth = canvasWidth/4*3;
    fieldHeight = canvasHeight/20*19;

    // контуры поля:
    
    ctx.fillStyle = "green";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.fillRect((canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2, fieldWidth, fieldHeight);      
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeRect((canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2, fieldWidth, fieldHeight); 
    ctx.closePath();

    // рисуем ворота:

    ctx.fillStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.fillRect((canvasWidth - fieldWidth)/2 - targetWidth, (canvasHeight - fieldHeight)/2 + targetHeight, targetWidth, targetHeight);      
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.fillRect((canvasWidth - fieldWidth)/2 + fieldWidth, (canvasHeight - fieldHeight)/2 + targetHeight, targetWidth, targetHeight);      
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo((canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2 + targetHeight);
    ctx.lineTo((canvasWidth - fieldWidth)/2 - targetWidth, (canvasHeight - fieldHeight)/2 + targetHeight);
    ctx.lineTo((canvasWidth - fieldWidth)/2 - targetWidth, (canvasHeight - fieldHeight)/2 + 2*targetHeight);
    ctx.lineTo((canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2 + 2*targetHeight);
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(canvasWidth/2 + fieldWidth/2, (canvasHeight - fieldHeight)/2 + targetHeight);
    ctx.lineTo(canvasWidth/2 + fieldWidth/2 + targetWidth, (canvasHeight - fieldHeight)/2 + targetHeight);
    ctx.lineTo(canvasWidth/2 + fieldWidth/2 + targetWidth, (canvasHeight - fieldHeight)/2 + 2*targetHeight);
    ctx.lineTo(canvasWidth/2 + fieldWidth/2, (canvasHeight - fieldHeight)/2 + 2*targetHeight);
    ctx.stroke();

    // разметка поля:
    // центральная линия:

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(canvasWidth/2, (canvasHeight - fieldHeight)/2);
    ctx.lineTo(canvasWidth/2, canvasHeight - (canvasHeight - fieldHeight)/2);
    ctx.stroke();

    // центральный круг и центральная точка:

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(canvasWidth/2, canvasHeight/2, fieldWidth/10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(canvasWidth/2, canvasHeight/2, fieldWidth/200, 0, 2 * Math.PI);
    ctx.fill();

    // штрафные площади:

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeRect((canvasWidth - fieldWidth)/2, (canvasHeight/2 - fieldHeight/2) + fieldHeight/5, boxWidth, boxHeight); 
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeRect((canvasWidth - fieldWidth)/2 + fieldWidth - boxWidth, (canvasHeight/2 - fieldHeight/2) + fieldHeight/5, boxWidth, boxHeight); 
    ctx.closePath();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(canvasWidth - (canvasWidth - fieldWidth)/2 - boxWidth, canvasHeight/2, boxWidth/2, Math.PI/2, Math.PI*3/2);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc((canvasWidth - fieldWidth)/2 + boxWidth, canvasHeight/2, boxWidth/2,  Math.PI*3/2, Math.PI/2);
    ctx.stroke();

    // круги угловых:

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc((canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2, fieldWidth/50,  0, Math.PI/2);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(canvasWidth - (canvasWidth - fieldWidth)/2, (canvasHeight - fieldHeight)/2, fieldWidth/50,  Math.PI/2, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc((canvasWidth - fieldWidth)/2, canvasHeight - (canvasHeight - fieldHeight)/2, fieldWidth/50,  Math.PI*3/2, 0);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc(canvasWidth - (canvasWidth - fieldWidth)/2, canvasHeight - (canvasHeight - fieldHeight)/2, fieldWidth/50,  Math.PI, Math.PI*3/2);
    ctx.stroke();

    // точки пенальти:

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc((canvasWidth - fieldWidth)/2 + boxWidth/2, canvasHeight/2, fieldWidth/400, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.arc((canvasWidth - fieldWidth)/2 + fieldWidth - boxWidth/2, canvasHeight/2, fieldWidth/400, 0, 2 * Math.PI);
    ctx.stroke();

    // вратари:

    // Вратари всегда находятся на одной и той же координате Х и двигаются только вдоль линии ворот:

    const gkLeftPosX = (canvasWidth - fieldWidth)/2 - gkWidth;
    const gkRightPosX = (canvasWidth - fieldWidth)/2 + fieldWidth;
    
    const gkImageLeft = new Image();
    gkImageLeft.src = 'img/gkleft.png';
    ctx.drawImage(gkImageLeft, gkLeftPosX, gkLeftPosY, gkWidth, gkHeight);

    const gkImageRight = new Image();
    gkImageRight.src = 'img/gkright.png';
    ctx.drawImage(gkImageRight, gkRightPosX, gkRightPosY, gkWidth, gkHeight);

    // полевые игроки
        
    PlayerLeft.style.cssText += `left: ${leftPlayerPosX - playersRadius}px`;
    PlayerLeft.style.cssText += `top: ${leftPlayerPosY - playersRadius + scoreboardHeight}px`;
    PlayerLeft.style.cssText += `width: ${2*playersRadius}px`;
    PlayerLeft.style.cssText += `height: ${2*playersRadius}px`;

    PlayerRight.style.cssText += `left: ${rightPlayerPosX - playersRadius}px`;
    PlayerRight.style.cssText += `top: ${rightPlayerPosY - playersRadius + scoreboardHeight}px`;
    PlayerRight.style.cssText += `width: ${2*playersRadius}px`;
    PlayerRight.style.cssText += `height: ${2*playersRadius}px`;

    // мяч

    const ballImg = new Image();
    ballImg.src = 'img/ball.png';
    ctx.drawImage(ballImg, ball.posX - ball.radius, ball.posY - ball.radius, ball.radius*2, ball.radius*2);
}
    
// Функция присвоения классов для анимации движения игрока1:
function isRunLeft(direction) {
    if (direction !== 0) {
        PlayerLeft.classList.add("run-player");
    if (direction === 'runLeft') {
        PlayerLeft.classList.add("left");
    } 
    if (direction === 'runUp') {
        PlayerLeft.classList.add("up");
    }
    if (direction === 'runDown') {
        PlayerLeft.classList.add("down");
    }
    } else {
        PlayerLeft.className = "left-player";
    }
}

document.addEventListener("keyup", function(event) {
    isRunLeft(0);
});

// скорость движения игроков

let playersSpeed = 3;


let timer1;
let timer2;

//  Привязка кнопок управления игрока 1

function downPlayer1 () {
    if (leftPlayerPosY < areaH.height - playersRadius) {
        leftPlayerPosY += playersSpeed;
        timer1 = setTimeout (downPlayer1, 0);
    } else {
        leftPlayerPosY = areaH.height - playersRadius;  
        clearTimeout(timer1);   
    }
}

document.addEventListener ('keydown', player1MoveDown);
function player1MoveDown (event) {
    event.preventDefault();
    if (event.code === 'KeyS') {
        isRunLeft('runDown');
        window.requestAnimationFrame(downPlayer1);
    }
    document.addEventListener ('keyup', player1MoveDown);
    function player1MoveDown (event) {
        event.preventDefault();
        if (event.code === 'KeyS') {
        clearTimeout(timer1);
        window.cancelAnimationFrame(downPlayer1);
        }
    }
}

function upPlayer1 () {
    if (leftPlayerPosY > areaH.floor + playersRadius) {
        leftPlayerPosY += -playersSpeed;
        timer1 = setTimeout (upPlayer1, 0);
    } else {
        leftPlayerPosY = areaH.floor + playersRadius; 
        clearTimeout(timer1);
    }
}

document.addEventListener ('keydown', player1MoveUp);
function player1MoveUp (event) {
    event.preventDefault();
    if (event.code === 'KeyW') {
        isRunLeft('runUp');
        window.requestAnimationFrame(upPlayer1)
    }
    document.addEventListener ('keyup', player1MoveUp);
    function player1MoveUp (event) {
        event.preventDefault();
        if (event.code === 'KeyW') {
            clearTimeout(timer1);
            window.cancelAnimationFrame(upPlayer1);
        }
    }
}

function leftPlayer1 () {
    if (leftPlayerPosX > areaH.leftSide + playersRadius) {
        leftPlayerPosX += -playersSpeed;
        timer1 = setTimeout (leftPlayer1, 0);
    } else {
        leftPlayerPosX = areaH.leftSide + playersRadius; 
        clearTimeout(timer1);
    }
}

document.addEventListener ('keydown', player1MoveLeft);
function player1MoveLeft (event) {
    event.preventDefault();
    if (event.code === 'KeyA') {
        isRunLeft('runLeft');
        window.requestAnimationFrame(leftPlayer1)
    }
    document.addEventListener ('keyup', player1MoveLeft);
    function player1MoveLeft (event) {
        event.preventDefault();
        if (event.code === 'KeyA') {
            clearTimeout(timer1);
            window.cancelAnimationFrame(leftPlayer1)
        }
    }
}

function rightPlayer1 () {
    if (leftPlayerPosX < areaH.centerLine - playersRadius) {
        leftPlayerPosX += playersSpeed;
        timer1 = setTimeout (rightPlayer1, 0);
    } else {
        leftPlayerPosX = areaH.centerLine - playersRadius; 
        clearTimeout(timer1);
    }
}

document.addEventListener ('keydown', player1MoveRight);
function player1MoveRight (event) {
    event.preventDefault();
    if (event.code === 'KeyD') {
        isRunLeft('runRight');
        window.requestAnimationFrame(rightPlayer1)
    }
    document.addEventListener ('keyup', player1MoveRight);
    function player1MoveRight (event) {
        event.preventDefault();
        if (event.code === 'KeyD') {
            clearTimeout(timer1);
            window.cancelAnimationFrame(rightPlayer1)
        }
    }
}

// Функция присвоения классов для анимации движения игрока 2:

function isRunRight(direction) {
    if (direction !== 0) {
        PlayerRight.classList.add("run-player");
        if (direction === 'runRight') {
        PlayerRight.classList.add("right");
        } 
        if (direction === 'runUp') {
        PlayerRight.classList.add("up");
        }
        if (direction === 'runDown') {
        PlayerRight.classList.add("down");
        }
    } else {
        PlayerRight.className = "right-player";
    }
}

document.addEventListener("keyup", function(event) {
    isRunRight(0);
});

//  Привязка кнопок управления игрока 2

function downPlayer2 () {
    if (rightPlayerPosY < areaH.height - playersRadius) {
        rightPlayerPosY += playersSpeed;
        timer2 = setTimeout (downPlayer2, 0);
    } else {
        rightPlayerPosY = areaH.height - playersRadius;  
        clearTimeout(timer2);   
    }
}

document.addEventListener ('keydown', player2MoveDown);
function player2MoveDown (event) {
    event.preventDefault();
    if (event.code == 'ArrowDown') {
        isRunRight('runDown');
        window.requestAnimationFrame(downPlayer2);
    }
    document.addEventListener ('keyup', player2MoveDown);
    function player2MoveDown (event) {
        event.preventDefault();
        if (event.code == 'ArrowDown') {
        clearTimeout(timer2);
        window.cancelAnimationFrame(downPlayer2);
        }
    }
}

function upPlayer2 () {
    if (rightPlayerPosY > areaH.floor + playersRadius) {
        rightPlayerPosY += -playersSpeed;
        timer2 = setTimeout (upPlayer2, 0);
    } else {
        rightPlayerPosY = areaH.floor + playersRadius; 
        clearTimeout(timer2);
    }
}

document.addEventListener ('keydown', player2MoveUp);
function player2MoveUp (event) {
    event.preventDefault();
    if (event.code == 'ArrowUp') {
        isRunRight('runUp');
        window.requestAnimationFrame(upPlayer2)
    }
    document.addEventListener ('keyup', player2MoveUp);
    function player2MoveUp (event) {
        event.preventDefault();
        if (event.code == 'ArrowUp') {
            clearTimeout(timer2);
            window.cancelAnimationFrame(upPlayer2)
        }
    }
}

function leftPlayer2 () {
    if (rightPlayerPosX > areaH.centerLine + playersRadius) {
        rightPlayerPosX += -playersSpeed;
        timer2 = setTimeout (leftPlayer2, 0);
    } else {
        rightPlayerPosX = areaH.centerLine + playersRadius; 
        clearTimeout(timer2);
    }
}

document.addEventListener ('keydown', player2MoveLeft);
function player2MoveLeft (event) {
    event.preventDefault();
    if (event.code == 'ArrowLeft') {
        isRunRight('runLeft');
        window.requestAnimationFrame(leftPlayer2)
    }
    document.addEventListener ('keyup', player2MoveLeft);
    function player2MoveLeft (event) {
        event.preventDefault();
        if (event.code == 'ArrowLeft') {
            clearTimeout(timer2);
            window.cancelAnimationFrame(leftPlayer2)
        }
    }
}

function rightPlayer2 () {
    if (rightPlayerPosX < areaH.rightSide - playersRadius) {
        rightPlayerPosX += playersSpeed;
        timer2 = setTimeout (rightPlayer2, 0);
    } else {
        rightPlayerPosX = areaH.rightSide - playersRadius; 
        clearTimeout(timer2);
    }
}

document.addEventListener ('keydown', player2MoveRight);
function player2MoveRight (event) {
    event.preventDefault();
    if (event.code == 'ArrowRight') {
        isRunRight('runRight');
        window.requestAnimationFrame(rightPlayer2)
    }
    document.addEventListener ('keyup', player2MoveRight);
    function player2MoveRight (event) {
        event.preventDefault();
        if (event.code == 'ArrowRight') {
            clearTimeout(timer2);
            window.cancelAnimationFrame(rightPlayer2)
        }
    }
}

// Задание скорости перемещения вратарей

let gkLeftSpeed = 0.5;
let gkRightSpeed = -0.5; 

// Описание логики движения объектов

function game () {

    gkLeftPosY += gkLeftSpeed;
    gkRightPosY += gkRightSpeed; 

    ball.speedY = ball.speedY * ball.frictK;
    ball.speedX = ball.speedX * ball.frictK;

    ball.posX += ball.speedX;
    ball.posY += ball.speedY;


    // Коэффициент для увеличения скорости движения мяча:

    let speedK = 5;

    // движение вратарей от штанги к штанге

    if (((gkLeftPosY + gkHeight) >= lowPost) || (gkLeftPosY <= highPost)) {
        gkLeftSpeed = -gkLeftSpeed;
        if ((gkLeftPosY + gkHeight - lowPost) > Math.abs(gkLeftSpeed) || (highPost - gkLeftPosY) > Math.abs(gkLeftSpeed)) {
            gkLeftPosY = canvasHeight/2;
        }
    }
    if (((gkRightPosY + gkHeight) >= lowPost) || (gkRightPosY <= highPost)) {
        gkRightSpeed = -gkRightSpeed;
        if ((gkRightPosY + gkHeight - lowPost) > Math.abs(gkRightSpeed) || (highPost - gkRightPosY) > Math.abs(gkRightSpeed)) {
            gkRightPosY = canvasHeight/2;
        }
    }

    // описание момента соприкосновения игроков и мяча

    let touchRight = Math.sqrt(Math.pow((rightPlayerPosX - ball.posX), 2) + Math.pow((rightPlayerPosY - ball.posY), 2));
    
    if  (touchRight <= (ball.radius + playersRadius)) {
        if (rightPlayerPosX > ball.posX) {
            ball.speedX = - speedK*playersSpeed * (Math.abs(rightPlayerPosX - ball.posX) / touchRight);
        } else {
            ball.speedX = speedK*playersSpeed * (Math.abs(rightPlayerPosX - ball.posX) / touchRight);
        }
        if (rightPlayerPosY > ball.posY) {
            ball.speedY = - speedK*playersSpeed * (Math.abs(rightPlayerPosY - ball.posY) / touchRight);
        } else {
            ball.speedY = speedK*playersSpeed * (Math.abs(rightPlayerPosY - ball.posY) / touchRight);
        }
        touchSound();
    }

    let touchLeft = Math.sqrt(Math.pow((leftPlayerPosX - ball.posX), 2) + Math.pow((leftPlayerPosY - ball.posY), 2));
    if  (touchLeft <= (ball.radius + playersRadius)) {
        if (leftPlayerPosX > ball.posX) {
            ball.speedX = - speedK*playersSpeed * (Math.abs(leftPlayerPosX - ball.posX) / touchLeft);
        } else {
            ball.speedX = speedK*playersSpeed * (Math.abs(leftPlayerPosX - ball.posX) / touchLeft);
        }
        if (leftPlayerPosY > ball.posY) {
            ball.speedY = - speedK * playersSpeed * (Math.abs(leftPlayerPosY - ball.posY) / touchLeft);
        } else {
            ball.speedY = speedK*playersSpeed * (Math.abs(leftPlayerPosY - ball.posY) / touchLeft);
        }
        touchSound();
    }
    
    // описание поведения мяча 

    if (ball.posX + ball.radius >= areaH.rightSide) {
        // При попадании в лицевую линию или во вратаря (применён коэффициент 1,2 для более реалистичной отрисовки) мяч отскакивает обратно в поле
        if ((ball.posY >= lowPost) || (ball.posY  <= highPost) || ((ball.posY <= gkRightPosY + gkHeight*1.2) && (ball.posY >= gkRightPosY - gkHeight*0.2))) {
            ball.posX = areaH.rightSide - ball.radius;
            ball.speedX = -ball.speedX;
        } else {
            // Иначе - засчитывается гол, игра останавливается
            if (ball.posX - ball.radius > areaH.rightSide) {
                ball.speedX = 0;
                ball.speedY = 0;
                ball.posX = areaH.rightSide + ball.radius;
                countLeft++;
                addButtonsBlock();
                goalSound();
                goalCelebrating();
                if (countLeft < options['pointsToWin']) {
                    setTimeout(newPoint, 2000);
                } else {
                    setTimeout(winSound, 3000);
                    checkUserInStatsIfWinLeft();
                    setTimeout(congratulations, 3000, options['nameLeft']);
                }
            }
        }
    } 

    /* Функция для проверки наличия игроков в базе данных, включающая в себя функции добавление итогов матча в статистику игроков
    при условии победы игрока 1*/

    checkUserInStatsIfWinLeft = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
          let userList = snapshot.val();
          if (options['nameLeft'] in userList) {
            addStatsPlayerLeftIfWinLeft();
        } else {
            createStatsPlayerLeftIfWinLeft();
        }
        if (options['nameRight'] in userList) {
            addStatsPlayerRightIfWinLeft();
        } else {
            createStatsPlayerRightIfWinLeft();
        }
        })
    }

    // функции обновления и создания статистики игроков 
    addStatsPlayerLeftIfWinLeft = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
        let userList = snapshot.val();
        myAppDB
        .ref("users/" + `${options['nameLeft']}`)
        .set({
            Игры: +(userList[options['nameLeft']]['Игры']) + 1,
            Победы: +(userList[options['nameLeft']]['Победы']) + 1,
            Поражения: +(userList[options['nameLeft']]['Поражения']),
            Забито: +(userList[options['nameLeft']]['Забито']) + countLeft,
            Пропущено: +(userList[options['nameLeft']]['Пропущено']) + countRight,
        })  
    })          
    }

    addStatsPlayerRightIfWinLeft = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
        let userList = snapshot.val();
        myAppDB
        .ref("users/" + `${options['nameRight']}`)
        .set({
            Игры: +(userList[options['nameRight']]['Игры']) + 1,
            Победы: +(userList[options['nameRight']]['Победы']),
            Поражения: +(userList[options['nameRight']]['Поражения']) + 1,
            Забито: +(userList[options['nameRight']]['Забито']) + countRight,
            Пропущено: +(userList[options['nameRight']]['Пропущено']) + countLeft,
        }) 
    })           
    }

    createStatsPlayerLeftIfWinLeft = function () {
        myAppDB
        .ref("users/" + `${options['nameLeft']}`)
            .set({
            Игры: 1,
            Победы: 1,
            Поражения: 0,
            Забито: `${countLeft}`,
            Пропущено: `${countRight}` 
        })
    }

    createStatsPlayerRightIfWinLeft = function () {
        myAppDB
        .ref("users/" + `${options['nameRight']}`)
        .set({
            Игры: 1,
            Победы: 0,
            Поражения: 1,
            Забито: `${countRight}`,
            Пропущено: `${countLeft}` 
        })
    }


    if (ball.posX - ball.radius <= areaH.leftSide) {
    // При попадании в лицевую линию или во вратаря (применён коэффициент 1,2 для более реалистичной отрисовки) мяч отскакивает обратно в поле
        if ((ball.posY >= lowPost) || (ball.posY  <= highPost) || ((ball.posY <= gkLeftPosY + gkHeight*1.2) && (ball.posY >= gkLeftPosY - gkHeight*0.2))) {
            if (ball.posX - ball.radius <= areaH.leftSide) {
                ball.posX - 2*ball.radius <= areaH.leftSide;
            }
            ball.speedX = -ball.speedX;
        } else {
            // Иначе - засчитывается гол, игра останавливается
            if (ball.posX + ball.radius < areaH.leftSide) {
                ball.speedX = 0;
                ball.speedY = 0;
                ball.posX = areaH.leftSide - ball.radius;
                countRight++;
                addButtonsBlock();
                goalSound();
                goalCelebrating();
                if (countRight < options['pointsToWin']) {
                    setTimeout(newPoint, 2000);
                } else {
                    setTimeout(winSound, 3000);
                    checkUserInStatsIfWinRight();
                    setTimeout(congratulations, 3000, options['nameRight']);
                }
            }
        }
    }

    /* Функция для проверки наличия игроков в базе данных, включающая в себя функции добавление итогов матча в статистику игроков
    при условии победы игрока 2*/

    checkUserInStatsIfWinRight = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
          let userList = snapshot.val();
          if (options['nameLeft'] in userList) {
            addStatsPlayerLeftIfWinRight();
        } else {
            createStatsPlayerLeftIfWinRight();
        }
        if (options['nameRight'] in userList) {
            addStatsPlayerRightIfWinRight();
        } else {
            createStatsPlayerRightIfWinRight();
        }
        })
    }

    // функции обновления и создания статистики игроков:

    addStatsPlayerLeftIfWinRight = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
            let userList = snapshot.val();
            myAppDB
            .ref("users/" + `${options['nameLeft']}`)
            .set({
                Игры: +(userList[options['nameLeft']]['Игры']) + 1,
                Победы: +(userList[options['nameLeft']]['Победы']),
                Поражения: +(userList[options['nameLeft']]['Поражения']) + 1,
                Забито: +(userList[options['nameLeft']]['Забито']) + countLeft,
                Пропущено: +(userList[options['nameLeft']]['Пропущено']) + countRight,
            })      
        })      
    }

    addStatsPlayerRightIfWinRight = function () {
        myAppDB
        .ref("users/")
        .once("value")
        .then(function (snapshot) {
        let userList = snapshot.val();
        myAppDB
        .ref("users/" + `${options['nameRight']}`)
        .set({
            Игры: +(userList[options['nameRight']]['Игры']) + 1,
            Победы: +(userList[options['nameRight']]['Победы']) + 1,
            Поражения: +(userList[options['nameRight']]['Поражения']),
            Забито: +(userList[options['nameRight']]['Забито']) + countRight,
            Пропущено: +(userList[options['nameRight']]['Пропущено']) + countLeft,
        })       
    })     
    }

    createStatsPlayerLeftIfWinRight = function () {
        myAppDB
        .ref("users/" + `${options['nameLeft']}`)
        .set({
            Игры: 1,
            Победы: 0,
            Поражения: 1,
            Забито: `${countLeft}`,
            Пропущено: `${countRight}` 
        })
    }

    createStatsPlayerRightIfWinRight = function () {
        myAppDB
        .ref("users/" + `${options['nameRight']}`)
        .set({
            Игры: 1,
            Победы: 1,
            Поражения: 0,
            Забито: `${countRight}`,
            Пропущено: `${countLeft}` 
        })
    }


    // Описание контакта мяча с боковыми линиями
    if (ball.posY - ball.radius <= areaH.floor) {
        ball.posY = ball.posY + ball.radius;
        ball.speedY = -ball.speedY;
    }

    if (ball.posY + ball.radius >= areaH.height) {
        ball.posY = ball.posY - ball.radius;
        ball.speedY = -ball.speedY;
    }

    
    playGround();
    if (forAnimation) {
        timer = requestAnimationFrame(game);
    }
}

// функция блокировки клавиш на время пауз: 

function addButtonsBlock () {
    document.removeEventListener ('keydown', player1MoveUp);
    document.removeEventListener ('keydown', player1MoveDown);
    document.removeEventListener ('keydown', player1MoveRight);
    document.removeEventListener ('keydown', player1MoveLeft);
    document.removeEventListener ('keydown', player2MoveUp);
    document.removeEventListener ('keydown', player2MoveDown);
    document.removeEventListener ('keydown', player2MoveRight);
    document.removeEventListener ('keydown', player2MoveLeft);
}

// функция разблокировки клавиш: 

function removeButtonsBlock () {
    document.addEventListener ('keydown', player1MoveUp);
    document.addEventListener ('keydown', player1MoveDown);
    document.addEventListener ('keydown', player1MoveRight);
    document.addEventListener ('keydown', player1MoveLeft);
    document.addEventListener ('keydown', player2MoveUp);
    document.addEventListener ('keydown', player2MoveDown);
    document.addEventListener ('keydown', player2MoveRight);
    document.addEventListener ('keydown', player2MoveLeft);
}

// Переменные для фиксирования скорости и направления мяча при нажатии на паузу
let stopSpeedBallX;
let stopSpeedBallY;


// функция паузы при нажатии на Esc
function stopEsc (e) {
    e.preventDefault();
    if (e.code === 'Escape') {
        stop();
        document.removeEventListener ('keydown', stopEsc);
        document.addEventListener ('keydown', resume);
    }
}


// функция паузы:
function stop () {
    addButtonsBlock();
    pauseBtn.innerHTML = 'Resume Game';
    stopSpeedBallX = ball.speedX;
    stopSpeedBallY = ball.speedY;
    ball.speedX = 0;
    ball.speedY = 0;
    gkLeftSpeed = 0;
    gkRightSpeed = 0;

    document.removeEventListener ('keydown', stopEsc);
    pauseBtn.removeEventListener('click', stop);
    document.addEventListener ('keydown', resume);
    pauseBtn.addEventListener ('click', resume);
}

// функция продолжения игры:
function resume () {
    removeButtonsBlock();
    ball.speedX = stopSpeedBallX;
    ball.speedY = stopSpeedBallY;
    gkLeftSpeed = 0.5;
    gkRightSpeed = -0.5; 
    pauseBtn.innerHTML = 'Pause';
    document.removeEventListener ('keydown', resume);
    pauseBtn.removeEventListener('click', resume);
    pauseBtn.addEventListener('click', stop);
    document.addEventListener ('keydown', stopEsc);
}

document.addEventListener ('keydown', stopEsc);
pauseBtn.addEventListener('click', stop);

// Новый розыгрыш после забитого гола: 
function newPoint () {
    leftPlayerPosX = canvasWidth/2 - fieldWidth/4;
    leftPlayerPosY = canvasHeight/2;

    rightPlayerPosX = canvasWidth/2 + fieldWidth/4;
    rightPlayerPosY = canvasHeight/2;
    
    ball.speedX = 0;
    ball.speedY = 0;
    ball.posX = canvasWidth/2;
    ball.posY = canvasHeight/2;

    const newPoint = document.createElement("div");
    newPoint.setAttribute("id", "count");
    newPoint.classList.add('countdown');
    newPoint.classList.add('message');
    newPoint.style.cssText += `font-size: ${canvasWidth/5}px`;
    gamePage.append(newPoint);
    for (let i = 3; i >= 1; i--) {
        setTimeout(() => {newPoint.innerHTML = `${i}`}, (3-i)*1000);
    }
    setTimeout(() => {newPoint.remove();
        removeButtonsBlock();
    }, 3000);
}

function goalCelebrating () {
    const goal = document.createElement("img");
    goal.setAttribute("id", "goal");
    goal.setAttribute("src", "img/goal.png");
    goal.style.cssText += `max-width: ${canvasWidth/4}px`;
    goal.style.cssText += `left: ${canvasWidth*3/8}px`;
    goal.style.cssText += `top: ${canvasHeight*2/5}px`; 
    gamePage.append(goal);
    setTimeout(() => {goal.remove()}, 2000);
}

// Функция поздравления победителя в конце игры:
function congratulations (winner) {
    const congrats = document.createElement("div");
    congrats.setAttribute("id", "winner");
    congrats.classList.add('countdown');
    const congratsText = document.createElement("p");
    congratsText.classList.add('message');
    congratsText.style.cssText += `font-size: ${canvasWidth/25}px`;
    congratsText.innerHTML = `${winner} WIN!!!`;
    congrats.append(congratsText);
    const congratsImg = document.createElement("img");
    congratsImg.setAttribute("id", "congratsImg");
    congratsImg.setAttribute("src", "img/cup.png");
    congrats.append(congratsImg);
    gamePage.append(congrats);
    setTimeout(() => {congrats.remove()}, 4000);
    setTimeout(() => {window.history.back()}, 4000);
}

    function leaveGame (event) {
        event.preventDefault();
        event.returnValue = '';
    }

    window.addEventListener('beforeunload', leaveGame)

    window.addEventListener('hashchange', () => {
        addButtonsBlock();
        forAnimation = false;
        window.removeEventListener('beforeunload', leaveGame);
        document.removeEventListener ('keydown', stopEsc);
        window.removeEventListener('hashchange', backGame);
    });


})();






