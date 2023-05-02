# Pre-Order Reminder

### Built with ElectronJS

## Alerts

- 30 days or sooner is RED
- 90 days - 30 days is YELLOW

## Paid / UnPaid

See both paid and unpaid pre-orders

## Deletions

Deletions are allowed within the edit window

## Edits

Edit pre-orders within the edit window

## Currencies

The currency shows in the cost column depending on what is set for the items currency


# Packaging instructions:

- use this command within the directory of the app

npx electron-forge import



- set the following scripts in package.json

"scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make"
  },



- create distributable using this command

npm run make