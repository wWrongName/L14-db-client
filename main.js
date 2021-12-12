const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const DB = require("./db/DB")
const db = new DB()

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

ipcMain.on("get_tables", (event, args) => {
    db.getTables()
    .then(res => event.returnValue = res)
})

ipcMain.on("get_full_table", (event, args) => {
    if (args.table && typeof args.table === "string")
        db.getFullTable(args.table).then(res => event.returnValue = res)
    else
        event.returnValue = []
})

ipcMain.on('get_prop_type', (event, args) => {
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.getPropType(args.table, args.prop).then(res => event.returnValue = res)
    else
        event.returnValue = ""
})

ipcMain.on('get_table_props', (event, args) => {
    if (args.table && typeof args.table === "string")
        db.getProps(args.table).then(res => event.returnValue = res)
    else
        event.returnValue = []
})

ipcMain.on('get_refs', (event, args) => {
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.getReferences(args.table, args.prop).then(res => event.returnValue = res)
    else
        event.returnValue = []
})

ipcMain.on('select', (event, args) => {
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.select(args.prop, args.table).then(res => event.returnValue = res)
    else
        event.returnValue = []
})

ipcMain.on('insert',(event, args) => {
    if (Array.isArray(args.values) && args.table && typeof args.table === "string") {
        console.log(args.values)
        let values = args.values.reduce((prev, cur, i) => {
            if (i)
                return prev + ", \\'" + cur + "\\'"
            return prev + "\\'" + cur + "\\'"
        }, '')
        db.insert(args.table, values).then(res => event.returnValue = res)
    } else
        event.returnValue = false
})

ipcMain.on('getPKField', (event, args) => {
    if (args.table && typeof args.table === "string") {
        db.getPKField(args.table).then(res => event.returnValue = res)
    } else
        event.returnValue = []
})

ipcMain.on('getPKFields', (event, args) => {
    if (args.table && typeof args.table === "string") {
        db.getPKFields(args.table).then(res => {
            event.returnValue = res.map(el => {
                return el["Field"].substring(1, el["Field"].length - 1)
            })
        })
    } else
        event.returnValue = []
})

ipcMain.on('update_field', (event, args) => {
    if (args.table && typeof args.table === "string" && args.value !== undefined && args.column !== undefined && args.id !== undefined) {
        db.update(args.table, args.column, args.value, args.id).then(res => event.returnValue = res)
    } else
        event.returnValue = false
})

ipcMain.on('delete_row', (event, args) => {
    if (args.id !== undefined) {
        db.delete(args.table, args.id).then(res => event.returnValue = res)
    } else
        event.returnValue = false
})
