/*
Author: Alexander H. Agno II
*/
"use strict";
const gameDiv = document.getElementById("game");
let gameHeight;
let gameWidth;

const MATCH_THREE_ATLAS = "assets/match_three_atlas.json";
const ASSET_BG ="asset_bg.png";
const ASSET_BUTTON_DOWN = "asset_button_down.png";
const ASSET_BUTTON_UP = "asset_button_up.png";
const ASSET_GAMEOVER_POPUP = "asset_gameover_popup.png";
const ASSET_GEM = "asset_gem";
const ASSET_LARGE_BTN_DOWN = "asset_large_btn_down.png";
const ASSET_LARGE_BTN_UP = "asset_large_btn_up.png";
const ASSET_PAUSE_MENU = "asset_pause_menu.png";
const ASSET_PAUSE_UP = "asset_pause_up.png";
const ASSET_PAUSE_DOWN = "asset_pause_down.png";
const ASSET_TITLE = "asset_title.png";
const ASSET_TITLE_BG = "asset_title_bg.png";
const ASSET_FILE_TYPE = ".png";
const ASSET_CONTAINER = "assets/container.png"

const SPRITE_OFF_SET = 1000;
const BOARD_SIZE = 8;
const SCORE_DEFAULT = 100;

let app = new PIXI.Application({ 
    width: 800, 
    height: 800,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

let state,
    id;

//title
let titleScene,
    titleBG,
    titleLogo,
    largeButton,
    largeButtonGroup;

//play
let playScene,
    playBG,
    pauseBtn,
    pauseMenu,
    scoreVal,
    timeVal,
    blackBackground,
    pauseContainer,
    resumeBtn,
    restartBtn,
    quitBtn,
    timeContainer,
    scoreContainer;

//
let board,// contains the gem
    gemContainer = [],
    clickContainer = [];//remembers which gem you've clicked 

let verticalGem = [],
    horizontalGem = [];
    

//end
let endScene,
    endRestartBtn,
    endQuitBtn,
    endScoreVal,
    endGameMenu,
    endGameContainer;

//timer
let currentScore = 0;
let time = 60;
let ctr = 0;
let timerOn = false;
let timesUp = false;
let restart = false;


let moves = [];
let clusters = [];
let allowScore = false;



let charm = new Charm();

gameDiv.appendChild(app.view);
PIXI.loader
.add([MATCH_THREE_ATLAS, ASSET_CONTAINER])
.load(setup);

function setup() {
    id = PIXI.loader.resources[MATCH_THREE_ATLAS].textures; 
    gameHeight = id[ASSET_TITLE_BG].orig.height;
    gameWidth = id[ASSET_TITLE_BG].orig.width;
//    console.log("Height: " + gameHeight)
//    console.log("Width: " + gameWidth)
    app.renderer.autoResize = true;
    app.renderer.resize(gameWidth, gameHeight);

    
    initializeTitle();
    initializePlay();
    initializeEnd();
    
    state = title;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

    state();
    charm.update();
}

function title(){
    if(titleScene.visible == false) {
        titleScene.visible = true;
        
        charm.fadeIn(titleScene, 30).onComplete = () => 
        charm.scale(titleLogo, 1.1, 1.1, 10).onComplete = () =>
        charm.scale(titleLogo, 1,1, 10).onComplete = () => {
            
            charm.scale(largeButtonGroup, 1.1, 1.1, 10).onComplete = () =>
            charm.scale(largeButtonGroup, 1,1, 10).onComplete = () => {
                
                editButtonActive(largeButton, true);
            }
            
        }
    }
}

function initializeTitle() {
    let action = () => {
        //set Button to active = false
        editButtonActive(largeButton, false);
        
        //scale button back to zero animation
        charm.scale(largeButtonGroup,1.1,1.1, 5).onComplete = () =>
        charm.scale(largeButtonGroup, 0,0, 10).onComplete = () =>
        //fadeout title Scene
        charm.fadeOut(titleScene, 30).onComplete = () => {
           //Return scale of elements back to 0
           titleLogo.scale.set(0,0);
           titleScene.visible = false;
            
           //go to next scene.
           state = play;
        }
    }
    
    titleScene = new PIXI.Container();
    titleScene.alpha = 0;
    app.stage.addChild(titleScene);
    

    titleBG = new PIXI.Sprite(id[ASSET_TITLE_BG]);
    titleBG.position.set(gameWidth / 2, gameHeight / 2);
    titleBG.anchor.set(0.5,0.5);
    titleScene.addChild(titleBG);
    
    titleLogo = new PIXI.Sprite(id[ASSET_TITLE]);
    titleLogo.position.set(gameWidth / 2, gameHeight / 2 - titleLogo.height);
    titleLogo.anchor.set(0.5,0.5);
    titleLogo.scale.set(0,0);
    titleScene.addChild(titleLogo);
    
    largeButton = new PIXI.Sprite(id[ASSET_LARGE_BTN_UP]);
    largeButton.anchor.set(0.5,0.5);
    let text = new PIXI.Text("Start Game", createTextStyle(30, "white"));
    text.anchor.set(0.5,0.5);
    editButtonActive(largeButton, false);
    addButtonActionListener(largeButton, 
                            id[ASSET_LARGE_BTN_DOWN],
                            id[ASSET_LARGE_BTN_UP],
                            action);

    largeButtonGroup = new PIXI.Container();
    largeButtonGroup.addChild(largeButton);
    largeButtonGroup.addChild(text);
    largeButtonGroup.position.set(gameWidth/2, gameHeight/2 + largeButton.height/2);
    largeButtonGroup.scale.set(0,0);
    titleScene.addChild(largeButtonGroup);

    titleScene.visible = false;
}

function play(){
    if(playScene.visible == false || restart == true) {
        playScene.visible = true;
        restart = false;
        charm.fadeIn(playScene, 30).onComplete = () => {
            editButtonActive(pauseBtn, true);
            setAllGemActive(true);
            timerOn = true;
            allowScore = true;
        };
    }
    
    if(timerOn) {
        timer();
    }
    
    if(timesUp) {
       blackBackground.alpha = 0.5;
       setAllGemActive(false);
       endScoreVal.text = currentScore;
       setAllGemActive(false);
       state = end;
    }
    
}



function initializePlay(){
    let actionPause = () => {
        blackBackground.alpha = 0.5
        editButtonActive(pauseBtn, false);
        setAllGemActive(false);
        timerOn = false;
        
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 1, 1, 5).onComplete = () => {
           //console.log("Pause!") 
           editButtonActive(resumeBtn, true);
           editButtonActive(restartBtn, true);
           editButtonActive(quitBtn, true);
        }
        
        
        
    };
    
    let actionResume = () => {
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 0, 0, 5).onComplete = () => {
           blackBackground.alpha = 0;  
           //console.log("Resume!") 
           editButtonActive(resumeBtn, false);
           editButtonActive(restartBtn, false);
           editButtonActive(quitBtn, false);
           editButtonActive(pauseBtn, true);
            setAllGemActive(true);
           timerOn = true;
        }
    }
    
    let actionRestart = () => { //reseting required here
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 0, 0, 5).onComplete = () => {
            timerOn = true;
            blackBackground.alpha = 0;
            editButtonActive(resumeBtn, false);
            editButtonActive(restartBtn, false);
            editButtonActive(quitBtn, false);
            editButtonActive(pauseBtn, true);
            setAllGemActive(true);
            restartPlay();
            state = play;
        };
        //console.log("restart");
    }
    
    let actionQuit = () => {//reseting required here
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 0, 0, 5).onComplete = () => {
           blackBackground.alpha = 0;  
           //console.log("Quit!") 
           editButtonActive(resumeBtn, false);
           editButtonActive(restartBtn, false);
           editButtonActive(quitBtn, false);
           charm.fadeOut(playScene, 30).onComplete = () => {
               playScene.visible = false;
               restartPlay();    
               state = title;
           }
        }
    }
    
    
    playScene = new PIXI.Container();
    playScene.alpha = 0;
    app.stage.addChild(playScene);
    
    playBG = new PIXI.Sprite(id[ASSET_BG]);
    playBG.position.set(gameWidth/2, gameHeight/2);
    playBG.anchor.set(0.5,0.5);    
    playScene.addChild(playBG);
    
    pauseBtn = new PIXI.Sprite(id[ASSET_PAUSE_UP]);
    pauseBtn.position.set(((gameWidth/2) + (pauseBtn.width * 4)) - 10, pauseBtn.height - pauseBtn.height/4);
    pauseBtn.anchor.set(0.5,0.5);
    playScene.addChild(pauseBtn);
    editButtonActive(pauseBtn, false);
    addButtonActionListener(pauseBtn, 
                            id[ASSET_PAUSE_DOWN],
                            id[ASSET_PAUSE_UP],
                            actionPause);

    timeContainer = new PIXI.Sprite(PIXI.loader.resources[ASSET_CONTAINER].texture);
    timeContainer.anchor.set(0.5,0.5);
    timeContainer.position.set(gameWidth/2 + timeContainer.width/3, pauseBtn.y);
    playScene.addChild(timeContainer);
            
    let timeText = new PIXI.Text("Time left: ", createTextStyle(15, "white"));
    timeText.anchor.set(0.5,0.5);
    timeText.position.set(pauseBtn.x - pauseBtn.width * 3 - 18, pauseBtn.y);
    playScene.addChild(timeText);
    
    timeVal = new PIXI.Text(time, createTextStyle(15, "white"));
    timeVal.anchor.set(0.5,0.5);
    timeVal.position.set(pauseBtn.x - pauseBtn.width - 35, pauseBtn.y);
    playScene.addChild(timeVal);
    
    scoreContainer = new PIXI.Sprite(PIXI.loader.resources[ASSET_CONTAINER].texture)
    scoreContainer.anchor.set(0.5,0.5);
    scoreContainer.position.set(timeContainer.x - scoreContainer.width - 30, timeContainer.y);
    playScene.addChild(scoreContainer);
    
    let scoreText = new PIXI.Text("Score: ", createTextStyle(15, "white"));
    scoreText.anchor.set(0.5,0.5);
    scoreText.position.set(scoreContainer.x - scoreText.width + 12, scoreContainer.y);
    playScene.addChild(scoreText);
    
    scoreVal = new PIXI.Text(currentScore, createTextStyle(15, "white"))
    scoreVal.anchor.set(1,0.5);
    scoreVal.position.set(scoreText.x*2 - 20, scoreText.y);
    playScene.addChild(scoreVal);

    board = new PIXI.Container();
    createBoard();
    board.position.set((gameWidth/2) + 25, 
                       (gameHeight/2) + 150);
    playScene.addChild(board);
    board.pivot.x = board.width/2;
    board.pivot.y = board.height/2;
    
    blackBackground = new PIXI.Graphics();
    blackBackground.drawRect((gameWidth/2) - (playBG.width/2), 
                             (gameHeight/2) - (playBG.height/2), 
                             playBG.width, 
                             playBG.height);
    blackBackground.alpha = 0;
    playScene.addChild(blackBackground);

    
    //test
   // printBoard();
    //test

    pauseContainer = new PIXI.Container();
    pauseContainer.position.set(gameWidth/2, gameHeight/2);
    pauseContainer.scale.set(0,0);
    playScene.addChild(pauseContainer);

    pauseMenu = new PIXI.Sprite(id[ASSET_PAUSE_MENU]);
    pauseMenu.anchor.set(0.5,0.5);
    pauseContainer.addChild(pauseMenu);
        
    resumeBtn = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    setMenuButtons(resumeBtn, 
                       (-resumeBtn.height) + (resumeBtn.height/2) - 5,
                       actionResume,
                       "Resume",
                       pauseContainer);
    
    restartBtn = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    setMenuButtons(restartBtn,
                      (restartBtn.height/2) + (restartBtn.height/4) - 7,
                       actionRestart,
                        "Restart",
                       pauseContainer);
    
    quitBtn = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    setMenuButtons(quitBtn,
                      (quitBtn.height*2) - 10,
                       actionQuit,
                       "Quit",
                        pauseContainer);

    let pauseText = new PIXI.Text("Paused", createTextStyle(20, "white"));
    pauseText.anchor.set(0.5,0.5);
    pauseText.position.set(0, -(pauseText.height*5) + 5);
    pauseContainer.addChild(pauseText);

    
    

    
    playScene.visible = false;
}

function printBoard() {
    let aString = "";
    
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            aString+=gemContainer[x][y].gemType + "|" + "(" + gemContainer[x][y].x +"|" + gemContainer[x][y].y + ")  ";

        }
        aString+="\n";
    }
    
    console.log(aString);
}

function findClusters() {
    clusters = [];
    
    
    //Vertical
    for(let x = 0; x < BOARD_SIZE; x++) { //rows (In array) but column (In the canvas)
         
        let matchLength = 1;
        for(let y = 0; y < BOARD_SIZE; y++) { //columns (In array) but rows (in the canvas)
            let checkCluster = false;
            
            if(y == BOARD_SIZE-1) {
                checkCluster = true;
            }
            
            else if(gemContainer[x][y].gemType == gemContainer[x][y+1].gemType &&
                    gemContainer[x][y].gemType != -1) {
                    matchLength++;
            }
            else {
                checkCluster = true;
            }
            
            if(checkCluster) {
                if(matchLength >= 3) {
                    clusters.push({column:y+1-matchLength,
                                   row: x,
                                   length: matchLength,
                                   horizontal: false});
                }
                
                matchLength = 1;
            }
            
            
        }
    }
    
    //Horizontal
    for(let y = 0; y < BOARD_SIZE; y++) {
        
        let matchLength = 1;
        for(let x = 0; x < BOARD_SIZE; x++) {
            
            let checkCluster = false;
            
            if(x == BOARD_SIZE-1) {
                checkCluster = true;
            }
            else if (gemContainer[x][y].gemType == gemContainer[x+1][y].gemType &&
                    gemContainer[x][y].gemType != -1) {
                matchLength++;
            }
            else {
                checkCluster = true;
            }
            
            if(checkCluster) {
                if(matchLength >= 3) {
                    clusters.push({column:y,
                                   row: x+1-matchLength,
                                   length:matchLength,
                                   horizontal: true});
                }
                
                matchLength = 1;
            }
            
        }
    }
    
}

function findMoves() {
    moves = [];
    
    //check for vertical swaps
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE-1; y++) {
            swap(x,y, x, y+1);
            findClusters();
            swap(x,y, x, y+1);
            
            
            if (clusters.length > 0) {
                // Found a move
                moves.push({column1: y, 
                            row1: x,
                            column2: y+1, 
                            row2: x});
            }
        }
    }
    
    //check horizontal swaps
    for(let y = 0; y < BOARD_SIZE; y++) {
        for(let x = 0; x < BOARD_SIZE-1; x++) {
            swap(x, y, x+1, y);
            findClusters();
            swap(x, y, x+1, y);
            
            if (clusters.length > 0) {
                // Found a move
                moves.push({column1: y, 
                            row1: x,
                            column2: y, 
                            row2: x+1});
            }
        }
        

    }
    
    clusters = [];
}
        
function swap(x1,y1, x2,y2) {
    let gem = gemContainer[x1][y1];
    gemContainer[x1][y1] = gemContainer[x2][y2];
    gemContainer[x2][y2] = gem;
}

function removeClusters() {
    //Code that turns all clusters that turns gems to -1
    for(let i = 0; i < clusters.length; i++) {
        let index;
        let ctr = 0;
        
        if(clusters[i].horizontal) {
            index = clusters[i].row;
        }
            
        //vertical
        else {
            index = clusters[i].column;
        }
        
        while(ctr != clusters[i].length) {
            
            if(clusters[i].horizontal) {
                makeHole(index, clusters[i].column);
            }
            else {
                makeHole(clusters[i].row, index);
            }
            
            index++;
            ctr++;
        }
        if(allowScore)
            updateScore(clusters[i].length);
    }
    
    for(let x = 0; x < BOARD_SIZE; x++) {
        let shift = 0;
        for(let y = 0; y < BOARD_SIZE; y++) {
            if(gemContainer[x][y].gemType == -1) {
                shift++;
                gemContainer[x][y].shift = 0;
                board.removeChild(gemContainer[x][y]);
            }
            else {
                gemContainer[x][y].shift = shift;
            }
        }
    }
}

let lastGem;
function shiftTiles() {
    lastGem = null;
    let gemSize = id[ASSET_GEM + "1.png"].orig.height; //width and height is the same.
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            
            if(gemContainer[x][y].gemType == -1) {
                gemContainer[x][y] = generateGem(determineGem(), x*gemSize, -200);
                lastGem = gemContainer[x][y];
                board.addChild(gemContainer[x][y]);
                gemContainer[x][y].interactive = true;
                gemContainer[x][y].buttonMode = true;
            }
            else {
                let shift = gemContainer[x][y].shift;
                
                if(shift > 0) {
                    swap(x,y, x, y-shift);
                    //gemContainer[x][y-shift].position.set(x*gemSize, (BOARD_SIZE-1)*gemSize - ((y-shift)*gemSize));
                }
            }
            
            gemContainer[x][y].shift = 0;
        }
    }

}

function makeHole(x,y) {
    gemContainer[x][y].gemType = -1;
}

function resolveClusters() {
    let gemSize = id[ASSET_GEM + "1.png"].orig.height;
    findClusters();
    //let ctr = 0;
    //while(clusters.length > 0) {
        
    removeClusters();
    shiftTiles();
    //findClusters();
        //ctr++;
    //}
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            //if(gemContainer[x][y].y == 0) {
                //gemContainer[x][y].position.set(x*gemSize, (BOARD_SIZE-1)*gemSize - (y*gemSize));
                //board.addChild(gemContainer[x][y]);
                //console.log(lastGem);
                if(lastGem == gemContainer[x][y]) {
                    //console.log("LAST")
                    charm.slide(gemContainer[x][y], x*gemSize, (BOARD_SIZE-1)*gemSize - (y*gemSize), 25).onComplete = () =>{
                        findClusters();
                        if(clusters.length >0) {
                            //console.log("Done!");
                            resolveClusters();
                        }
                        else {
                            checkIfYouCanHaveMove();
                        }
                    };
                }
                else {
                    charm.slide(gemContainer[x][y], x*gemSize, (BOARD_SIZE-1)*gemSize - (y*gemSize), 25);
                }
            //}
        }
    }
//    console.log("resolve");
//    console.log(board.height);
//    console.log(board.width);
    
}

function checkIfYouCanHaveMove() {
    let done = false;
    findMoves();
    if(moves.length > 0) {
            //console.log("Done!");
            done = true;
    }
//        
    else {
        //console.log("Oh no, reset!")
        for(let x = 0; x < BOARD_SIZE; x++) {
             while(gemContainer[x].length > 0) {
                board.removeChild(gemContainer[x][0]);
                gemContainer[x].splice(0, 1);
            }   
        }
        gemContainer = [];
        createBoard();
    }
}

function createBoard() {
    let gemSize = id[ASSET_GEM + "1.png"].orig.height; //width and height is the same.
    let xReal = 0;
    let yReal = gemSize * (BOARD_SIZE-1); 
    let done = false;
    
    //while(!done) {
        for(let x = 0; x < BOARD_SIZE; x++) {
            gemContainer.push([])

            for(let y = 0; y < BOARD_SIZE; y++) {
                let gem = generateGem(determineGem(), xReal, yReal);
                gemContainer[x].push(gem);
                yReal -= gemSize;
                board.addChild(gem);
            }

            yReal = gemSize * (BOARD_SIZE-1);
            xReal+= gemSize;
        }

        resolveClusters();
//        findMoves();    
////        console.log(clusters);
//        console.log(moves);
//        
//        if(moves.length > 0) {
//            console.log("Done!");
//            done = true;
//        }
////        
//        else {
//            console.log("Oh no, reset!")
//            for(let x = 0; x < BOARD_SIZE; x++) {
//                while(gemContainer[x].length > 0) {
//                  board.removeChild(gemContainer[x][0]);
//                  gemContainer[x].splice(0, 1);
//                }   
//            }
//            gemContainer = [];
//        }
     // }
//    console.log(gemContainer);
}

function determineGem() {
    let randomNumber = Math.floor((Math.random() * 120) + 1);
    
    //Purple Triangle GEM_1
    if(randomNumber >= 1 && randomNumber <= 20) {
        return 1;
    }
    //Green Pentagon GEM_2
    else if(randomNumber >= 21 && randomNumber <= 40) {
        return 2;
    }
    //Red Square GEM_3
    else if(randomNumber >= 41 && randomNumber <= 60) {
        return 3;
    }
    //orange heptagon GEM_4
    else if(randomNumber >= 61 && randomNumber <= 80) {
        return 4;
    }
    //blue Diamon GEM_5
    else if(randomNumber >= 81 && randomNumber <= 100) {
        return 5;
    }
    //yellow Octagon GEM_6
    else {
        return 6;
    }
}

function generateGem(gemNum, x, y) {
    //Create the gem.
    let gem = new PIXI.Sprite(id[ASSET_GEM + gemNum + ASSET_FILE_TYPE]);
    
    //set type
    gem.gemType = gemNum;
    gem.shift = 0;
    gem.anchor.set(0.5,0.5);
    gem.position.set(x, y);
    gemOnClick(gem);
    setGemActive(gem, false);
    
    return gem;
}

function setAllGemActive(active) {
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            setGemActive(gemContainer[x][y], active);
        }
    }
}

function setGemActive(gem, active) {
    gem.interactive = active;
    gem.buttonMode = active;
}

function gemOnClick(gem) {
    gem.on("pointerup", () => {
       //console.log(gem.gemType); 
       setAllGemActive(false);
       //When Clicked, show some small animation
       charm.scale(gem, 1.5,1.5,10).onComplete = ()=> 
       charm.scale(gem, 1.2,1.2, 10).onComplete= () => {
            
           if(!clickContainer.includes(gem)) {
               //console.log("Not yet in.")
               clickContainer.push(gem);
           }
           else {
               //console.log("Already in.");
           }

           
            //check if there is 2 gems clicked already
            if(clickContainer.length == 2) {
                
                //make sure that they are ADJACENT (difference of x and y must be | 50 |)
                if( (Math.abs(clickContainer[0].y - clickContainer[1].y) == 50 && Math.abs(clickContainer[0].x - clickContainer[1].x) == 0) || //user chose horizontal difference.
                    (Math.abs(clickContainer[0].x - clickContainer[1].x) == 50 && Math.abs(clickContainer[0].y - clickContainer[1].y) == 0)    //user chose vertical difference.
                  ) {
                    //console.log("Together!")
                    
                    //if together, swap places.
                    swapGems(clickContainer[0], clickContainer[1]);

                }

                else {
                    //console.log("NOT TOGETHER");
                    returnToNormalScale();
                }
            }
           
            setAllGemActive(true);
            //console.log("Gems clicked: "+ clickContainer.length);
       };
    });
    
}

function returnToNormalScale() {
    while(clickContainer.length > 0) {
        clickContainer[0].scale.set(1,1);
        clickContainer.splice(0,1);
    }
}

function swapGems(gem1, gem2) {
    let gem1Orig = []; //original gem1 position
    let gem2Orig = []; //original gem2 position
    let temp;
    
    //Canvas switching.
    gem1Orig.push(gem1.x);
    gem1Orig.push(gem1.y);
    gem2Orig.push(gem2.x);
    gem2Orig.push(gem2.y);
    charm.slide(gem1, gem2Orig[0], gem2Orig[1], 5).onComplete = () =>
    charm.slide(gem2, gem1Orig[0], gem1Orig[1], 5).onComplete = () => {
        returnToNormalScale();  
        
        //*Context of gemContainer*//
        let gem1Coor = []; //gem1 x n y
        let gem2Coor = []; //gem2 x n y
        //Array Switching
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if(gem1 == gemContainer[x][y]) {
//                    console.log("True(1): ");
//                    console.log("Gemtype: " + gemContainer[x][y].gemType);
//                    console.log("X|Y: " + x + "|" + y);
                    gem1Coor.push(x);
                    gem1Coor.push(y);
                }
                else if(gem2 == gemContainer[x][y]) {
//                    console.log("True(2): ");
//                    console.log("Gemtype: " + gemContainer[x][y].gemType);
//                    console.log("X|Y: " + x + "|" + y);
                    gem2Coor.push(x);
                    gem2Coor.push(y);
                }
            }
        }

        swapGemInArray(gem1, gem1Coor[0], gem1Coor[1],
                       gem2, gem2Coor[0], gem2Coor[1]);
        
        //find if there's any clusters.
        findClusters();
        if(clusters.length > 0 ) { //there's clusters! {
            console.log("THERE IS A MATCH")
            resolveClusters();
        }
    
        else { //Revert.
            charm.slide(gem1, gem1Orig[0], gem1Orig[1], 10).onComplete;
            charm.slide(gem2, gem2Orig[0], gem2Orig[1], 10).onComplete = () => {
                returnToNormalScale();  

                swapGemInArray(gem1, gem2Coor[0], gem2Coor[1],
                               gem2, gem1Coor[0], gem1Coor[1]);

                //printBoard();
            } 
        }
        
       //printBoard();
    }; // charm.slide bracket
}


function updateScore(matchLength) {
    
    if(matchLength == 3) {
        currentScore += SCORE_DEFAULT;
    }
    else if (matchLength == 4) {
        currentScore += SCORE_DEFAULT*2
    }
    else if(matchLength >=5) {
        currentScore += SCORE_DEFAULT*3;
    }
    
    scoreVal.text = currentScore;
}


function swapGemInArray(gem1, gem1X, gem1Y,
                        gem2, gem2X, gem2Y) {
    
    let temp = gem1;
    gemContainer[gem1X][gem1Y] = gem2;
    gemContainer[gem2X][gem2Y] = temp;
    
    
}

function setMenuButtons(button,
                            height,
                            action,
                            txt,
                            container) {

    button.anchor.set(0.5,0.5);
    button.position.set(0, height);
    editButtonActive(button, false);
    addButtonActionListener(button, 
                            id[ASSET_BUTTON_DOWN],
                            id[ASSET_BUTTON_UP],
                            action);
    let text = new PIXI.Text(txt, createTextStyle(20, "white"));
    text.anchor.set(0.5,0.5);
    text.position.set(button.x, button.y);
    
    container.addChild(button);
    container.addChild(text);
}

//Restarts:
//-Board gems
//-Timer
//-Score
function restartPlay() {
    for(let x = 0; x < gemContainer.length; x++) {
        for(let y = 0; y < gemContainer[x].length; y++) {
            board.removeChild(gemContainer[x][y]);
        }
    }
    
    gemContainer.splice(0, gemContainer.length);
    clickContainer.splice(0, clickContainer.length);
    allowScore = false;
    timesUp = false;
    timerOn = false;
    time = 60;
    timeVal.text = time;
//    console.log("On restart: ");
//    console.log(gemContainer);
//    console.log("TimerOn: " + timerOn);
//    console.log("TimesUp: " + timesUp);
    currentScore = 0;
    scoreVal.text = currentScore;
    restart = true;
    createBoard();
}

function end(){
    if(endScene.visible == false) {
        endScene.visible = true;
//        console.log(endGameContainer.y)
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2), 15).onComplete = () => {
//            console.log("end") 
            editButtonActive(endRestartBtn, true);
            editButtonActive(endQuitBtn, true);
        }
        
    }
}

function initializeEnd(){
    let acionEndQuit = () => {//reseting required here
        //console.log("quit");
        editButtonActive(endRestartBtn, false);
        editButtonActive(endQuitBtn, false);
        charm.slide(endGameContainer, endGameContainer.x, (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, endGameContainer.x, -SPRITE_OFF_SET, 15).onComplete = () => 
        charm.fadeOut(playScene, 30).onComplete = () => {
            blackBackground.alpha = 0;
            playScene.visible = false;
            endScene.visible = false;
            restartPlay();
            state = title;
        };
    };
    let actionRestart = () => {//reseting required here
//        console.log("restart")
        editButtonActive(endRestartBtn, false);
        editButtonActive(endQuitBtn, false);
        charm.slide(endGameContainer, endGameContainer.x, (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, endGameContainer.x, -SPRITE_OFF_SET, 15).onComplete = () => {
            blackBackground.alpha = 0;
            endScene.visible = false;
            restartPlay();
            state = play;
        };
    };
    
    endScene = new PIXI.Container();
    app.stage.addChild(endScene);
    
    endGameContainer = new PIXI.Container();
    endGameContainer.position.set(gameWidth/2, -SPRITE_OFF_SET);
    endScene.addChild(endGameContainer);
    
    endGameMenu = new PIXI.Sprite(id[ASSET_GAMEOVER_POPUP]);
    endGameMenu.anchor.set(0.5,0.5);
    endGameContainer.addChild(endGameMenu);
    
    endRestartBtn = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    setMenuButtons(endRestartBtn, 
                   endRestartBtn.height/2 + 15,
                   actionRestart,
                   "Restart",
                   endGameContainer);
    
    endQuitBtn = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    setMenuButtons(endQuitBtn, 
                   endQuitBtn.height * 2 - 5,
                   acionEndQuit,
                   "Quit",
                   endGameContainer);
    
    
    let endText = new PIXI.Text("Game Over", createTextStyle(20, "white"));
    endText.anchor.set(0.5,0.5);
    endText.position.set(0, -(endText.height*5));
    endGameContainer.addChild(endText);
    
    let endTotalScoreText = new PIXI.Text("Total Score", createTextStyle(20, "yellow"));
    endTotalScoreText.anchor.set(0.5,0.5);
    endTotalScoreText.position.set(0,-(endTotalScoreText.height*2) - endTotalScoreText.height/2);
    endGameContainer.addChild(endTotalScoreText);
    
    endScoreVal= new PIXI.Text("99999", createTextStyle(40, "white"));
    endScoreVal.anchor.set(0.5,0.5);
    endScoreVal.position.set(0, -(endScoreVal.height/2));
    endGameContainer.addChild(endScoreVal);
    
    
    endScene.visible = false;
}


function editButtonActive(button, active) {
    button.interactive = active;
    button.buttonMode = active;
}

function buttonUp(sprite, texture, action) {
    sprite.texture = texture;
    action();
}

function buttonDown(sprite, texture) {
    sprite.texture = texture;
}
                                                          
function addButtonActionListener(button, 
                                  textureDown, //2  
                                  textureUp,     //4
                                  action) {

    button
    .on("pointerdown", () => buttonDown(button, textureDown))
    .on("pointerup", () => buttonUp(button, textureUp, action))
    .on("pointerout", () => {button.texture = textureUp});
}

function createTextStyle(sizeOfFont,
                         colorOfFont) {
    return new PIXI.TextStyle({
                align: "center",
                fill: colorOfFont,
                fillGradientType: 1,
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: sizeOfFont,
                fontWeight: "bold",
                lineJoin: "round",
                stroke: "white"
            });
}



function timer() {
    ctr++;

    if(ctr == 60) {
        time--;
        ctr = 0;
        timeVal.text = time;
    }
    
    if(time == 0) {
        timesUp = true;
    }
}
