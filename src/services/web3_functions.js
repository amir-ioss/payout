const Web3 = require('web3');

const write_log = require("./write_log");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


if (process.env.HOSTING=="production"){
    var PUBLIC_KEY = process.env.PUBLIC_KEY;
    var PRIVATE_KEY = process.env.PRIVATE_KEY;
    var web3 = new Web3("https://bsc-dataseed.binance.org/"); //live
    var api_url = 'https://api.bscscan.com/api';
    var primary_api_key = process.env.PRIMARY_API_KEY
    var contract_addr = "0x55d398326f99059ff775485246999027b3197955"; //usdt peg
    var contract_abi = require('../utils/abi_usdt.json');
}else{
    var PUBLIC_KEY = process.env.PUBLIC_KEY_TEST;
    var PRIVATE_KEY = process.env.PRIVATE_KEY_TEST;
    var web3 = new Web3("https://data-seed-prebsc-1-s3.binance.org:8545"); //testnet
    var api_url = 'https://api-testnet.bscscan.com/api';
    var primary_api_key = process.env.PRIMARY_API_KEY_TEST
    var contract_addr = "0xc6de9a070c6f4e119023d9470afbfe553f0a4078";  //sbt
    var contract_abi = require('../utils/abi_sbt.json');
}

const INSTANCE = new web3.eth.Contract(
    contract_abi,
    contract_addr,
);

var sendTokennonce = 0
var sendStakeTokennonce = 0
var sendGasnonce = 0
var sendTokenToAdminNonceOBJ = {}


async function _createAccount(){
    try {
        var wallet = await web3.eth.accounts.create();
        response_data = {
            'status' : true,
            'message' : "Address generated successfully",
            'value' : wallet,
        };
    }
    catch(error) {
        write_log("create Account : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _getname(){
    try {
        var name = await INSTANCE.methods.name().call();
        response_data = {
            'status' : true,
            'value' : name,
        };
    }
    catch(error) {
        write_log("get name : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _getsymbol(){
    try {
        var symbol = await INSTANCE.methods.symbol().call();
        response_data = {
            'status' : true,
            'value' : symbol,
        };
    }
    catch(error) {
        write_log("get symbol : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _getdecimels(){
    try {
        if(process.env.DECIMELS){
            response_data = {
                'status' : true,
                'value' : process.env.DECIMELS,
            };
        }else{
            var decimal = await INSTANCE.methods.decimals().call();
            response_data = {
                'status' : true,
                'value' : decimal,
            };
        }
    }
    catch(error) {
        write_log("get decimals : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _totalsupply(){
    try {
        var supply = await INSTANCE.methods.totalSupply().call();

        const decimals = await _getdecimels();
        if (decimals.status == true) {
            response_data = {
                'status' : true,
                'value' : supply / (10 ** decimals.value),
            };
        } else {
            response_data = {
                'status' : false,
                'message' : decimals.message,
                'error' : decimals.error
            };
        }
    }
    catch(error) {
        write_log("total supply : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _getmybalance(){
    try {
        var myTokenbalance = await INSTANCE.methods.balanceOf(PUBLIC_KEY).call();
        var myBNBbalance = await web3.eth.getBalance(PUBLIC_KEY);
        
        const decimals = await _getdecimels();
        if (decimals.status == true) {
            response_data = {
                'status' : true,
                'token' : myTokenbalance / (10 ** decimals.value),
                'bnb': myBNBbalance / (10 ** decimals.value)
            };
        } else {
            response_data = {
                'status' : false,
                'message' : decimals.message,
                'error' : decimals.error
            };
        }
    }
    catch(error) {
        write_log("get my balance : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error ?? error.message)
        };
    }
    return response_data;
}

async function _calculateGas(user_wallet_pub, recipient, amount){
    try{
        var gasUsed = await INSTANCE.methods
            .transfer(recipient, amount)
            .estimateGas({from: user_wallet_pub});

        var gasPrice = await web3.eth.getGasPrice();

        bnb_value_wei = gasUsed*gasPrice;

        response_data = {
            'status' : true,
            'gasused': gasUsed,
            'gasfee' : bnb_value_wei
        };
    }catch(error){
        write_log("calculate Gas : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error ?? error.message)
        };
    }
    return response_data;
}

async function _getbalanceof(address){
    try {
        var Tokenbalance = await INSTANCE.methods.balanceOf(address).call();
        var BNBbalance = await web3.eth.getBalance(address);

        const decimals = await _getdecimels();
        if (decimals.status == true) {
            response_data = {
                'status' : true,
                'token' : Tokenbalance / (10 ** decimals.value),
                'bnb': BNBbalance / (10 ** decimals.value)
            };
        } else {
            response_data = {
                'status' : false,
                'message' : decimals.message,
                'error' : decimals.error
            };
        }
    }
    catch(error) {
        write_log("get balanceof : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error ?? error.message)
        };
    }
    return response_data;
}

async function _isValid(address){
    try{
        var isvalid = await web3.utils.isAddress(address);
        if (isvalid) {
            response_data = {
                'status' : true,
                'address' : address
            };
        }else {
            response_data = {
                'status' : false,
                'address' : address,
                'message' : "Address Not Valid",
                'error' : "Not Valid"
            };
        }
    }catch(error){
        write_log("is valid error : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;
}

async function _sendTokens(recipient, amount, admin_wallet_pub, admin_wallet_pvt) {
    try {
        var time = new Date().toLocaleString() 
        write_log(`send Tokens inc : time = ${time} , recipient = ${recipient} , amount = ${amount} , admin_wallet_pub = ${admin_wallet_pub}`)
        current_balance = await _getbalanceof(admin_wallet_pub);
        if (current_balance.status == true) {
            if (amount > current_balance.token) {
                response_data = {
                    'status' : false,
                    'message' : 'Insufficient token balance in admin wallet',
                    'error' : 'Insufficient token balance in admin wallet'
                };
                return response_data;
            }
            if (current_balance.bnb == 0) {
                response_data = {
                    'status' : false,
                    'message' : 'Insufficient BNB balance in admin wallet',
                    'error' : 'Insufficient BNB balance in admin wallet'
                };
                return response_data;
            }
        } else {
            response_data = {
                'status' : false,
                'message' : current_balance.message,
                'error' : current_balance.error
            };
            return response_data;
        }

        sendamount = await web3.utils.toWei(amount.toString(), 'ether');

        const nonce = await web3.eth.getTransactionCount(admin_wallet_pub, "latest") //get latest nonce

        if(nonce == 0 && sendTokennonce == 0){
            sendTokennonce = nonce;
        }else if(nonce == 0 && sendTokennonce > 0){
            sendTokennonce = sendTokennonce + 1;
        }else if (nonce != 0){
            if (sendTokennonce >= nonce) {
                sendTokennonce = sendTokennonce + 1;
            }else {
                sendTokennonce = nonce
            }
        }

        const tx = {
            from: admin_wallet_pub,
            to: contract_addr,
            nonce: sendTokennonce,
            gas: 500000,
            data: INSTANCE.methods.transfer(recipient, sendamount).encodeABI(),
        }
    
        const signPromise = await web3.eth.accounts.signTransaction(tx, admin_wallet_pvt)

        return new Promise(
            (resolve, reject) => {
                const sentTx = web3.eth.sendSignedTransaction(signPromise.rawTransaction || signPromise.raw);
                sentTx.once('receipt', (receipt) => {
                    response_data = {
                        'status' : true,
                        'from' : admin_wallet_pub,
                        'to' : recipient,
                        'amount' : amount,
                        'message' : 'Tokens send successfully',
                        'transactionHash': receipt.transactionHash,
                        'block_number': receipt.blockNumber
                    };
                    write_log(`send Tokens out : status=true, block_number = ${receipt.blockNumber}, transactionHash = ${receipt.transactionHash}`)
                    if(nonce == 0 && sendTokennonce == 0){
                        sendTokennonce = sendTokennonce + 1;
                    }
                    resolve(response_data);
                });
                sentTx.on('error',  (error) => {
                    response_data = {
                        'status' : false,
                        'from' : admin_wallet_pub,
                        'to' : recipient,
                        'amount' : amount,
                        'message' : 'Token send failed. Try again',
                        'error' : error.message
                    };
                    write_log(`send Tokens out : status=false , error = ${error.message}`)
                    reject(response_data);
                });
            }
        );

    } catch(error) {
        write_log("send Tokens : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'address' : recipient,
            'amount' : amount,
            'message' : "Something bad happened. Please try again!",
            'error' : (error ?? error.message)
        };
        return response_data;
    }
}

async function _checkTransaction(user_address, previous_block) {
    try{
        const decimals = await _getdecimels();
        if (decimals.status != true) {
            response_data = {
                'status' : false,
                'message' : decimals.message,
                'error' : decimals.error
            };
        }

        const options = {method: 'GET', headers: {Accept: 'application/json'}};

        const start_block = Number(previous_block)+Number(1);
        
        var fetchapi = fetch(
            api_url +
            '?module=account&action=tokentx&'+
            'contractaddress=' + contract_addr + 
            '&address=' + user_address +
            '&page=1&offset=1000&sort=desc' +
            '&startblock=' + start_block +
            '&apikey=' + primary_api_key,
            options
        )
        .then(res => res.json())
        .then(
            res => {
                var filtered_res = res.result.filter(
                    function(fil) {
                        return fil.to.toLowerCase() == user_address.toLowerCase();
                    }
                );

                if (filtered_res.length==0){
                    response_data = {
                        'status': false,
                        'message' : "No transactions found",
                        'error' : "None",
                    };
                    return response_data;
                }

                var tot_val = 0
                var ids = []
                filtered_res.forEach(item => {
                    if (item.to.toLowerCase() === user_address.toLowerCase()){
                        tot_val += Number(item.value);
                        ids.push(item.hash);
                    }
                })
                var from = filtered_res[0].from;
                var to = filtered_res[0].to;
                var value = tot_val/10**decimals.value;
                var transaction_id = ids;
                var block_number = filtered_res[0].blockNumber;
                response_data = {
                    'status': true,
                    'from' : from,
                    'to' : to,
                    'value' : value,
                    'transaction_id' : transaction_id,
                    'block_number' : block_number,
                };
                return response_data;
            }
        )
        .catch(
            err => {
                response_data = {
                    'status': false,
                    'message' : "Something bad happened. Please try again!!",
                    'error' : err.message,
                };
                return response_data;
            }
        );
        return fetchapi

    }catch(error){
        write_log("check transaction : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error ?? error.message)
        };
        return response_data;
    }
}

async function _sendGas(gas_wallet_pub, gas_wallet_pvt, user_address, amount){
    try{
        const nonce = await web3.eth.getTransactionCount(gas_wallet_pub, "latest") //get latest nonce
        if(nonce == 0 && sendGasnonce == 0){
            sendGasnonce = nonce;
        }else if(nonce == 0 && sendGasnonce > 0){
            sendGasnonce = sendGasnonce + 1;
        }else if (nonce != 0){
            if (sendGasnonce >= nonce) {
                sendGasnonce = sendGasnonce + 1;
            }else {
                sendGasnonce = nonce
            }
        }
        
        const rawtx = {
            from: gas_wallet_pub,
            to: user_address,
            value: amount,
            nonce: sendGasnonce,
            gas: 500000
        }
        const signrawtx = await web3.eth.accounts.signTransaction(rawtx, gas_wallet_pvt);

        const sendBNB = await web3.eth.sendSignedTransaction(signrawtx.rawTransaction || signrawtx.raw);

        if(nonce == 0 && sendGasnonce == 0){
            sendGasnonce = sendGasnonce + 1;
        }

        response_data = {
            'status' : true,
            'data': sendBNB
        };
    }catch(error){
        write_log("send gas : " + error.message)
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : error.message
        };        
    }
    return response_data;
    try {
        var time = new Date().toLocaleString()

        write_log(`send gas to user inc : time = ${time} , user_address = ${user_address} , amount = ${amount},  gas_wallet_pub = ${gas_wallet_pub}`)
        
        var TRXbalance = await tronWeb.trx.getBalance(user_address);
        if(parseInt(TRXbalance) >= parseInt(amount)) {
            response_data = {
                'status' : false,
                'message' : 'Gas fees already present in account. No need to send again',
                'error' : "Gas fees already present in account. No need to send again"
            };
            return response_data;
        }

        var Gasbalance = await tronWeb.trx.getBalance(gas_wallet_pub);
        if(parseInt(Gasbalance) < parseInt(amount)) {
            response_data = {
                'status' : false,
                'message' : 'Insufficient TRX balance in gas wallet',
                'error' : "Insufficient TRX balance in gas wallet"
            };
            return response_data;
        }

        const privateKey = gas_wallet_pvt; 
        var fromAddress = gas_wallet_pub; //address _from
        var toAddress = user_address; //address _to
        var amount = amount; //amount，in sun
        // Create an unsigned TRX transfer transaction
        const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            toAddress,
            amount,
            fromAddress
        );
        // Sign
        const signedtxn = await tronWeb.trx.sign(
            tradeobj,
            privateKey
        );
        // Broadcast
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        ).then(
            output => {
                return output;
            }
        );
        write_log(`send gas to user out : status = true , transactionHash = ${receipt.txid}`)
        response_data = {
            'status' : true,
            'receipt' : receipt
        };
    }
    catch(error){
        write_log("send Gas : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'message' : "Something bad happened. Please try again!",
            'error' : (error.message ?? error)
        };
    }
    return response_data;

}

async function _sendTokentoAdmin(user_wallet_pub, user_wallet_pvt, admin_wallet_pub, gas_wallet_pub, gas_wallet_pvt){

    try {
        var time = new Date().toLocaleString()
        write_log(`send Tokens to admin inc : time = ${time} , adminwallet = ${admin_wallet_pub} , user_address = ${user_wallet_pub}, gas_wallet_pub = ${gas_wallet_pub}`)

        const decimals = await _getdecimels();
        if (decimals.status != true) {
            response_data = {
                'status' : false,
                'message' : decimals.message,
                'error' : decimals.error
            };
        }

        current_balance = await _getbalanceof(user_wallet_pub);
        if (current_balance.status == true) {
            if(current_balance.token == 0) {
                response_data = {
                    'status' : false,
                    'message' : 'No tokens to transfer in user wallet',
                    'error' : 'No tokens to transfer in user wallet'
                };
                return response_data;
            }

            var sendamount = await web3.utils.toWei(current_balance.token.toString(), 'ether');
            var calculategas = await _calculateGas(user_wallet_pub, admin_wallet_pub, sendamount);
            if (calculategas.status != true) {
                return response_data = {
                    'status' : false,
                    'message' : calculategas.message,
                    'error' : calculategas.error
                };
            }

            if (current_balance.bnb < (calculategas.gasfee/10**decimals.value)) {
                write_log(`send Tokens to admin calculate gas :  gasfee = ${calculategas.gasfee}`);
                var sendgas = await _sendGas(gas_wallet_pub, gas_wallet_pvt, user_wallet_pub, calculategas.gasfee);
                if (sendgas.status != true) {
                    return response_data = {
                        'status' : false,
                        'message' : sendgas.message,
                        'error' : sendgas.error
                    };
                }
            }

            //mysql connection in php
        } else {
            response_data = {
                'status' : false,
                'message' : current_balance.message,
                'error' : current_balance.error
            };
            return response_data;
        }

        current_balance = await _getbalanceof(user_wallet_pub);
        if (current_balance.status == true) {
            if (current_balance.bnb < calculategas.gasfee/10**decimals.value) {
                response_data = {
                    'status' : false,
                    'message' : 'Insufficient BNB for paying gasfee in user wallet',
                    'error' : 'Insufficient BNB for paying gasfee in user wallet'
                };
                return response_data;
            }
        } else {
            response_data = {
                'status' : false,
                'message' : "Something bad happened. Please try again!",
                'error' : "Coudnt fetch user balance"
            };
            return response_data;
        }

        const nonce = await web3.eth.getTransactionCount(user_wallet_pub, "latest") //get latest nonce

        if (sendTokenToAdminNonceOBJ.hasOwnProperty(user_wallet_pub)) {
            var withdrawTokennonce = sendTokenToAdminNonceOBJ[user_wallet_pub];
            if (nonce == 0 && withdrawTokennonce == 0) {
                sendTokenToAdminNonceOBJ[user_wallet_pub] = nonce;
            } else if (nonce == 0 && withdrawTokennonce > 0) {
                sendTokenToAdminNonceOBJ[user_wallet_pub] = withdrawTokennonce + 1;
            } else if (nonce != 0) {
                if (withdrawTokennonce >= nonce) {
                    sendTokenToAdminNonceOBJ[user_wallet_pub] = withdrawTokennonce + 1;
                } else {
                    sendTokenToAdminNonceOBJ[user_wallet_pub] = nonce;
                }
            }
        } else {
            sendTokenToAdminNonceOBJ[user_wallet_pub] = nonce;
        }

        const tx = {
            from: user_wallet_pub,
            to: contract_addr,
            nonce: sendTokenToAdminNonceOBJ[user_wallet_pub],
            gas: calculategas.gasused,
            data: INSTANCE.methods.transfer(admin_wallet_pub, sendamount).encodeABI(),
        }
        const signPromise = await web3.eth.accounts.signTransaction(tx, user_wallet_pvt)
        return new Promise(
            (resolve, reject) => {
                const sentTx = web3.eth.sendSignedTransaction(signPromise.rawTransaction || signPromise.raw);
                sentTx.on('transactionHash', (transactionHash) => {
                    response_data = {
                        'status' : true,
                        'from' : user_wallet_pub,
                        'to' : admin_wallet_pub,
                        'amount' : current_balance.token,
                        'message' : 'Tokens sent to admin successfully',
                        'transactionHash': transactionHash,
                    };
                    write_log(`send Tokens to admin out : status=true , transactionHash = ${transactionHash}`)
                    if(nonce == 0 && withdrawTokennonce == 0){
                        sendTokenToAdminNonceOBJ[user_wallet_pub] += 1;
                    }
                    resolve(response_data);
                });
                sentTx.on('error',  (error) => {
                    response_data = {
                        'status' : false,
                        'from' : user_wallet_pub,
                        'to' : admin_wallet_pub,
                        'amount' : current_balance.token,
                        'message' : 'Token sending failed. Try again',
                        'error' : error.message
                    };
                    write_log(`send Tokens to admin out : status=false , error = ${error.message}`)
                    reject(response_data);
                });
            }
        );
    } catch(error) {
        write_log("send Tokens : " + (error ?? error.message))
        response_data = {
            'status' : false,
            'from' : user_wallet_pub,
            'to' : admin_wallet_pub,
            'amount' : current_balance.token,
            'message' : "Something bad happened. Please try again!",
            'error' : error.message
        };
        return response_data;
    }


    
}


module.exports = {
    _createAccount,
    _getname,
    _getsymbol,
    _getdecimels,
    _totalsupply,
    _getmybalance,
    _calculateGas,
    _getbalanceof,
    _isValid,
    _sendTokens,
    _checkTransaction,
    _sendGas,
    _sendTokentoAdmin
};