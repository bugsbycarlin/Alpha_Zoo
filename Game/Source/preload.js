
// This doesn't works
// const { BrowserWindow } = require('electron');

// console.log(BrowserWindow);
// let current_window = BrowserWindow.getFocusedWindow();

// window.gameFullScreen = function(game_fullscreen){
//   current_window.setFullScreen(game_fullscreen);
// }


// This works
// const fs = require('fs')

// window.test = function() {
//   console.log("ffs");
//   console.log(fs)
// }


const { ipcRenderer } = require('electron')

window.gameFullScreen = function(game_fullscreen) {
  ipcRenderer.sendSync('synchronous-message', ["fullscreen", game_fullscreen]);
}

window.gameIsFullScreen = function(game_fullscreen) {
  return ipcRenderer.sendSync('synchronous-message', ["getfullscreen"]);
}