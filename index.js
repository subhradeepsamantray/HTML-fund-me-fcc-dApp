import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum != undefined) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected"
        console.log("Connected!")
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please Install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with Amount ${ethAmount}....`)
    // provider/connection to the blockchain
    // signer/wallet/someone with some gas
    // contract that we are interacting with
    // ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        })
        await listenToTransactionMine(transactionResponse, provider)
    } catch (error) {
        console.log(error)
    }
}

function listenToTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        // listen to this transaction to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != undefined) {
        console.log("Withdrawing....")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenToTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
