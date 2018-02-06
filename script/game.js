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
const ASSET_GEM1 = "asset_gem1.png";
const ASSET_GEM2 = "asset_gem2.png";
const ASSET_GEM3 = "asset_gem3.png";
const ASSET_GEM4 = "asset_gem4.png";
const ASSET_GEM5 = "asset_gem5.png";
const ASSET_GEM6 = "asset_gem6.png";
const ASSET_LARGE_BTN_DOWN = "asset_large_btn_down.png";
const ASSET_LARGE_BTN_UP = "asset_large_btn_up.png";
const ASSET_PAUSE_MENU = "asset_pause_menu.png";
const ASSET_PAUSE_UP = "asset_pause_up.png";
const ASSET_PAUSE_DOWN = "asset_pause_down.png";
const ASSET_TITLE = "asset_title.png";
const ASSET_TITLE_BG = "asset_title_bg.png";

const SPRITE_OFF_SET = 1000;

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

const LARGE_BTN_TEXT_STYLE = new PIXI.TextStyle({
    align: "center",
    fill: "white",
    fillGradientType: 1,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 30,
    fontWeight: "bold",
    lineJoin: "round",
    stroke: "white"
});

const SMALL_BTN_TXT_STYLE = new PIXI.TextStyle({
    align: "center",
    fill: "white",
    fillGradientType: 1,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 20,
    fontWeight: "bold",
    lineJoin: "round",
    stroke: "white"
});

//play
let playScene,
    playBG,
    pauseBtn,
    pauseMenu,
    scoreText,
    scoreVal,
    timeText,
    timeVal,
    blackBackground,
    pauseContainer,
    resumeBtn,
    restartBtn,
    quitBtn;

//end
let endScene,
    endRestartBtn,
    endQuitBtn,
    endScoreVal,
    endGameMenu,
    endGameContainer;


let charm = new Charm();

gameDiv.appendChild(app.view);
PIXI.loader
.add(MATCH_THREE_ATLAS)
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
    let text = new PIXI.Text("Start Game", LARGE_BTN_TEXT_STYLE);
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
        };
    }
    
    
}



function initializePlay(){
    let actionPause = () => {
        blackBackground.alpha = 0.5
        editButtonActive(pauseBtn, false);
        
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
        }
    }
    
    let actionRestart = () => {
        console.log("restart");
    }
    
    let actionQuit = () => {
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
    
    let actionPressGem;
    
    
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
    
    blackBackground = new PIXI.Graphics();
    blackBackground.drawRect((gameWidth/2) - (playBG.width/2), 
                             (gameHeight/2) - (playBG.height/2), 
                             playBG.width, 
                             playBG.height);
    blackBackground.alpha = 0;
    playScene.addChild(blackBackground);

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

    let pauseText = new PIXI.Text("Paused", SMALL_BTN_TXT_STYLE);
    pauseText.anchor.set(0.5,0.5);
    pauseText.position.set(0, -(resumeBtn.height*2) - 7);
    pauseContainer.addChild(pauseText);
    
    let testButton = new PIXI.Sprite(id[ASSET_BUTTON_UP]);
    testButton.interactive = true;
    testButton.buttonMode = true;
    
    testButton.on("pointerdown", () => {

        //End scenario happens here
       blackBackground.alpha = 0.5;
       state = end;
        
    });
    
    playScene.addChild(testButton);


    playScene.visible = false;
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
    let text = new PIXI.Text(txt, SMALL_BTN_TXT_STYLE);
    text.anchor.set(0.5,0.5);
    text.position.set(button.x, button.y);
    
    container.addChild(button);
    container.addChild(text);
}

function end(){
    if(endScene.visible == false) {
        endScene.visible = true;
        
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2 + 15), 15).onComplete = () => 
        charm.slide(endGameContainer, (endGameContainer.x), (gameHeight/2), 15).onComplete = () => {
            console.log("end") 
            editButtonActive(endRestartBtn, true);
            editButtonActive(endQuitBtn, true);
        }
        
    }
}
function initializeEnd(){
    let acionEndQuit = () => {
        console.log("quit")
    };
    let actionRestart = () => {
        console.log("restart")
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
    .on("pointerup", () => buttonUp(button, textureUp, action));
}

//let time = 0;
//let minuteElapse = 0;
//let ctr = 0;
//
//function timer() {
//    ctr++;
//    if(ctr == 60) {
//        time++;
//        //console.log(time);
//        ctr = 0;
//        
//        if(time < 10) {
//            timeText.text = minuteElapse + ":0" + time; 
//        }
//        else if(time < 60) {
//            timeText.text = minuteElapse + ":" + time;
//        }
//        else {
//            minuteElapse++;
//            time = 0;
//            timeText.text = minuteElapse + ":00";
//        }
//    }
//}
