
//
// main.js is an electron wrapper around game.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// https://www.electronjs.org/docs/tutorial/quick-start

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')


let game_fullscreen = false;


function createWindow () {
  // Create the browser window.

  // const {screen_width, screen_height} = electron.screen.getPrimaryDisplay().workAreaSize
  // let width_zoom = screen_width / 1280;
  // let height_zoom = screen_height / 960;
  // let screen_zoom = Math.min(width_zoom, height_zoom);
  let screen_zoom = 2;

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 982,
    fullscreen: game_fullscreen,
    // titleBarStyle: "hidden",
    backgroundColor: '#000000',
    show: false,
    zoomFactor: screen_zoom,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })


  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') app.quit()
  app.quit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.