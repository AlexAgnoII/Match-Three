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
let time = 5;
let ctr = 0;
let timerOn = false;
let timesUp = false;



let charm = new Charm();

gameDiv.appendChild(app.view);
PIXI.loader
.add([MATCH_THREE_ATLAS, ASSET_CONTAINER])
.load(setup);

function setup() {
    id = PIXI.loader.resources[MATCH_THREE_ATLAS].textures; 
    gameHeight = id[ASSET_TITLE_BG].orig.height;
    gameWidth = id[ASSET_TITLE_BG].orig.width;
    console.log("Height: " + gameHeight)
    console.log("Width: " + gameWidth)
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
    if(playScene.visible == false) {
        playScene.visible = true;
        
        charm.fadeIn(playScene, 30).onComplete = () => {
            editButtonActive(pauseBtn, true);
            setAllGemActive(true);
            timerOn = true;
        };
    }
    
    if(timerOn) {
        timer();
    }
    
    if(timesUp) {
       blackBackground.alpha = 0.5;
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
           console.log("Pause!") 
           editButtonActive(resumeBtn, true);
           editButtonActive(restartBtn, true);
           editButtonActive(quitBtn, true);
        }
        
        
        
    };
    
    let actionResume = () => {
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 0, 0, 5).onComplete = () => {
           blackBackground.alpha = 0;  
           console.log("Resume!") 
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
            state = play;
        };
        console.log("restart");
    }
    
    let actionQuit = () => {//reseting required here
        charm.scale(pauseContainer, 1.1, 1.1, 5).onComplete = () =>
        charm.scale(pauseContainer, 0, 0, 5).onComplete = () => {
           blackBackground.alpha = 0;  
           console.log("Quit!") 
           editButtonActive(resumeBtn, false);
           editButtonActive(restartBtn, false);
           editButtonActive(quitBtn, false);
            
           charm.fadeOut(playScene, 30).onComplete = () => {
               playScene.visible = false;
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
    timeText.position.set(pauseBtn.x - pauseBtn.width * 3, pauseBtn.y);
    playScene.addChild(timeText);
    
    timeVal = new PIXI.Text(time, createTextStyle(15, "white"));
    timeVal.anchor.set(0.5,0.5);
    timeVal.position.set(pauseBtn.x - pauseBtn.width - 45, pauseBtn.y);
    playScene.addChild(timeVal);
    
    scoreContainer = new PIXI.Sprite(PIXI.loader.resources[ASSET_CONTAINER].texture)
    scoreContainer.anchor.set(0.5,0.5);
    scoreContainer.position.set(timeContainer.x - scoreContainer.width - 30, timeContainer.y);
    playScene.addChild(scoreContainer);
    
    let scoreText = new PIXI.Text("Score: ", createTextStyle(15, "white"));
    scoreText.anchor.set(0.5,0.5);
    scoreText.position.set(scoreContainer.x - scoreText.width + 12, scoreContainer.y);
    playScene.addChild(scoreText);

    board = new PIXI.Container();
    createBoard();
    board.position.set((gameWidth/2) + 25, 
                       (gameHeight/2));
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
    printBoard();
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

function createBoard() {
    let gemSize = id[ASSET_GEM + "1.png"].orig.height; //width and height is the same.
    let xReal = 0;
    let yReal = gemSize * BOARD_SIZE;  
    
    for(let x = 0; x < BOARD_SIZE; x++) {
        gemContainer.push([])
        
        for(let y = 0; y < BOARD_SIZE; y++) {
            gemContainer[x].push(generateGem(determineGem(), xReal, yReal));
            yReal -= gemSize;
        }
        
        yReal = gemSize * BOARD_SIZE;
        xReal+= gemSize;
    }
    console.log(gemContainer);
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
    gem.anchor.set(0.5,0.5);
    gem.position.set(x, y);
    gemOnClick(gem);
    setGemActive(gem, false);
    board.addChild(gem);
    
    gem.checkUp = false;
    gem.checkDown = false;
    gem.checkLeft = false;
    gem.checkRight = false;
    
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
       console.log(gem.gemType); 
       setAllGemActive(false);
       //When Clicked, show some small animation
       charm.scale(gem, 1.5,1.5,10).onComplete = ()=> 
       charm.scale(gem, 1.2,1.2, 10).onComplete= () => {
            
           if(!clickContainer.includes(gem)) {
               console.log("Not yet in.")
               clickContainer.push(gem);
           }
           else {
               console.log("Already in.");
           }

           
            //check if there is 2 gems clicked already
            if(clickContainer.length == 2) {
                
                //make sure that they are ADJACENT (difference of x and y must be | 50 |)
                if( (Math.abs(clickContainer[0].y - clickContainer[1].y) == 50 && Math.abs(clickContainer[0].x - clickContainer[1].x) == 0) || //user chose horizontal difference.
                    (Math.abs(clickContainer[0].x - clickContainer[1].x) == 50 && Math.abs(clickContainer[0].y - clickContainer[1].y) == 0)    //user chose vertical difference.
                  ) {
                    console.log("Together!")
                    
                    //if together, swap places.
                    swapGems(clickContainer[0], clickContainer[1]);

                }

                else {
                    console.log("NOT TOGETHER");
                    returnToNormalScale();
                }
            }
           
            setAllGemActive(true);
            console.log("Gems clicked: "+ clickContainer.length);
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
                    console.log("True(1): ");
                    console.log("Gemtype: " + gemContainer[x][y].gemType);
                    console.log("X|Y: " + x + "|" + y);
                    gem1Coor.push(x);
                    gem1Coor.push(y);
                }
                else if(gem2 == gemContainer[x][y]) {
                    console.log("True(2): ");
                    console.log("Gemtype: " + gemContainer[x][y].gemType);
                    console.log("X|Y: " + x + "|" + y);
                    gem2Coor.push(x);
                    gem2Coor.push(y);
                }
            }
        }

        swapGemInArray(gem1, gem1Coor[0], gem1Coor[1],
                       gem2, gem2Coor[0], gem2Coor[1]);

        //printBoard();
        
        let count = 0;
        
        if(checkIfMatching(gem1, gem2Coor[0], gem2Coor[1])) {
            count++;   
        }
        
        if(checkIfMatching(gem2, gem1Coor[0], gem1Coor[1])) {
            count++;   
        }
        
        if(count == 0) { //Revert.
            charm.slide(gem1, gem1Orig[0], gem1Orig[1], 10).onComplete;
            charm.slide(gem2, gem2Orig[0], gem2Orig[1], 10).onComplete = () => {
                returnToNormalScale();  

                swapGemInArray(gem1, gem2Coor[0], gem2Coor[1],
                               gem2, gem1Coor[0], gem1Coor[1]);

                //printBoard();
            } 
        }
        
       printBoard();
    }; // charm.slide bracket
}


function checkIfMatching(gem, x, y) {
    
    let didHappen = false;
    
    //Check if swapping caused a score!
    checkHorizontal(gem.gemType, x, y);
    checkVertical(gem.gemType, x, y);
    

    

    if(horizontalGem.length >= 3) {
        for(let i = 0; i < horizontalGem.length; i++) {
            charm.fadeOut(horizontalGem[i], 20);
        }
        
        //update array
        cleanHorizontalArray(horizontalGem);
        
        while(horizontalGem.length > 0) {
            board.removeChild(horizontalGem[0]);
            horizontalGem.splice(0,1);
        }
            
        didHappen = true;
    } 
        
    if(verticalGem.length >= 3) {
        for(let i = 0; i < verticalGem.length; i++) {
            charm.fadeOut(verticalGem[i], 20);
        }
        
        //update array
        cleanVerticalArray(verticalGem);
        
        while(verticalGem.length > 0) {
            board.removeChild(verticalGem[0]);
            verticalGem.splice(0,1);
        }
        
        didHappen = true;
    }
    
    resetGemStatus(); // resets all gem to have false.
    console.log("Horizontal: " + horizontalGem.length)
    console.log("Vertical: " + verticalGem.length)
    
    if(horizontalGem.length > 0)
        horizontalGem.splice(0,horizontalGem.length);
    if(verticalGem.length > 0)
        verticalGem.splice(0, verticalGem.length);

    console.log("Horizontal(NEW): " + horizontalGem.length)
    console.log("Vertical(NEW): " + verticalGem.length)
    
    return didHappen;
}

//cleans the array with the matched gems
function cleanHorizontalArray(gemArray) {
    let gemSize = id[ASSET_GEM + "1" + ASSET_FILE_TYPE].orig.height;
    let size = gemSize * BOARD_SIZE;
    
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            
            for(let i = 0; i < gemArray.length; i++) {
                
                if(gemArray[i] == gemContainer[x][y]) {
                    
//                    charm.slide(gemContainer[x][y], x*size, y*size, 20);
//                    
                    //splice.
                    gemContainer[x].splice(y, 1);
                    
                }
                
            }
        }
    }
    let gem;
    //generate new gems
    for(let x = 0; x < BOARD_SIZE; x++) {
        while(gemContainer[x].length < BOARD_SIZE) {
            gem = generateGem(determineGem(), gemContainer[x][0].x, -1000);
            gem.interactive = true;
            gem.buttonMode = true;
            gemContainer[x].push(gem);
        }
    }
    
    //slide gems
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            charm.slide(gemContainer[x][y], x*50, size);
             size-=gemSize;
        }
        size = gemSize * BOARD_SIZE;
    }
}

function cleanVerticalArray(gemArray) {
    let gemSize = id[ASSET_GEM + "1" + ASSET_FILE_TYPE].orig.height;
    let vertical = divide(gemArray[0].x, gemSize);
//    console.log(gemArray[0].x);
//    console.log("Vertical is: " + vertical);
    
    let index = 0;
    let found = false

    while(index < gemContainer[vertical].length) {
        
        for(let i = 0; i < gemArray.length; i++) {
            if(gemArray[i] == gemContainer[vertical][index]) {
                found = true;
                gemContainer[vertical].splice(index, 1);
                
            }
        }
           
        if(found) {
            found = false;
        }
        else {
            index++;
        }
    }
    let gem;
//    console.log(gemContainer[vertical].length);
    while(gemContainer[vertical].length < BOARD_SIZE) {
        gem = generateGem(determineGem(), gemArray[0].x, -1000);
        gem.interactive = true;
        gem.buttonMode = true;
        gemContainer[vertical].push(gem);
    }

    //slide gems
    let size = gemSize*BOARD_SIZE;
    for(let y = 0; y < BOARD_SIZE; y++) {
        charm.slide(gemContainer[vertical][y], vertical*50, size);
        size-=gemSize;
    }

    
    
}

function divide(x, size) {
    if(x == 0) 
        return 0;
    else
        return x / size;
}

function checkHorizontal(gemType, x, y) {
    
    if(x >= 0 && x < BOARD_SIZE &&
       y >= 0 && y < BOARD_SIZE) {
        
        let gem = gemContainer[x][y];
        if(gemType == gem.gemType) {

             if(gem.checkRight == false) {
                 gem.checkRight = true;
                 if(!horizontalGem.includes(gem))
                     horizontalGem.push(gem);
                 checkHorizontal(gemType, x+1, y);
             }
            
            if(gem.checkLeft == false) {
                gem.checkLeft = true;
                 if(!horizontalGem.includes(gem))
                     horizontalGem.push(gem);
                checkHorizontal(gemType, x-1, y);
            }
            
        }

    }
}

function checkVertical(gemType, x, y) {
    if(x >= 0 && x < BOARD_SIZE &&
       y >= 0 && y < BOARD_SIZE) {
        
        let gem = gemContainer[x][y];
        if(gemType == gem.gemType) {
            
             if(gem.checkUp == false) {
                 gem.checkUp = true;
                 if(!verticalGem.includes(gem))
                     verticalGem.push(gem);
                 checkVertical(gemType, x, y+1);
             }
            
            if(gem.checkDown == false) {
                gem.checkDown = true;
                 if(!verticalGem.includes(gem))
                     verticalGem.push(gem);
                checkVertical(gemType, x, y-1);
            }
            
        }
    }
}

//resets the checkTop, left, right, down back to false.
function resetGemStatus() {
    
    for(let x = 0; x < BOARD_SIZE; x++ ) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            gemContainer[x][y].checkDown = false;
            gemContainer[x][y].checkUp = false;
            gemContainer[x][y].checkLeft = false;
            gemContainer[x][y].checkRight = false;
        }
    }
    
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

function end(){
    if(endScene.visible == false) {
        endScene.visible = true;
        console.log(endGameContainer.y)
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2), 15).onComplete = () => {
            console.log("end") 
            editButtonActive(endRestartBtn, true);
            editButtonActive(endQuitBtn, true);
        }
        
    }
}

function initializeEnd(){
    let acionEndQuit = () => {//reseting required here
        console.log("quit");
        editButtonActive(endRestartBtn, false);
        editButtonActive(endQuitBtn, false);
        charm.slide(endGameContainer, endGameContainer.x, (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, endGameContainer.x, -SPRITE_OFF_SET, 15).onComplete = () => 
        charm.fadeOut(playScene, 30).onComplete = () => {
            blackBackground.alpha = 0;
            state = title;
            playScene.visible = false;
            endScene.visible = false;
            state = title;
        };
    };
    let actionRestart = () => {//reseting required here
        console.log("restart")
        editButtonActive(endRestartBtn, false);
        editButtonActive(endQuitBtn, false);
        charm.slide(endGameContainer, endGameContainer.x, (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, endGameContainer.x, -SPRITE_OFF_SET, 15).onComplete = () => {
            blackBackground.alpha = 0;
            endScene.visible = false;
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
