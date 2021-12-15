const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const requests = require('./requests')


function createWindow (file) {
    mainWindow = new BrowserWindow({
        width: 2000,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.loadFile(file)
}

app.whenReady().then(() => {
    createWindow('public/index.html')

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow('public/index.html')
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("get_tables", async (event, args) => {
    event.returnValue = await requests.get_tables()
})

ipcMain.on("get_full_table", async (event, args) => {
    event.returnValue = await requests.get_full_table(args.table)
})

ipcMain.on('get_prop_type', async (event, args) => {
    event.returnValue = await requests.get_prop_type(args.table, args.prop)
})

ipcMain.on('get_table_props', async (event, args) => {
    event.returnValue = await requests.get_table_props(args.table)
})

ipcMain.on('get_refs', async (event, args) => {
    event.returnValue = await requests.get_refs(args.table, args.prop)
})

ipcMain.on('select', async (event, args) => {
    event.returnValue = await requests.select(args.table, args.prop)
})

ipcMain.on('insert',async (event, args) => {
    event.returnValue = await requests.insert(args.table, args.values)
})

ipcMain.on('getPKField', async (event, args) => {
    event.returnValue = await requests.getPKField(args.table)
})

ipcMain.on('getPKFields', async (event, args) => {
    event.returnValue = await requests.getPKFields(args.table)
})

ipcMain.on('update_field', async (event, args) => {
    event.returnValue = await requests.update_field(args.table, args.column, args.value, args.id)
})

ipcMain.on('delete_row', async (event, args) => {
    event.returnValue = await requests.delete_row(args.table, args.id)
})
