const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Notification,
  ipcMain
} = require('electron');
const path = require('path');
const pie = require('puppeteer-in-electron')
const puppeteer = require('puppeteer-core');
const isDev = require('electron-is-dev');

const {connect, disconnect, isConnected} = require('./messenger');

// https://www.electronjs.org/docs/tutorial/updates
const updateServer = 'https://nucleus.icorete.ch';
const updateFeed = `${updateServer}/update/${process.platform}/${app.getVersion()}`;

// On OSX the production build must be code signed. We skip this in dev.
// Error: Could not get code signature for running application
// https://www.electronjs.org/docs/tutorial/code-signing#electron-forge
// https://github.com/electron/electron/issues/7476#issuecomment-433208104
// https://github.com/electron/electron/issues/7476#issuecomment-454944343
try {
  autoUpdater.setFeedURL(updateFeed);
} catch (err) {
  console.log('Skipping codesign and autoupdate');
}

if (isDev) {
  console.log('Running in development');
} else {
  console.log('Running in production');
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
    fullscreenable: false
  });

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // mainWindow.loadURL('https://keenthemes.com/metronic/preview/demo8/custom/apps/projects/list-datatable.html')
  // mainWindow.loadURL('https://keenthemes.com/metronic/preview/demo4/custom/apps/projects/list-datatable.html');
  // mainWindow.loadFile('/Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/contacts/list-datatable.html');
  mainWindow.loadURL('https://app-dev.spesabot.com', {
      userAgent: 'spesabot'
    })
    // file:///Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/projects/edit-project.html
    // mainWindow.loadFile('/Users/kain/Downloads/metronic_v6.1.8/theme/default/demo12/dist/custom/apps/projects/edit-project.html');

  // mainWindow.loadURL(
  //   isDev ?
  //   "http://localhost:3000" :
  //   `file://${path.join(__dirname, "../build/index.html")}`
  // );

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
  console.error('There was a problem updating the application');
  console.error(message);
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

  ipcMain.on('loggedin', (event, obj) => {
    if ( obj.start ) {
      if ( !isConnected()  ) {
        connect( /* URL ... */ obj.channel );
      }
    } else {
      disconnect();
    }

    event.returnValue = 'ok';
  });

  await pie.initialize(app);
  const browser = await pie.connect(app, puppeteer);

  const window = new BrowserWindow();
  // const url = "https://echo.icorete.ch";
  // await window.loadURL(url);

  // const page = await pie.getPage(browser, window);
  // console.log(page.url());
  window.destroy();
};
main();
