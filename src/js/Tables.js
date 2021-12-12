import React from "react"

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer


class Tables extends React.Component {
    constructor(props) {
        super(props)

        this.maxWidth = 5
        this.tablesBlacklist = ["sysdiagrams"]
        this.state = {
            listOfTables: ["loading..."]
        }
    }

    componentDidMount() {
        this.updTables()
    }

    updTables () {
        let tables = ipcRenderer.sendSync('get_tables')
        tables = tables.map(el => {
            return el["TABLE_NAME"]
        }).filter(el => this.tablesBlacklist.indexOf(el) === -1)
        this.setState({listOfTables : tables})
    }

    filterTables (filterWord) {
        console.log(filterWord)
        if (!filterWord)
            return this.state.listOfTables
        return this.state.listOfTables.filter(item => (new RegExp(`.*${filterWord}.*`).test(item)))
    }

    render () {
        let cardsTable = []
        let filteredTables = this.filterTables(this.props.searchWord)
        for (let cardIndex = 0; cardIndex < filteredTables.length; ) {
            let cardsRow = [], borderMean = false
            for ( ; (cardIndex % this.maxWidth !== 0) || (!borderMean); cardIndex++) {
                borderMean = true
                let openFunction, cellClass = ""
                if (filteredTables[cardIndex]) {
                    openFunction = this.props.openTable.bind(this.props, filteredTables[cardIndex])
                    cellClass = 'calendar-cell'
                }
                cardsRow.push(
                    <div className={`d-flex py-5 justify-content-center col rounded-cell ${cellClass}`}
                         onClick={openFunction}
                    >
                        {filteredTables[cardIndex]}
                    </div>
                )
            }
            cardsTable.push(<div className="row">{cardsRow}</div>)
        }
        if (!cardsTable.length)
            cardsTable.push(
                <div className="d-flex justify-content-center">
                    --- Can't find tables ---
                </div>
            )
        return (
            <div className="mx-2 pt-5">
                {cardsTable}
            </div>
        )
    }
}

export default Tables