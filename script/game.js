/*
Author: Alexander H. Agno II
*/
"use strict";
let gameDiv = document.getElementById("game");
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
    largeButton;

//play
let playScene;

//end
let endScene;

gameDiv.appendChild(app.view);
PIXI.loader
.add(MATCH_THREE_ATLAS)
.load(setup);

function setup() {
    id = PIXI.loader.resources[MATCH_THREE_ATLAS].textures; 
    
    initializeTitle();
    initializePlay();
    initializeEnd();
    
    state = title;
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    state();
}

function title(){
    
}

function initializeTitle() {
    titleScene = new PIXI.Container();
    app.stage.addChild(titleScene);

    console.log("wtf?")
    
}

function play(){}
function initializePlay(){}
function end(){}
function initializeEnd(){}

function initializeButton(button) {
    button.interactive = false;
    button.buttonMode = false;
    button.isDown = false;
}

function activateButton(button) {
    button.interactive = true;
    button.buttonMode = true;
}

function buttonUp(sprite, textureUP, action) {
    sprite.texture = textureUp;
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
    .on("pointerup", () => buttonUp(button, 
                                    textureUp, 
                                    action));
}
