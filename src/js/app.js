let web3Provider = null
let contracts = {}
let ether = 1000000000000000000
let account = null
let slotsBalance = null
let playerBalance = null
let minValue = 0.001
let lastGame = null

async function init() {
    if (window.ethereum) {
        web3Provider = window.ethereum

        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.error("User denied account access")
        }

    } else if (window.web3) {
        web3Provider = window.web3.currentProvider
    } else {
        web3Provider = new Web3.providers.HttpProvider("https://localhost:7545")
    }

    web3 = new Web3(web3Provider)
}

async function initContract() {
    await fetch('Slots.json')
        .then(res => res.json())
        .then(res => {
            let artifact = res
            contracts.Slots = TruffleContract(artifact)
            contracts.Slots.setProvider(web3Provider)
        })
}

async function initEvents() {
    document.getElementById('deposit').addEventListener('click', async function () {
        await deposit()
    })

    document.getElementById('roll').addEventListener('click', async function () {
        await roll()
    })

    document.getElementById('withdraw').addEventListener('click', async function() {
        let amount = prompt('Please enter amount from your wthdraw', playerBalance)
        if (amount != 0 && amount != null) {
            amount = amount * ether
            await withdrawPlayer(amount)
        }
    })
}

async function getPlayerBalance() {
    return await new Promise(function (resolve, reject) {
        let slotsInstance
        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance
            return slotsInstance.getPlayerBalance.call()
        }).then(function (balance) {
            playerBalance = balance.toString() / ether
            resolve(playerBalance)
        }).catch(function (err) {
            console.error(err)
            reject(null)
        })
    })
}

async function getLastPlayerGame() {
    return await new Promise(function (resolve, reject) {
        let slotsInstance
        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance
            return slotsInstance.getLastPlayerGame.call()
        }).then(function (game) {
            lastGame = {
                result : game[0].toString() / ether,
                randNumber1 : game[1].toString(),
                randNumber2 : game[2].toString(),
                randNumber3 : game[3].toString()
            }
            resolve(lastGame)
        }).catch(function (err) {
            console.error(err)
            reject(null)
        })
    })
}

async function getBalanceSlots() {
    return await new Promise(function (resolve, reject) {
        let slotsInstance
        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance
            return slotsInstance.getBalanceSlots.call()
        }).then(function (balance) {
            slotsBalance = balance.toString() / ether
            resolve(slotsBalance)
        }).catch(function (err) {
            console.error(err)
            reject(null)
        })
    })
}

async function getAccount() {
    return await new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.error(error)
                reject(null)
            }
            resolve(accounts[0])
        })
    })
}

//this function only owner contracts
async function deposit() {
    let slotsInstance

    web3.eth.getAccounts(function (error, accounts) {
        if (error) {
            console.error(error)
        }

        let account = accounts[0]

        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance

            return slotsInstance.deposit.sendTransaction({
                from: account,
                value: 0.001 * ether
            })
        })
            .then(function (res) {
                console.log(res)
            }).catch(function (err) {
                console.log(err)
            })
    })
}

async function withdrawPlayer(amount) {
    let slotsInstance

    return await new Promise(async function (resolve, reject) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.error(error)
            }

            let account = accounts[0]

            contracts.Slots.deployed().then(function (instance) {
                slotsInstance = instance

                return slotsInstance.withdraw.sendTransaction(amount, { 
                    from: account
                })
            })
                .then(function (res) {
                    resolve(res)
                }).catch(function (err) {
                    console.error(err)
                    reject(null)
                })
        })
    })
}

async function roll() {
    let slotsInstance

    return await new Promise(async function (resolve, reject) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.error(error)
            }

            let account = accounts[0]

            contracts.Slots.deployed().then(function (instance) {
                slotsInstance = instance

                return slotsInstance.roll.sendTransaction({
                    from: account,
                    value: minValue * ether
                })
            })
                .then(async function (res) {
                    resolve(res)
                }).catch(function (err) {
                    console.error(err)
                    reject(null)
                })
        })
    })
}


async function drawAccount() {
    document.getElementById('account').innerHTML = ''
    document.getElementById('account').innerHTML += account
}

async function drawSlotsBalance() {
    document.getElementById('slots-balance').innerHTML = ''
    document.getElementById('slots-balance').innerHTML += slotsBalance + ' ETH'
}

async function drawPlayerBalance() {
    document.getElementById('player_balance').innerHTML = ''
    document.getElementById('player_balance').innerHTML += playerBalance + ' ETH'
}

async function drawLastPlayerGames() {
    if (lastGame != null) {
        document.getElementById('last_game').innerHTML = ''
        document.getElementById('last_game').innerHTML += `
        You win ${lastGame.result} ETH in last time, 
        your roll - <b>${lastGame.randNumber1} ${lastGame.randNumber2} ${lastGame.randNumber3}</b>`
    }
}

async function redrawPlayersAndSlotsBalances() {

    await getBalanceSlots()
    await drawSlotsBalance()

    await getPlayerBalance()
    await drawPlayerBalance()

    await getLastPlayerGame()
    await drawLastPlayerGames()
}

async function main() {
    await init()
    await initContract()

    account = await getAccount().then(res => res)
    await drawAccount()

    await getBalanceSlots()
    await drawSlotsBalance()

    await getPlayerBalance()
    await drawPlayerBalance()

    await getLastPlayerGame()
    await drawLastPlayerGames()

    await initEvents()
}

main()

//i think it's so stupid excecution, but i dont konow how create better
setInterval(async function() {
    await redrawPlayersAndSlotsBalances()
}, 3000)