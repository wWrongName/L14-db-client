const sql = require('mssql/msnodesqlv8')
const mysql = require("mysql")

class DB {
    constructor (config) {
        let sqlConfig = {
            user: "DESKTOP-G50P625\\john",
            password: "",
            database: "AirLogger",
            server: 'DESKTOP-G50P625',
            driver: 'msnodesqlv8',
            options: {
                trustedConnection : true,
                trustServerCertificate: true
            },
        }
        sqlConfig = {...sqlConfig, ...config}
        
        sql.connect(sqlConfig)
        .then((res, err) => {
            this.connected = true
        })
    }

    getFullTable (table) {
        return this.select("*", table)
    }

    getTables () {
        return this.select("TABLE_NAME", "INFORMATION_SCHEMA.TABLES", "table_type='BASE TABLE'")
    }

    query (requestString) {
        return new Promise(async (resolve, reject) => {
            while (!this.connected) {
                await new Promise(resolve => {setTimeout(() => resolve(), 500)})
            }
            console.log(requestString.replace(new RegExp("'*", "g"), "").replace(/\\/g, "'"))
            new sql.Request().query(requestString.replace(new RegExp("'*", "g"), "").replace(/\\/g, "'"))
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    }

    update (table, column, newVal, idFields) {
        console.log(idFields)
        return new Promise((resolve, reject) => {
            let where = "where", args = [table, column, newVal]
            for (let field of idFields) {
                where += " ?=\\'?\\' AND"
                args.push(field.name)
                args.push(field.value)
            }
            where = where.substring(0, where.length-3)
            let q = mysql.format(`UPDATE ? set ?=\\'?\\' ${where}`, args)
            this.query(q)
            .then(res => resolve(res))
            .catch(err => resolve({error : err}))
        })
    }

    insert (table, values) {
        return new Promise(resolve => {
            this.query(`INSERT INTO ${table} VALUES (${values})`)
            .then(res => resolve(res))
            .catch(err => resolve({error : err}))
        })
    }

    delete (table, idFields) {
        return new Promise(resolve => {
            let where = "where", args = [table]
            for (let field of idFields) {
                where += " ?=\\'?\\' AND"
                args.push(field.name)
                args.push(field.value)
            }
            where = where.substring(0, where.length-3)
            this.query(mysql.format(`DELETE FROM ? ${where}`, args))
            .then(res => resolve(res))
            .catch(err => resolve({error : err}))
        })
    }

    select (what, table, where) {
        return new Promise(resolve => {
            let whereString = ''
            if (where)
                whereString = ` WHERE ?`
            this.query(mysql.format(`SELECT ? FROM ?${whereString}`, [what, table, where]))
            .then(res => resolve(res.recordset))
            .catch(err => resolve({error : err}))
        })
    }

    getPKFields (table) {
        return new Promise(resolve => {
            let q = mysql.format(`  SELECT QUOTENAME(CONSTRAINT_NAME) [Primary Key], QUOTENAME(COLUMN_NAME) [Field]
                                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                                        WHERE TABLE_NAME=\\'?\\' AND OBJECT_ID(CONSTRAINT_NAME,\\'PK\\') IS NOT NULL
                                        ORDER BY ORDINAL_POSITION`, [table])
            this.query(q)
            .then(res => resolve(res.recordset))
            .catch(() => resolve([]))
        })
    }
    getPKField (table) {
        return new Promise(resolve => {
            let q = mysql.format(`SELECT QUOTENAME(PK.CONSTRAINT_NAME)[Primary Key], QUOTENAME(PK.COLUMN_NAME)[Field]
                                      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK
                                      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS C
                                      ON PK.CONSTRAINT_CATALOG=C.UNIQUE_CONSTRAINT_CATALOG
                                      AND PK.CONSTRAINT_SCHEMA=C.UNIQUE_CONSTRAINT_SCHEMA
                                      AND PK.CONSTRAINT_NAME=C.UNIQUE_CONSTRAINT_NAME
                                      WHERE PK.TABLE_NAME=\\'?\\' AND OBJECT_ID(PK.CONSTRAINT_NAME,\\'PK\\') IS NOT NULL
                                      ORDER BY PK.ORDINAL_POSITION`, [table])
            this.query(q)
            .then(res => resolve(res.recordset))
            .catch(() => resolve([]))
        })
    }

    getReferences (table, field) {
        return new Promise(resolve => {
            let q = mysql.format(`SELECT fk.[name], OBJECT_NAME(fk.parent_object_id) AS TableName, c.[name] AS ColumnName, OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable, rc.[name] AS ReferencedColumnName 
                                      FROM sys.foreign_keys fk
                                      INNER JOIN sys.foreign_key_columns kc ON fk.object_id = kc.constraint_object_id
                                      INNER JOIN sys.columns c ON kc.parent_object_id = c.object_id AND kc.parent_column_id = c.column_id
                                      INNER JOIN sys.columns rc ON kc.referenced_object_id = rc.object_id AND kc.referenced_column_id = rc.column_id
                                      where OBJECT_NAME(fk.parent_object_id) = \\'?\\' AND c.[name] = \\'?\\'`, [table, field])
            this.query(q)
            .then(res => resolve(res.recordset))
            .catch(() => resolve([]))
        })
    }

    getProps (table) {
        return new Promise(resolve => {
            this.select('COLUMN_NAME', 'INFORMATION_SCHEMA.COLUMNS', `table_name='${table}'`)
            .then(res => resolve(res.map(el => { return el.COLUMN_NAME })))
            .catch(() => resolve([]))
        })
    }

    getPropType (table, prop) {
        return new Promise(resolve => {
            this.select("DATA_TYPE", "INFORMATION_SCHEMA.COLUMNS", `TABLE_NAME = '${table}' AND COLUMN_NAME = '${prop}'`)
            .then(res => resolve(res[0].DATA_TYPE))
            .catch(err => resolve([]))
        })
    }

    close () {
        sql.close()
    }
}

module.exports = DB
