
//
// main.js is an electron wrapper around game.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// https://www.electronjs.org/docs/tutorial/quick-start

// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const settings = require('electron-settings');
const fs = require('fs');


let game_fullscreen = false;


async function initializeSettings() {
  // Initialize settings with defaults if they don't exist
  // This makes settings discoverable and easy to modify

  const persistMap = await settings.get('persistMap');
  if (persistMap === undefined) {
    await settings.set('persistMap', false);
    console.log('Initialized persistMap setting to false');
  }

  const persistPenStates = await settings.get('persistPenStates');
  if (persistPenStates === undefined) {
    await settings.set('persistPenStates', true);
    console.log('Initialized persistPenStates setting to true');
  }

  const persistPurchases = await settings.get('persistPurchases');
  if (persistPurchases === undefined) {
    await settings.set('persistPurchases', false);
    console.log('Initialized persistPurchases setting to false');
  }
}

function createWindow () {
  // Create the browser window.

  // Initialize settings with defaults on first run
  initializeSettings().then(() => {
    console.log('Settings initialized');
  });

  settings.get('fullscreen.data').then(value => {

    let fullscreen = false;
    if (value != null) fullscreen = value;

    const mainWindow = new BrowserWindow({
      width: 1440,
      height: 922,
      fullscreen: fullscreen,
      backgroundColor: '#000000',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        enableRemoteModule: true,
        contextIsolation: false,
      }
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Get path for map.json storage
    const userDataPath = app.getPath('userData');
    const mapFilePath = path.join(userDataPath, 'map.json');

    ipcMain.on('synchronous-message', (event, arg) => {
      if (arg[0] == "fullscreen" && arg[1] == true) {
        mainWindow.setFullScreenable(true);
        mainWindow.setFullScreen(true);
        mainWindow.maximize();
        mainWindow.show();
        settings.set('fullscreen', {
            data: true
        });
        event.returnValue = 'game is full screen.'
      } else if (arg[0] == "fullscreen" && arg[1] == false) {
        mainWindow.setFullScreen(false);
        mainWindow.unmaximize();
        mainWindow.setSize(1440, 922);
        mainWindow.show();
        settings.set('fullscreen', {
            data: false
        });
        event.returnValue = 'game is windowed.'
      } else if (arg[0] == "getfullscreen") {
        event.returnValue = mainWindow.isFullScreen();
      } else if (arg[0] == "get_persist_map") {
        // Get persistMap setting (default: false for backward compatibility)
        settings.get('persistMap').then(value => {
          event.returnValue = value === true;
        });
      } else if (arg[0] == "get_persist_pen_states") {
        // Get persistPenStates setting (default: true to persist unlocked states)
        settings.get('persistPenStates').then(value => {
          event.returnValue = value !== false; // Default to true if not set
        });
      } else if (arg[0] == "get_persist_purchases") {
        // Get persistPurchases setting (default: false)
        settings.get('persistPurchases').then(value => {
          event.returnValue = value === true;
        });
      } else if (arg[0] == "save_zoo") {
        // Check if persistMap is enabled
        settings.get('persistMap').then(enabled => {
          if (enabled === true) {
            // Save zoo state to map.json
            try {
              fs.writeFileSync(mapFilePath, JSON.stringify(arg[1], null, 2));
              event.returnValue = 'zoo saved';
            } catch (e) {
              console.error('Failed to save map.json:', e);
              event.returnValue = 'save failed';
            }
          } else {
            event.returnValue = 'map persistence disabled';
          }
        });
      } else if (arg[0] == "load_zoo") {
        // Load zoo state from map.json
        settings.get('persistMap').then(enabled => {
          if (enabled === true && fs.existsSync(mapFilePath)) {
            try {
              const data = fs.readFileSync(mapFilePath, 'utf8');
              event.returnValue = JSON.parse(data);
            } catch (e) {
              console.error('Failed to load map.json:', e);
              event.returnValue = null;
            }
          } else {
            event.returnValue = null;
          }
        });
      } else if (arg[0] == "has_zoo_save") {
        // Check if map.json exists and persistMap is enabled
        settings.get('persistMap').then(enabled => {
          event.returnValue = enabled === true && fs.existsSync(mapFilePath);
        });
      } else if (arg[0] == "delete_zoo_save") {
        // Delete map.json file (when zoo size changes or user wants fresh map)
        try {
          if (fs.existsSync(mapFilePath)) {
            fs.unlinkSync(mapFilePath);
            console.log('Deleted map.json');
            event.returnValue = 'deleted';
          } else {
            event.returnValue = 'not_found';
          }
        } catch (e) {
          console.error('Failed to delete map.json:', e);
          event.returnValue = 'error';
        }
      }
    });
  });

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