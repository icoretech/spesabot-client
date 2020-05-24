const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Notification,
  ipcMain,
  Menu
} = require('electron');

Menu.setApplicationMenu(null);

const path = require('path');
const isDev = require('electron-is-dev');
const {
  Log,
  Name,
  TempFolder
} = require('./utils');

Log.log('Starting up');
Log.log(`folder is: ${TempFolder}`);

const {
  connect,
  disconnect,
  isConnected
} = require('./messenger');

// https://www.electronjs.org/docs/tutorial/updates
// On OSX the production build must be code signed. We skip this in dev.
// Error: Could not get code signature for running application
// https://www.electronjs.org/docs/tutorial/code-signing#electron-forge
// https://github.com/electron/electron/issues/7476#issuecomment-433208104
// https://github.com/electron/electron/issues/7476#issuecomment-454944343
try {
  const updateServer = 'https://download.spesabot.com';
  const updateSuffix = process.platform === 'darwin' ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : '';
  const updateFeed = `${updateServer}/spesabot/b566e902588c0222b74b256b67b0d304/${process.platform}/${process.arch}${updateSuffix}`
  autoUpdater.setFeedURL({
    url: updateFeed,
    serverType: 'json'
  });
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60000);

} catch (err) {
  Log.log(err);
  Log.log('Skipping codesign and autoupdate');
  console.error(err);
}

if (isDev) {
  console.log('Running in development');
  Log.log('Running in development')
} else {
  console.log('Running in production');
  Log.log('-- production --');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 960,
    resizable: false,
    fullscreenable: false,
    backgroundColor: '#EEF0F8',
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // mainWindow.loadURL('https://keenthemes.com/metronic/preview/demo8/custom/apps/projects/list-datatable.html')
  // mainWindow.loadURL('https://keenthemes.com/metronic/preview/demo4/custom/apps/projects/list-datatable.html');
  // mainWindow.loadFile('/Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/contacts/list-datatable.html');
  // mainWindow.loadURL(process.env.SPESABOT_URL || 'https://app-dev.spesabot.com', {
  //     userAgent: 'spesabot'
  //   })
  // file:///Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/projects/edit-project.html
  // mainWindow.loadFile('/Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/projects/edit-project.html');

  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(
    isDev ?
    'https://app-dev.spesabot.com/users/sign_in' :
    'https://app.spesabot.com/users/sign_in'
  );

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application:', message);
  Log.log(`There was a problem updating the application: ${message}`);
})

// alternative: https://github.com/mikaelbr/node-notifier
function callNotification() {
  let iconAddress = path.join(__dirname, '/icon.png');
  const notif = {
    title: 'Headline',
    body: 'Here write your message',
    icon: iconAddress
  };
  new Notification(notif).show();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const main = async() => {

  ipcMain.on('close-paypal', () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      // The Paypal window would fail to load contents due to security
      // restrictions and return an empty URL
      if (!win.webContents.getURL()) {
        win.close();
      }
    });
  });

  ipcMain.on('loggedin', (event, obj) => {
    if (obj.start) {
      // Log.log(`new page navigated`);
      if (!isConnected()) {
        Log.log(`connecting socket`);
        connect(obj.url);
      } else {}
    } else {
      Log.log(`disconnecting socket`);
      disconnect();
    }

    event.returnValue = 'ok';
  });

  // await pie.initialize(app);
  // const browser = await pie.connect(app, puppeteer);

  // const window = new BrowserWindow();
  // const url = "https://echo.icorete.ch";
  // await window.loadURL(url);

  // const page = await pie.getPage(browser, window);
  // console.log(page.url());
  // window.destroy();
};
main();
