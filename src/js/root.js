import React from "react"
import ReactDOM from "react-dom"
import {Navbar, Container} from "react-bootstrap"

import DBTable from "./DBTable"
import Tables from "./Tables"

import "regenerator-runtime/runtime.js"
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/index.css'
import logo from '../img/img.png'


class Root extends React.Component {
    constructor(props) {
        super(props)

        this.items = {
            mainPage : 'mainPage',
            tablePage : 'tablePage'
        }
        this.defaultItem = this.items.mainPage
        this.state = {
            menuItem : this.defaultItem,
            tableName : "",
            searchWord : ""
        }
    }

    useMenu () {
        let defPage = <Tables openTable={this.openTable.bind(this)}
                              searchWord={this.state.searchWord}
        />
        switch (this.state.menuItem) {
            case this.items.mainPage:
                return defPage
            case this.items.tablePage:
                return <DBTable tableName={this.state.tableName}
                                openPage={this.openPage.bind(this)}
                                defaultItem={this.defaultItem}/>
            default:
                this.setState({menuItem : this.defaultItem})
                return defPage
        }
    }

    openPage (item) {
        this.setState({menuItem : item})
    }

    openTable (tableName) {
        this.setState({tableName : tableName}, () => {
            this.openPage(this.items.tablePage)
        })
    }

    changeSearchWord (inputVal) {
        this.setState({searchWord : inputVal})
    }

    render () {
        return (<>
            <div className="mx-5">
                <Navbar bg="light" className="m-5 rounded border border-dark p-3">
                    <Container>
                        <Navbar.Brand onClick={this.openPage.bind(this, this.defaultItem)}>
                            <img
                                src={logo}
                                style={{cursor : "pointer"}}
                                width="40"
                                height="40"
                                className="d-inline-block align-top "
                                alt="logo"
                            />
                            БД Клиент
                        </Navbar.Brand>
                        <div>
                            <div className="input-group rounded">
                                <input
                                    type="search" className="form-control rounded without-shadow" placeholder="Поиск"
                                    aria-label="Search"
                                    aria-describedby="search-addon"
                                    onChange={e => {this.changeSearchWord(e.target.value)}}
                                />
                            </div>
                        </div>
                    </Container>
                </Navbar>
            </div>
            <div className="m-5">
                <div className="mx-5">
                    {this.useMenu()}
                </div>
            </div>
        </>)
    }
}

ReactDOM.render(
    <Root />,
    document.getElementById("root")
)