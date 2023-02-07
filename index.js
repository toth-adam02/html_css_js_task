const url = 'http://localhost:5000/'

const pageSize = 5

const tables = ['applications', 'global-applications', 'org-applications']

const data = new Map()

async function fetchData(endpoint, limit, offset) {
    const response = await fetch(url + endpoint + "?limit=" + limit + "&offset=" + offset)
    if (response.status != 200) {
        return
    }
    const result = await response.json()
    data.set(endpoint, result)
}

function createTableWithData(tableId, activePage = 1) {
    const table = document.getElementById(tableId)
    if (data.get(tableId).length === 0) {
        const tbody = document.getElementById(tableId + '-body')
        tbody.textContent = ''
        return
    }
    table.textContent = ''
    const activeData = data.get(tableId)
    // Create header
    const keys = Object.keys(activeData[0])
    const header = document.createElement('thead')
    const headerRow = document.createElement('tr')
    for (const key of keys) {
        const headerCell = document.createElement('th')
        headerCell.textContent = key
        headerRow.appendChild(headerCell)
    }
    header.appendChild(headerRow)
    table.appendChild(header)
    // Pagination
    const len = activeData.length
    const numOfPages = len / pageSize + (len % 5 === 0 ? 0 : 1);
    const pageList = document.getElementById(tableId + '-pagination')
    pageList.textContent = ''
    for (let i = 1; i <= numOfPages; i++) {
        const pageListElement = document.createElement('li')
        pageListElement.innerHTML = i;
        if (activePage === i) {
            pageListElement.classList.add('active')
        }
        pageListElement.addEventListener('click', e => {
            createTableWithData(tableId, parseInt(e.target.innerHTML))
        })
        pageList.appendChild(pageListElement)
    }
    // Fill table with data
    const body = document.createElement('tbody')
    body.setAttribute('id', tableId + '-body')
    const allRows = Object.values(activeData)
    const rows = allRows.slice((activePage - 1) * 5, (activePage - 1) * 5 + 5)
    for (rowData of rows) {
        const row = document.createElement('tr')
        for (val of Object.values(rowData)) {
            const cell = document.createElement('td')
            cell.textContent = val
            row.appendChild(cell)
        }
        body.appendChild(row)
    }
    table.appendChild(body)
}

async function fetchAndDisplay(endpoint, limit, offset) {
    await fetchData(endpoint, limit, offset)
    createTableWithData(endpoint)
}

for (const table of tables) {
    fetchAndDisplay(table, pageSize, 0)
    document.getElementById(table + '-submit').addEventListener('click', e => {
        const limit = document.getElementById(table + '-limit').value
        const offset = document.getElementById(table + '-offset').value
        fetchAndDisplay(table, limit, offset)
    })
}