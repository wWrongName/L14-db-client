const destination = "http://localhost:1234/"
const fetch = require("node-fetch")

function postRequest(method, body) {
    return new Promise((resolve, reject) => {
        fetch(destination + method, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body : JSON.stringify(body)
        }).then(raw => {
            try {
                raw.json().then(res => resolve(res))
            } catch (e) {
                console.log(e)
                resolve({})
            }
        })
    })
}

module.exports = {
    get_tables : function () {
        return postRequest("get_tables")
    },

    get_full_table : function (table) {
        return postRequest("get_full_table", {
            table : table
        })
    },

    get_prop_type : function (table, prop) {
        return postRequest("get_prop_type", {
            table : table,
            prop : prop
        })
    },

    get_table_props : function (table) {
        return postRequest("get_table_props", {
            table : table
        })
    },

    get_refs : function (table, prop) {
        return postRequest("get_refs", {
            table : table,
            prop : prop
        })
    },

    select : function (table, prop) {
        return postRequest("select", {
            table : table,
            prop : prop
        })
    },

    insert : function (table, values) {
        return postRequest("insert", {
            table : table,
            values : values
        })
    },

    getPKField : function (table) {
        return postRequest("getPKField", {
            table : table
        })
    },

    getPKFields : function (table) {
        return postRequest("getPKFields", {
            table : table
        })
    },

    update_field : function (table, column, value, id) {
        return postRequest("update_field", {
            table : table,
            column : column,
            value : value,
            id : id
        })
    },

    delete_row : function (table, id) {
        return postRequest("delete_row", {
            table : table,
            id : id
        })
    }
}