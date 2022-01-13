import React from "react"
import {Card, Table, Button, Modal, DropdownButton, Dropdown} from "react-bootstrap"
import Datetime from "react-datetime"

import "regenerator-runtime/runtime.js"
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer


class DBTable extends React.Component {
    constructor(props) {
        super(props)

        this.localisationPairs = {
            id_Exception : "Идентификатор исключения",
            Message : "Сообщение",
            targetSite : "Место исключения",
            timeException : "Время исключения",
            indexForm : "Индекс формы",
            id_Project : "Идентификатор проекта",
            id_Student : "Идентификатор студента",
            projectName : " Имя проекта",
            projectVersion : "Версия проекта",
            catalogName : " Имя каталога"
        }

        this.state = {
            tableData : [{['loading ...'] : 'loading ...'}],
            showModal : false,
            field : "",
            type : "",
            dropdownName : "",
            inputData : "",
            addFlag : false,
            id : 0,
            dropdowns : []
        }
    }

    componentDidMount() {
        this.updTableData()
        this.intervalDescription = setInterval(this.updTableData.bind(this), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.intervalDescription)
    }

    updTableData () {
        let data = ipcRenderer.sendSync('get_full_table', {table : this.props.tableName})
        // let lang = {
        //     userExceptions : ["идентификатор проекта",	"id_Student", "projectName", "projectVersion", "catalogName"],
        //     Project : []
        // }
        // if (data.length !== 0) {
        //     data[0] = Object.keys(data[0]).reduce((prev, cur, i) => {
        //         prev[]
        //     }, {})
        // }
        if (this.state.addFlag) {
            let res = this.getTableProps()
            data.push(res.reduce((prev, cur, index) => {
                prev[cur] = undefined
                return prev
            }, {}))
            this.setState({tableData : (data.length) ? data : [{}]})
        }
        else
            this.setState({tableData : (data.length) ? data : [{}]})
    }

    addData () {
        this.setState({addFlag : !this.state.addFlag})
    }

    getTableProps () {
        return ipcRenderer.sendSync("get_table_props", {table : this.props.tableName})
    }

    renderHeader (row) {
        return (
            <thead>
                <tr>
                    {Object.keys(row).map(columnHeader => {
                        return (<th>{(this.localisationPairs[columnHeader]) ? this.localisationPairs[columnHeader] : columnHeader}</th>)
                    })}
                    <th/>
                </tr>
            </thead>
        )
    }

    renderBody (rows) {
        let pkProp = ipcRenderer.sendSync('getPKField', {table : this.props.tableName})
        return (
            <tbody style={{borderTop : "1px solid currentColor"}}>
                {rows.map(row => {
                    return this.renderRow(row, pkProp)
                })}
            </tbody>
        )
    }

    renderRow (row, pkProp) {
        let pks = ipcRenderer.sendSync('getPKFields', {table : this.props.tableName})
        let idFields = pks.map((el, i) => {
            return {
                name : el,
                value : (typeof row[el] === "object") ? JSON.stringify(row[el]).replace("Z", '').replace("T", ' ').slice(1, -5) : row[el]
            }
        })
        return (
            <tr>
                {Object.keys(row).map(columnName => {
                    if (row[columnName] !== undefined) {
                        return (
                            <td className="c-buttons"
                                onClick={this.openModal.bind(this, columnName, typeof row[columnName], idFields, pkProp)}>
                                {
                                    ("datetime2" === ipcRenderer.sendSync("get_prop_type", {table : this.props.tableName, prop : columnName}).type) ?
                                        JSON.stringify(row[columnName]).replace("Z", '').replace("T", ' ').slice(1, -5) :
                                        row[columnName]
                                }
                            </td>
                        )
                    } else {
                        return (
                            <td className="c-buttons">
                                {this.getInputField(columnName, pkProp)}
                            </td>
                        )
                    }
                })}
                {row[Object.keys(row)[0]] !== undefined &&
                <td>
                    <Button variant="outline-dark"
                            className="without-shadow c-buttons w-100"
                            onClick={this.deleteRow.bind(this, idFields)}
                    >
                        удалить
                    </Button>
                </td> || (Object.keys(row).length && <td>
                    <Button variant="outline-dark"
                            className="without-shadow c-buttons w-100"
                            onClick={this.createRow.bind(this)}
                    >
                        создать
                    </Button>
                </td>) || <></>}
            </tr>
        )
    }

    checkErr (data) {
        if (data.error) {
            ipcRenderer.sendSync("insert", {
                table: "UserException",
                values: [JSON.stringify(data.error, null, "\t"), this.props.tableName, new Date().toISOString(), ""]
            })
            alert(JSON.stringify(data.error, null, "\t"))
        }
    }

    deleteRow (idFields) {
        let data = ipcRenderer.sendSync('delete_row', {
            table : this.props.tableName,
            id : idFields
        })
        this.checkErr(data)
    }

    setDropdownById (id, value) {
        if (this.state.dropdowns.find(el => el.id === id)) {
            this.setState(state => {
                for (let dropdown of state.dropdowns) {
                    if (dropdown.id === id)
                        dropdown.value = value
                }
                return state
            })
        } else {
            this.setState(state => {
                state.dropdowns.push({id : id, value : value})
                return state
            })
        }
    }

    getInputField (columnName, pkProp) {
        if (pkProp.length && pkProp[0]["Field"] === `[${columnName}]`)
            return <input id={`add-${columnName}`} type="text" className={`form-control`} disabled/>

        let refs = ipcRenderer.sendSync("get_refs", {table : this.props.tableName, prop : columnName})
        if (refs.length) {
            let list = ipcRenderer.sendSync("select", {table : refs[0].ReferencedTable, prop : refs[0].ReferencedColumnName})
            let dropdown = this.state.dropdowns.find(el => el.id === columnName)
            return (
                <DropdownButton
                    id={`add-${columnName}`}
                    drop="down"
                    variant="secondary"
                    title={(dropdown) ? dropdown.value : ""}
                >
                    {list.map(el => {
                        return (<Dropdown.Item onClick={this.setDropdownById.bind(this, columnName, el[refs[0].ReferencedColumnName])}>
                            {el[refs[0].ReferencedColumnName]}
                        </Dropdown.Item>)
                    })}
                </DropdownButton>
            )
        }

        let type = ipcRenderer.sendSync("get_prop_type", {table : this.props.tableName, prop : columnName}).type
        if (type === "datetime2") {
            return <Datetime />
        } else if (type === "bit") {
            return (
                <DropdownButton
                    id={`add-${columnName}`}
                    drop="down"
                    variant="secondary"
                    title={this.state.dropdownName}
                >
                    <Dropdown.Item eventKey="1" onClick={this.setDropdown.bind(this, false)}>false</Dropdown.Item>
                    <Dropdown.Item eventKey="2" onClick={this.setDropdown.bind(this, true)}>true</Dropdown.Item>
                </DropdownButton>
            )
        } else {
            return (
                <input type="text"
                       className="form-control"
                       id={`add-${columnName}`}
                />
            )
        }
    }

    renderTable () {
        return (
            <Table className="mb-0 border-top">
                {this.renderHeader(this.state.tableData[0])}
                {this.renderBody(this.state.tableData)}
            </Table>
        )
    }

    openModal (field, type, idFields, pkProp) {
        if (pkProp[0]["Field"] === `[${field}]`)
            return
        this.setState({
            dropdownName : "choose value",
            field : field,
            type : type,
            inputData : "",
            idFields : idFields
        }, () => {this.setState({showModal : true})})
    }

    closeModal () {
        this.setState({showModal : false})
    }

    showDate (date) {
        console.log(date["_d"])
        return true
    }

    renderModalBody (type, columnName) {
        let refs = ipcRenderer.sendSync("get_refs", {table : this.props.tableName, prop : columnName})
        if (refs.length) {
            let list = ipcRenderer.sendSync("select", {table : refs[0].ReferencedTable, prop : refs[0].ReferencedColumnName})
            let dropdown = this.state.dropdowns.find(el => el.id === columnName)
            return (
                <DropdownButton
                id={`add-${columnName}`}
                drop="down"
                variant="secondary"
                title={(dropdown) ? dropdown.value : ""}
                >
                    {list.map(el => {
                        return (<Dropdown.Item onClick={this.setDropdownById.bind(this, columnName, el[refs[0].ReferencedColumnName])}>
                            {el[refs[0].ReferencedColumnName]}
                        </Dropdown.Item>)
                    })}
                </DropdownButton>
            )
        }
        if ("datetime2" === ipcRenderer.sendSync("get_prop_type", {table : this.props.tableName, prop : columnName}).type) {
            return <Datetime />
        } else if (type === "boolean") {
            return (
                <DropdownButton
                    id={`dropdown-button-drop-down`}
                    drop="down"
                    variant="secondary"
                    title={this.state.dropdownName}
                >
                    <Dropdown.Item eventKey="1" onClick={this.setDropdown.bind(this, false)}>false</Dropdown.Item>
                    <Dropdown.Item eventKey="2" onClick={this.setDropdown.bind(this, true)}>true</Dropdown.Item>
                </DropdownButton>
            )
        } else {
            return (
                <input type="text"
                       className="form-control"
                       id="c-input"
                />
            )
        }
    }

    setDropdown (value) {
        this.setState({dropdownName : `${value}`})
    }

    renderModal (field, type) {
        return (
            <Modal
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                show={this.state.showModal}
                onHide={this.closeModal.bind(this)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Обновить {field}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {this.renderModalBody(type, field)}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={this.closeModal.bind(this)}>Закрыть</Button>
                    <Button variant="primary" onClick={this.updateTableData.bind(this, field, type)}>ОБновить</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    updateTableData (field, type) {
        let dataForUpdate = "", err = false
        if ("datetime2" === ipcRenderer.sendSync("get_prop_type", {table : this.props.tableName, prop : field}).type) {
            dataForUpdate = document.getElementsByClassName("rdt")[0].children[0].value
            try {
                dataForUpdate = new Date(dataForUpdate).toISOString()
            } catch (e) {
                dataForUpdate = new Date().toISOString()
            }
        } else if (type === "boolean") {
            dataForUpdate = (this.state.dropdownName === "true")
        } else if (ipcRenderer.sendSync("get_refs", {table : this.props.tableName, prop : field}).length) {
            let dropdown = this.state.dropdowns.find(el => el.id === field)
            dataForUpdate = dropdown.value
        } else {
            dataForUpdate = document.getElementById("c-input").value
        }
        if (!err) {
            let data = ipcRenderer.sendSync('update_field', {
                table : this.props.tableName,
                column : field,
                value : dataForUpdate,
                id : this.state.idFields
            })
            this.checkErr(data)
            this.closeModal()
        }
        console.log(dataForUpdate)
    }

    createRow () {
        let props = this.getTableProps(), datetimeCounter = 0, result = {}
        for (let prop of props) {
            let type = ipcRenderer.sendSync("get_prop_type", {table : this.props.tableName, prop : prop}).type
            if (type === "datetime2") {
                result[prop] = document.getElementsByClassName("rdt")[datetimeCounter++].children[0].value
                try {
                    result[prop] = new Date(result[prop]).toISOString()
                } catch (e) {
                    result[prop] = new Date().toISOString()
                }
            } else if (ipcRenderer.sendSync("get_refs", {table : this.props.tableName, prop : prop}).length) {
                result[prop] = document.getElementById(`add-${prop}`).innerText
            } else {
                result[prop] = document.getElementById(`add-${prop}`).value
            }
        }
        if (result[Object.keys(result)[0]] === "")
            delete result[Object.keys(result)[0]]
        let data = ipcRenderer.sendSync("insert", {
            table : this.props.tableName,
            values : Object.keys(result).map(el => {
                if (result[el] === "")
                    return null
                return result[el]
            })
        })
        this.checkErr(data)
    }

    render () {
        return(<>
            {this.renderModal(this.state.field, this.state.type)}
            <div className="d-flex justify-content-start mb-2">
                <Button variant="outline-dark"
                        className="without-shadow c-buttons"
                        onClick={this.props.openPage.bind(this.props, this.props.defaultItem)}
                >
                    ← Назад
                </Button>
            </div>
            <Card>
                <Card.Header className="d-flex justify-content-center">{this.props.tableName}</Card.Header>
                <Card.Body>
                    {this.renderTable()}
                </Card.Body>
                <Card.Footer className="text-muted d-flex justify-content-center">
                    <Button variant="outline-dark"
                            className="without-shadow c-buttons"
                            onClick={this.addData.bind(this)}
                    >
                        {this.state.addFlag && "Отменить добавление" || "Добавить"}
                    </Button>
                </Card.Footer>
            </Card>
        </>)
    }
}

export default DBTable