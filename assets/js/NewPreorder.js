const { Sequelize, Model, DataTypes, QueryTypes, Op } = require("sequelize");
const shell = require('electron').shell

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/db/po.db'
})

// DB Models
const PreOrder = sequelize.define('PreOrder', {
    itemName: DataTypes.STRING,
    itemCost: DataTypes.FLOAT,
    itemCurrency: DataTypes.STRING,
    itemVendor: DataTypes.STRING,
    itemUrl: DataTypes.STRING,
    releaseDate: DataTypes.DATE,
    done: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

// function to create a new preorder
const createPreorder = async (e) => {
    stopReload(e)
    let name = document.getElementById("ItemName")
    let cost = document.getElementById("ItemCost")
    let currency = document.getElementById("Currency")
    let vendor = document.getElementById("VendorName")
    let url = document.getElementById("ItemURL")
    let date = document.getElementById("ReleaseDate")
    let notification = document.getElementById("Notification")
    let message = document.getElementById("Message")

    // DB Connection
    try {
        message.innerHTML = "Loading..."
        notification.style.display = "block"
        await sequelize.authenticate()
        console.log('Connection has been established to the database')
        const newPO = PreOrder.build({ itemName: name.value, itemCost: cost.value, itemCurrency: currency.value, itemVendor: vendor.value, itemUrl: url.value, releaseDate: date.value })
        await newPO.save();
        console.log('Your new Pre-Order for ' + name.value + ' was created.')
        clearMenu(name, cost, currency, vendor, url, date)
        console.log('Menu cleared successfully.')
        message.innerHTML = "Pre-Order Registered"
        const TO = setTimeout(() => {
            notification.style.display = "none"
        }, 2000)
        clearTimeout()
    } catch (error) {
        message.innerHTML = "ERROR: " + error
        notification.style.display = "block"
        console.error('Unable to connect to the database: ', error)
    }
    loadInitialTable()
}



// Initial onload function
async function loadInitialTable() {
    let urlString = window.location.href
    let splitUrlString = urlString.split("")
    if (splitUrlString.includes('?')) {
        let paramString = urlString.split('?')[1]
        let mess = paramString.split('=')[1]
        let message = document.getElementById("Message")
        let notification = document.getElementById("Notification")
        message.innerHTML = mess
        notification.style.display = "block"
        const TO = setTimeout(() => {
            notification.style.display = "none"
        }, 2000)
        clearTimeout()
    }
    await sequelize.sync()
    const orders = await PreOrder.findAll({
        where: {
            done: {
                [Op.eq]: false
            }
        },
        order: [
            ['releaseDate', 'ASC']
        ]
    })
    const list = document.getElementById("PreOrderList")
    let tableHTML = ""
    let ordersRAW = JSON.stringify(orders, null, 2)
    let ordersJSON = JSON.parse(ordersRAW)

    for (let order in ordersJSON) {
        buttonHTML = `
        <a href="./edit.html?id=${ordersJSON[order].id}" style="padding: 3px 5px; background-color: gray; border: 1px solid black;text-decoration: none; color: white;">
        Edit PO ${ordersJSON[order].id}
        </a>`
        paidHTML = `
        <button style="margin-left: 1rem;padding: 3px 5px;" onclick="markPaid(${ordersJSON[order].id});">Mark As Paid</button>
        `
        if (DayCheck(30, ordersJSON[order].releaseDate)) {
            tableHTML += `
            <tr style="background-color: red; color: white;">
            <td style="text-align: center;">${ordersJSON[order].itemName}</td>
            <td style="text-align: center;">${currencySymbol(ordersJSON[order].itemCurrency)}${ordersJSON[order].itemCost}</td>
            <td style="text-align: center;">${ordersJSON[order].itemVendor}</td>
            <td style="text-align: center; cursor: pointer;" onclick="goToUrl(event,'${ordersJSON[order].itemUrl}');">${ordersJSON[order].itemUrl}</td>
            <td style="text-align: center;">${dateFormat(2, ordersJSON[order].releaseDate)}</td>
            <td style="text-align: center;">${buttonHTML}</td>
            <td style="text-align: center;">${paidHTML}</td>
            </tr>
            `
        }
        else if (DayCheck(90, ordersJSON[order].releaseDate)) {
            tableHTML += `
            <tr style="background-color: yellow;">
            <td style="text-align: center;">${ordersJSON[order].itemName}</td>
            <td style="text-align: center;">${currencySymbol(ordersJSON[order].itemCurrency)}${ordersJSON[order].itemCost}</td>
            <td style="text-align: center;">${ordersJSON[order].itemVendor}</td>
            <td style="text-align: center; cursor: pointer;" onclick="goToUrl(event,'${ordersJSON[order].itemUrl}');">${ordersJSON[order].itemUrl}</td>
            <td style="text-align: center;">${dateFormat(2, ordersJSON[order].releaseDate)}</td>
            <td style="text-align: center;">${buttonHTML}</td>
            <td style="text-align: center;">${paidHTML}</td>
            </tr>
            `
        } else {
            tableHTML += `
                <tr>
                <td style="text-align: center;">${ordersJSON[order].itemName}</td>
                <td style="text-align: center;">${currencySymbol(ordersJSON[order].itemCurrency)}${ordersJSON[order].itemCost}</td>
                <td style="text-align: center;">${ordersJSON[order].itemCurrency}</td>
                <td style="text-align: center;">${ordersJSON[order].itemVendor}</td>
                <td style="text-align: center; cursor: pointer;" onclick="goToUrl(event,'${ordersJSON[order].itemUrl}');">${ordersJSON[order].itemUrl}</td>
                <td style="text-align: center;">${dateFormat(2, ordersJSON[order].releaseDate)}</td>
                <td style="text-align: center;">${buttonHTML}</td>
                <td style="text-align: center;">${paidHTML}</td>
                </tr>
                `
        }

    }
    list.innerHTML = tableHTML
}

// Get currency symbol
const currencySymbol = symbol => {
    if (symbol == "USD") {
        return "$"
    }
    else {
        return "¥"
    }
}

// Check the days until release
const DayCheck = (days, releaseDate) => {
    let date = new Date()
    let release = new Date(releaseDate)
    let diffTime = Math.abs(date - release)
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (date > release) {
        return true
    }
    else if (date < release) {
        if (diffDays <= days) {
            return true
        }
    }
    else {
        return false
    }
}

// Clear pre-order menu
const clearMenu = (name, cost, currency, vendor, url, date) => {
    name.value = ""
    cost.value = ""
    currency.value = ""
    vendor.value = ""
    url.value = ""
    date.value = ""
}

// Stop reload of browser on form submission
const stopReload = (e) => {
    e.preventDefault();
}

// Go to URL in default browser
const goToUrl = (e, url) => {
    e.preventDefault()
    open(url)
}

// Date formatting
const dateFormat = (style, dateString) => {
    switch (style) {
        case 1:
            date = new Date(dateString)
            date.setDate(date.getDate() + 1);
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            var yyyy = date.getFullYear();
            if (dd < 10) { dd = '0' + dd }
            if (mm < 10) { mm = '0' + mm };
            let newDate = yyyy + '-' + mm + '-' + dd
            return newDate
        case 2:
            date = new Date(dateString)
            date.setDate(date.getDate() + 1);
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            var yyyy = date.getFullYear();
            if (dd < 10) { dd = '0' + dd }
            if (mm < 10) { mm = '0' + mm };
            let newDate2 = mm + '-' + dd + '-' + yyyy
            return newDate2
    }
}

////////////////////
// Editing Preorders

const editForm = async () => {
    let urlString = window.location.href
    let paramString = urlString.split('?')[1]
    let id = paramString.split('=')[1]
    await sequelize.sync()
    const order = await PreOrder.findAll({
        where: {
            id: {
                [Op.eq]: id
            }
        }
    })
    let newOrder = JSON.stringify(order)
    let retOrder = JSON.parse(newOrder)
    let ID = document.getElementById("ID")
    let name = document.getElementById("ItemName")
    let cost = document.getElementById("ItemCost")
    let currency = document.getElementById("Currency")
    let vendor = document.getElementById("VendorName")
    let url = document.getElementById("ItemURL")
    let releaseDate = document.getElementById("ReleaseDate")

    ID.value = retOrder[0].id
    name.value = retOrder[0].itemName
    cost.value = retOrder[0].itemCost
    currency.value = retOrder[0].itemCurrency
    vendor.value = retOrder[0].itemVendor
    url.value = retOrder[0].itemUrl
    dateString = String(retOrder[0].releaseDate).split("T")[0]
    let d = dateFormat(1, dateString)
    releaseDate.value = d
}

const handlePreOrderEdit = (e) => {
    e.preventDefault()
    let ID = document.getElementById("ID")
    let name = document.getElementById("ItemName")
    let cost = document.getElementById("ItemCost")
    let currency = document.getElementById("Currency")
    let vendor = document.getElementById("VendorName")
    let url = document.getElementById("ItemURL")
    let releaseDate = document.getElementById("ReleaseDate")
    updatePreOrder(ID, name, cost, currency, vendor, url, releaseDate)
}

const updatePreOrder = async (id, name, cost, currency, vendor, url, releaseDate) => {
    await PreOrder.update({ itemName: name.value, itemCost: cost.value, itemCurrency: currency.value, itemVendor: vendor.value, itemUrl: url.value, releaseDate: releaseDate.value }, {
        where: {
            id: id.value
        }
    })
    window.location.replace('./index.html?message=Updated')
}

//////////////////
// Delete preorder

const handleDelete = () => {
    let ID = document.getElementById("ID")
    DeletePreOrder(ID)
}

const DeletePreOrder = async (id) => {
    await PreOrder.destroy({
        where: {
            id: id.value
        }
    })
    window.location.replace('./index.html?message=Deleted')
}

///////////////
// Mark as paid

const markPaid = async (id) => {
    await PreOrder.update({ done: true }, {
        where: {
            id: id
        }
    })
    loadInitialTable()
}

/////////////////
// Mark as UnPaid

const markUnPaid = async (id) => {
    await PreOrder.update({ done: false }, {
        where: {
            id: id
        }
    })
    LoadPaidTable()
}

//////////////////
// Load Paid Table

const LoadPaidTable = async () => {
    await sequelize.sync()
    const orders = await PreOrder.findAll({
        where: {
            done: {
                [Op.eq]: true
            }
        },
        order: [
            ['releaseDate', 'ASC']
        ]
    })
    const list = document.getElementById("PreOrderList")
    let tableHTML = ""
    let ordersRAW = JSON.stringify(orders, null, 2)
    let ordersJSON = JSON.parse(ordersRAW)

    for (let order in ordersJSON) {
        buttonHTML = `
        <a href="./edit.html?id=${ordersJSON[order].id}" style="padding: 3px 5px; background-color: gray; border: 1px solid black;text-decoration: none; color: white;">
        Edit PO ${ordersJSON[order].id}
        </a>
        `
        paidHTML = `
        <button style="margin-left: 1rem;padding: 3px 5px;" onclick="markUnPaid(${ordersJSON[order].id});">Mark As UnPaid</button>
        `
        tableHTML += `
                <tr>
                <td style="text-align: center;">${ordersJSON[order].itemName}</td>
                <td style="text-align: center;">${ordersJSON[order].itemCost}</td>
                <td style="text-align: center;">${ordersJSON[order].itemCurrency}</td>
                <td style="text-align: center;">${ordersJSON[order].itemVendor}</td>
                <td style="text-align: center; cursor: pointer;" onclick="goToUrl(event,'${ordersJSON[order].itemUrl}');">${ordersJSON[order].itemUrl}</td>
                <td style="text-align: center;">${dateFormat(2, ordersJSON[order].releaseDate)}</td>
                <td style="text-align: center;">${buttonHTML}</td>
                <td style="text-align: center;">${paidHTML}</td>
                </tr>
                `
    }
    list.innerHTML = tableHTML
}