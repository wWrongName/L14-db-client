const express = require("express")
const app = express()
app.use(express.json())
const DB = require("./db/DB")
const db = new DB()

app.post("/get_tables", (req, res) => {
    db.getTables()
    .then(result => {
        res.setHeader('Content-Type', 'application/json')
        res.send(result)
    })
})

app.post("/get_full_table", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string")
        db.getFullTable(args.table).then(result => {
            res.send(result)
        })
    else {
        res.send([])
    }
})

app.post("/get_prop_type", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.getPropType(args.table, args.prop).then(result => {
            res.send({type : result})
        })
    else {
        res.send([])
    }
})

app.post("/get_table_props", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string")
        db.getProps(args.table).then(result => {
            res.send(result)
        })
    else
        res.send([])
})

app.post("/get_refs", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.getReferences(args.table, args.prop).then(result => {
            res.send(result)
        })
    else
        res.send([])
})

app.post("/select", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string" && args.prop && typeof args.prop === "string")
        db.select(args.prop, args.table).then(result => {
            res.send(result)
        })
    else
        res.send([])
})

app.post("/insert", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (Array.isArray(args.values) && args.table && typeof args.table === "string") {
        let values = args.values.reduce((prev, cur, i) => {
            if (i)
                return prev + ", \\'" + cur + "\\'"
            return prev + "\\'" + cur + "\\'"
        }, '')
        db.insert(args.table, values).then(result => {
            res.send(result)
        })
    } else
        res.send({status: false})
})

app.post("/getPKField", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string") {
        db.getPKField(args.table).then(result => {
            res.send(result)
        })
    } else
        res.send([])
})

app.post("/getPKFields", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string") {
        db.getPKFields(args.table).then(result => {
            res.send(result.map(el => {
                return el["Field"].substring(1, el["Field"].length - 1)
            }))
        })
    } else
        res.send([])
})

app.post("/update_field", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.table && typeof args.table === "string" && args.value !== undefined && args.column !== undefined && args.id !== undefined) {
        db.update(args.table, args.column, args.value, args.id).then(result => {
            res.send(result)
        })
    } else
        res.send({status: false})
})

app.post("/delete_row", (req, res) => {
    let args = req.body
    res.setHeader('Content-Type', 'application/json')
    if (args.id !== undefined) {
        db.delete(args.table, args.id).then(result => {
            res.send(result)
        })
    } else
        res.send({status: false})
})


app.listen(1234, err => {
    if (err)
        console.log(err)
    else
        console.log(`Server started successfully. Port: 1234`)
})