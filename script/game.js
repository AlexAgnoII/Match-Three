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

//play
let playScene,
    playBG,
    pauseBtn,
    scoreText,
    scoreVal,
    timeText,
    timeVal;

//end
let endScene;


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
        console.log("Pause!")
    };
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
    
    playScene.visible = false;
}

function end(){}
function initializeEnd(){}


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
