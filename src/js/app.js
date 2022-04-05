let web3Provider = null
let contracts = {}
let ether = 1000000000000000000
let account = null
let slotsBalance = null

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

async function drawAccount() {
    document.getElementById('account').innerHTML += account
}

async function drawSlotsBalance() {
    document.getElementById('slots-balance').innerHTML += slotsBalance + ' ETH'
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

async function main() {
    await init()
    await initContract()
    account = await getAccount().then(res => res)
    await drawAccount()
    let balanceSlots = await getBalanceSlots().then(res => res)
    await drawSlotsBalance()
    await initEvents()
}

main()