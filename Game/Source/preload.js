
//
// preload.js is glue to allow the app's javascript environment to communicate with the
// electron wrapper's javascript environment in a sandboxed manner.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

const { ipcRenderer } = require('electron')

window.gameFullScreen = function(game_fullscreen) {
  ipcRenderer.sendSync('synchronous-message', ["fullscreen", game_fullscreen]);
}

window.gameIsFullScreen = function(game_fullscreen) {
  return ipcRenderer.sendSync('synchronous-message', ["getfullscreen"]);
}

window.getPersistMap = function() {
  return ipcRenderer.sendSync('synchronous-message', ["get_persist_map"]);
}

window.getPersistPenStates = function() {
  return ipcRenderer.sendSync('synchronous-message', ["get_persist_pen_states"]);
}

window.getPersistPurchases = function() {
  return ipcRenderer.sendSync('synchronous-message', ["get_persist_purchases"]);
}

window.saveZoo = function(zoo_data) {
  return ipcRenderer.sendSync('synchronous-message', ["save_zoo", zoo_data]);
}

window.loadZoo = function() {
  return ipcRenderer.sendSync('synchronous-message', ["load_zoo"]);
}

window.hasZooSave = function() {
  return ipcRenderer.sendSync('synchronous-message', ["has_zoo_save"]);
}

window.deleteZooSave = function() {
  return ipcRenderer.sendSync('synchronous-message', ["delete_zoo_save"]);
}