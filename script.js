//Globala variabler
var clicked = false;
var numCols = 6;
var numRows = 6;
var selected = [];
var lastSelected = [];
var selectedPositions = [];
var colors = ['lightblue','orange','lightgreen','lightpink'];
var counterStartTime = 30;
var clearTimer;
var score = 0;
var highScore;
var gameOver = false;


/* 
    ======================
    Konstruktor-funktioner
    =======================
*/

//Konstruktor för att skapa upp brickor av span-elementet
//Brick får klassen "brick"
//Färgen på brickan slumpas fram
function Brick(){
    this.brickElement =  document.createElement('span');
    this.brickElement.className="brick";
    
    this.randomColor = function(){
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    this.brickColor = this.randomColor();
    this.brickElement.style.backgroundColor = this.brickColor;
    if(gameOver){
        $(this).addClass('active');
        }
    addEventlistners(this.brickElement);  
}

//Konstruktor för att skapa upp ett radobjekt på spelplanen
function Row(i){
    this.brick = new Brick();
    this.rowElement = document.createElement('div');
    this.rowElement.className= "row-" + i;
    this.rowNumber = i;
}

//Konstruktor för att skapa upp kolumner på spelplanen
function Column(i){
    this.rows = [];
    this.colNumber = i;
    this.colElement = document.createElement('div');
    this.colElement.className= 'col-' + i + ' column';
    //skapa det antal rader i kolumnen som specificeras i numRows variabeln
    for(i=1; i <= numRows; i++){
        row = new Row(i);
        this.rows.push(row); 
        row.rowElement.appendChild(row.brick.brickElement);
        this.colElement.appendChild(row.rowElement);
    }
}

//Konstruktor för att skapa upp spelplanen med kolumner
function GameBoard(){
    this.columns =[];
    this.initGameBoard = function(cont){
        cont.innerHTML = "";
        gameOver = false;
        for(i=1; i <= numCols; i++){
            var col = new Column(i);
            cont.appendChild(col.colElement);
            this.columns.push(col);
        }
    }
}

function Game(){
    this.gb = new GameBoard();
    var container = document.getElementById('gameboard-container');
    this.gb.initGameBoard(container);
    initEvents();
    counterStartTime = 30;
    getHighScore();
    var element = document.getElementById("score");
    element.innerHTML= "0";
    score = 0;   
}

/* 
    ================
       Funktioner
    ================
*/

//Lägger till den valda brickan och kontrollerar att färg och position är ok
function addSelected(currentObj){
    var currentPosition = getCurrentPos($(currentObj).parent()); //Hämta ut på vilken rad och kolumn brickan finns
    var currentColor = $(currentObj).css('background-color'); 
    currentPosition.push(currentColor);  //Lägger till färg på array med positionen
    if (lastSelected.length == 0){
        $(currentObj).addClass('active');
        lastSelected = currentPosition;
        selectedPositions.push(currentPosition);
        selected.push($(currentObj));
    }
    else if(checkCurrentSelectedPosition(currentPosition) && currentColor == lastSelected[2]){
        $(currentObj).addClass('active');
        lastSelected = currentPosition;
        selectedPositions.push(currentPosition);
        selected.push($(currentObj));
    }
}

//kontrollera om positionen i spelplanen för aktuell bricka är ok
function checkCurrentSelectedPosition(currPossition){
    var checked = false;
    var currRow = getNumber(currPossition[0]); 
    var currCol = getNumber(currPossition[1]);
    var lastRow = getNumber(lastSelected[0]);
    var lastCol = getNumber(lastSelected[1]);
    var rowSum = currRow - lastRow;
    var colSum = currCol - lastCol;    
    if (lastRow === currRow){
        if (colSum === -1 || colSum === 1){
            checked = true;
        }
    } else if (lastCol === currCol){
        if (rowSum === -1 || rowSum === 1){
            checked = true;
        }
    }
    return checked;
}

//returnera siffran i css-klassnamnet för rad eller kolumn
function getNumber(currString){
    var parts = currString.split("-");
    return parts[1];
}

// funktion som returnerar rad och kolumn för brickan i parentObj
function getCurrentPos(parentObj){
    var classNames = $(parentObj).attr('class').split(" "); 
    var crow = classNames[0];
    classNames = $(parentObj).parent().attr('class').split(" ");
    var ccol = classNames[0];
    var pos = [crow,ccol];
    return pos;
}

// funktion som raderar alla brickor som är inlagda i arrayen selected
function removeSelected(){
    selected.forEach(function(object){
        object.remove();
        selected =[];
    })
}

//Räknar ut hur många brickor som valts och sparar dessa i en en array
function countSelectedBricks(){
    var colElementNum = [0,0,0,0,0,0]; //byt ut till dynamisk array baserat på längd
    for(i=0; i < selectedPositions.length; i++){
        var col = getNumber(selectedPositions[i][1]) - 1;
        colElementNum[col]++;
    } 
    return colElementNum;
}

//Funktion som skapar en ny bricka
function createNewBrick(){
    var newEl = new Brick();
    return newEl;
}

function moveBricks(columnNo){
    //Flyttar ner brickor efter att valda har tagits bort
    var colId = '.col-' + ++columnNo; //skapar kolumnid där numret från array måste ökas med 1.
    //Loopa igenom alla rader i kolumnen för att hitta en tom bricka att ersätta
    for (i = numRows; i > 0; i--){
        var rowClass= '.row-' + i;
        var currentBrick = $(colId).find(rowClass); //Hämta ut rätt rad-div
        if ($(currentBrick).html() == ""){
            var empty = true;
            //loopa uppåt i raderna för att hitta en bricka att flytta ned;
            for (j = i-1; j > 0; j--){
                var rClass =  '.row-' + j;
                var nextObj = $(colId).find(rClass);
                //kontrollera om brickan ovanför är tom eller ej
                if ($(nextObj).html() != ""){ 
                    empty = false;
                    $(currentBrick).html($(nextObj).html()); //kopiera brickan ovanför till aktuell bricka
                    
                    //Hitta span-objektet så att vi kan lägga på eventlistners
                    var tmpObj = $(currentBrick).find('span');
                        if(gameOver){
                            $(tmpObj).addClass('active'); //om spelet har tagit slut sätt brickan till activ
                        }
                    addEventlistners($(tmpObj)); // lägg eventlyssnare på aktuell bricka
                    $(nextObj).html(""); //radera brickan i den rad som vi kopierade från
                    break;
                }
            }
            // om ingen bricka hittades att kopiera, skapa en ny bricka
            if (empty){
                $(currentBrick).html(createNewBrick().brickElement);
            }
        }
    } 
}

//funktion som kopplar eventlistners till inskickat objekt
function addEventlistners(currElement){
    $(currElement).mousedown(function(){
        clicked = true;
        addSelected(this);
    });
    $(currElement).mousemove(function(){
        if(clicked === false) return;
        addSelected(this);
    });
}

function countDownTime(){
    var timer = document.getElementById("timer");
    timer.innerHTML= counterStartTime;
    if(counterStartTime < 1){
        clearTimeout(clearTimer);
        timer.innerHTML = "0";
        killEvents();
        setHighScore();
        finishOverlay();
    }else{
        counterStartTime --;
        clearTimer = setTimeout(function(){ countDownTime() }, 1000);
    }
}

function finishOverlay(){
    $( "#finished-game-section" ).addClass( "open");
    var scoreResult = document.getElementById("score-result");
    var highScoreResult = document.getElementById("finished-game-high-score");
    scoreResult.innerHTML = score;
    
    if(highScore < score){
        highScore = score;
        highScoreResult.innerHTML = "Congratulations, you have a new high-score of " + highScore + " points!";
    }
    else if(highScore > score){
        highScoreResult.innerHTML = "Sorry, you didn't beat your high-score of " + highScore + " points this time..."
    }
    else if(highScore == score){
        highScoreResult.innerHTML = "Ohhh, almost a new high-score." 
    }
}

// räknar upp poängen
function countScore(){
    score += selected.length;
    var element = document.getElementById("score");
    element.innerHTML= score;
}

//sparar värdet från score-variabeln i propertyn high-score i localStorage-objektet
function setHighScore(){
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("high-score") < score){
            localStorage.setItem("high-score", score);
        }
    }
}

//hämtar värdet från localStoage-objektet och sparar det i en variabel
function getHighScore(){
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("high-score") && localStorage.getItem("high-score") !== null){
            highScore = localStorage.getItem("high-score");
        }
        else{
            highScore = 0;
        }
    }
}

//förhindrar mouse-events 
function killEvents(){
    $('.brick').off("mousedown mouseover");
    $('#game-board-section').off("mouseup");
    $('.brick').addClass('active');
    gameOver = true;
}


/* 
    ==================
    JQuery-events 
    ==================
*/
function initEvents(){
    //När musknappen trycks ner sätts clicked till true
    //Funktionen addSelected anropas med elementet vi klickat på som argument
    $('.brick').mousedown(function(){
        clicked = true;
        addSelected(this);
    });

    //När musen förs över ett brick-element kontrolleras om clicked är false. Är det sant returneras man från funktionen.
    //Är clicked true anropas addSelected med elementet vi dragit över som argument.
    $('.brick').mouseover(function(){
        if(clicked === false){
            return;
        }

        addSelected(this);
    });

   //När musknappen släpps över ett element kontrolleras om arrayen selected innehåller endast ett element, isf tas activeclassen bort och arrayen töms.
    //Annars anropas funktionen removeSelected och arrayen lastSelected töms.
    //clicked sätts till false igen och arrayen lastSelected töms.
    $('#game-board-section').mouseup(function(){
        if (!gameOver){
            if (selected.length == 1){
                selected[0].removeClass('active');
                selected = [];
            }else {
                countScore();
                removeSelected();
            }
            clicked = false;
            lastSelected = [];
            var sel = countSelectedBricks();
            var i = 0
            for (i=0; i < sel.length; i++){
                if (sel[i] > 0) {
                    moveBricks(i);
                }
            }
        }
    });                   
}

$( "#start-game-btn" ).click(function() {
    $( "#start-game-section").removeClass( "open");
    countDownTime();
});

$( "#new-game-btn" ).click(function() {
    $( "#finished-game-section").removeClass( "open");
    game= new Game();
    countDownTime();
});



var game= new Game();
document.getElementById("start-game-high-score").innerHTML = highScore;













