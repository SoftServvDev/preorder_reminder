const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");

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
}



// Initial onload function
async function loadInitialTable() {
        await sequelize.sync()
        const orders = await PreOrder.findAll()
        console.log(orders.every(order => order instanceof PreOrder))
        console.log("All Orders: ", JSON.stringify(orders, null, 2))
        const list = document.getElementById("PreOrderList")
        list.innerHTML = orders.map(order => 
            <tr>
                <td>{order.itemName}</td>
                <td>{order.itemCost}</td>
                <td>{order.itemCurrency}</td>
                <td>{order.itemVendor}</td>
                <td>{order.itemUrl}</td>
                <td>{order.releaseDate}</td>
            </tr>
        )
        // NEED TO FINISH THISW:EiEJR:OWIEJR:OIWEJR:OIJW:EOIFRJ:WEOIJ:OIEWFJ:OWEFIJF:IEOFJ:EFIOJ
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