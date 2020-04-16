const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadFile('main.html');
  mainWindow.on('closed', () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: 'Add Todo',
    webPreferences: {
      nodeIntegration: true
    }
  });
  addWindow.loadFile('addTodo.html');
  addWindow.on('closed', () => addWindow = null); // <- This will make sure we reclaim memory when we close this window
};

ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
  
});

const menuTemplate = [
  { 
    label: 'File',
    submenu: [
      {
        label: 'Add Todo',
        click() { createAddWindow(); }
      },
      {
        label: 'Clear Todos',
        click() { 
          mainWindow.webContents.send('todo:clear'); 
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Control+Q',
        click() {
          app.quit();
        }
      }
    ] 
  }
];

if (process.platform === 'darwin') {
  menuTemplate.unshift({});
}; //This will ensure that the 'File' label is shown on Mac

if (process.env.NODE_ENV !== 'production') { //This checks if the app is in development or production
  menuTemplate.push({
    label: 'DEVELOPER',
    submenu: [
      {
        label: 'Dev Tools',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Control+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      { role: 'reload' }
    ]
  })
}