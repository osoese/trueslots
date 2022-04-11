let web3Provider = null
let contracts = {}
let ether = 1000000000000000000
let account = null
let slotsBalance = null
let playerBalance = null
let minValue = 0.001
let lastGame = null
let loaderView = 1

let beepSounds = new Audio('./sounds/Beep.wav')
let coinSounds = new Audio('./sounds/Coin.wav')

let slotsNumbers = {
    '0' : '<i class="nes-mario"></i>',
    '1' : '<i class="nes-ash"></i>',
    '2' : '<i class="nes-pokeball"></i>',
    '3' : '<i class="nes-bulbasaur"></i>',
    '4' : '<i class="nes-charmander"></i>',
    '5' : '<i class="nes-squirtle"></i>',
    '6' : '<i class="nes-kirby"></i>'
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function init() {
    if (window.ethereum) {
        web3Provider = window.ethereum
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log("User denied account access")
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
        beepSounds.play()
        await deposit()
    })

    document.getElementById('roll').addEventListener('click', async function () {
        beepSounds.play()
        await roll()
        await redrawPlayersAndSlotsBalances()
        coinSounds.play()
    })

    document.getElementById('withdraw').addEventListener('click', async function() {
        beepSounds.play()
        let amount = prompt('Please enter amount from your wthdraw', playerBalance)
        if (amount != 0 && amount != null) {
            amount = amount * ether
            await withdrawPlayer(amount)
            await redrawPlayersAndSlotsBalances()
            coinSounds.play()
        }
    })
}

async function getPlayerBalance() {
    return await new Promise(function (resolve, reject) {
        let slotsInstance
        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance
            return slotsInstance.getPlayerBalance.call({
                from : account
            })
        }).then(function (balance) {
            playerBalance = balance.toString() / ether
            resolve(playerBalance)
        }).catch(function (err) {
            console.log(err)
            reject(null)
        })
    })
}

async function SlotAnimation(row) {
    let lastRoll = document.getElementById('last_roll')
    while (loaderView == 1) {
        let randNumbers = [ getRandomInt(6), getRandomInt(6),getRandomInt(6)]
        lastRoll.innerHTML = ''
        lastRoll.innerHTML += `${slotsNumbers[randNumbers[0]]} ${slotsNumbers[randNumbers[1]]} ${slotsNumbers[randNumbers[2]]}`
        await sleep(1000)
    }
}

async function getLastPlayerGame() {
    return await new Promise(function (resolve, reject) {
        let slotsInstance
        contracts.Slots.deployed().then(function (instance) {
            slotsInstance = instance
            return slotsInstance.getLastPlayerGame.call({
                from : account
            })
        }).then(function (game) {
            lastGame = {
                result : game[0].toString() / ether,
                randNumber1 : game[1].toString(),
                randNumber2 : game[2].toString(),
                randNumber3 : game[3].toString()
            }
            resolve(lastGame)
        }).catch(function (err) {
            console.log(err)
            resolve(null)
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
            console.log(err)
            reject(null)
        })
    })
}

function loader(value) {
    if (loaderView == 1) {
        document.getElementById('loader').style.display = 'block'
    } else {
        document.getElementById('loader').style.display = 'none'
    }

    document.querySelector('.nes-progress').setAttribute('value', value)
}

async function getAccount() {
    return await new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error)
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
            console.log(error)
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
                console.log(error)
            }

            let account = accounts[0]

            contracts.Slots.deployed().then(function (instance) {
                slotsInstance = instance

                return slotsInstance.withdraw.sendTransaction(amount, { 
                    from: account
                })
            })
                .then(async function (res) {
                    let transactionReceipt = null
                    while (transactionReceipt == null) {
                        await web3.eth.getTransactionReceipt(res, function(error, result) {
                            transactionReceipt = result
                            if (error) {
                                reject(null)
                            }
                        });
                        await sleep(1000)
                    }
                    resolve(res)
                }).catch(function (err) {
                    console.log(err)
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
                console.log(error)
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
                    let transactionReceipt = null
                    let loaderIndex = 1
                    loaderView = 1

                    loader(10)
                    SlotAnimation()
                    while (transactionReceipt == null) {
                        loader(10 * loaderIndex)
                        loaderIndex++
                        if (loaderIndex == 9) loaderIndex = 1
                        await web3.eth.getTransactionReceipt(res, function(error, result) {
                            transactionReceipt = result
                            if (error) {
                                reject(null)
                            }
                        });
                        await sleep(1000)
                    }
                    loaderView = 0
                    loader(10)
                    resolve(res)
                }).catch(function (err) {
                    console.log(err)
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
        document.getElementById('last_game').innerHTML += `You win ${lastGame.result} ETH in last time`

        document.getElementById('last_roll').innerHTML = ''
        document.getElementById('last_roll').innerHTML += `${slotsNumbers[lastGame.randNumber1]} ${slotsNumbers[lastGame.randNumber2]} ${slotsNumbers[lastGame.randNumber3]}`
    }
}

async function redrawPlayersAndSlotsBalances() {
    loaderView = 1
    await getBalanceSlots()
    await drawSlotsBalance()
    loader(30)

    await getPlayerBalance()
    await drawPlayerBalance()
    loader(60)

    await getLastPlayerGame()
    await drawLastPlayerGames()
    loader(100)
    loaderView = 0
    loader(10)
}

async function main() {
    await init()
    await initContract()

    account = await getAccount().then(res => res)
    await drawAccount()
    loader(30)

    await getBalanceSlots()
    await drawSlotsBalance()
    loader(60)

    await getPlayerBalance()
    await drawPlayerBalance()
    loader(80)

    await getLastPlayerGame()
    await drawLastPlayerGames()
    loader(100)
    loaderView = 0
    loader(10)

    await initEvents()
}

main()