const web3_functions = require("../services/web3_functions");
const encryption = require("../utils/encryption");

const ping = (req, res) => {
    res.send("pong");
};

const generate_Address =  async (request, response) => {
    try{
        var wallet =  await web3_functions._createAccount();
        if (wallet.status == true) {
            return response.json({
                status: true,
                message: wallet.message,
                address : wallet.value.address,
                private_key : wallet.value.privateKey,
            });
        } else {
            return response.json({
                status: false,
                message: wallet.message,
                error: wallet.error
            });
        }
    }catch(error){
        return response.json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

const getTokenName =  async (request, response) => {
    try{
        var name =  await web3_functions._getname();
        if (name.status == true) {
            return response.json({
                status: true,
                name : name.value,
            });
        } else {
            return response.json({
                status: false,
                message : name.message,
                error : name.error
            });
        }
    } catch (error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });;
    }
};

const getTokenSymbol =  async (request, response) => {
    try{
        var symbol =  await web3_functions._getsymbol();
        if (symbol.status == true) {
            return response.json({
                status: true,
                symbol : symbol.value,
            });
        } else {
            return response.json({
                status: false,
                message : symbol.message,
                error : symbol.error
            });
        }
    }catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

const getTokenDecimels = async (request, response) => {
    try{
        var decimels =  await web3_functions._getdecimels();
        if (decimels.status == true) {
            return response.json({
                status: true,
                decimels : decimels.value
            });
        } else {
            return response.json({
                status: false,
                message : decimals.message,
                error : decimals.error
            });
        }
    }catch (error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

const getTokenSupply =  async(request, response) => {
    try{
        var supply =  await web3_functions._totalsupply();
        if (supply.status == true) {
            return response.json({
                status: true,
                supply : supply.value
            });
        } else {
            return response.json({
                status: false,
                message : supply.message,
                error : supply.error
            });
        }
    } catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

const getMyBalance =  async (request, response) => {
    try{
        var mybalance =  await web3_functions._getmybalance();
        if (mybalance.status == true) {
            return response.json({
                status: true,
                TOKENbalance : mybalance.token,
                BNBbalance : mybalance.bnb
            });
        } else {
            return response.json({
                status: false,
                message : mybalance.message,
                error : mybalance.error
            });
        }
    } catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

// const calculateGas = async (request, response) => {

//     try{
//         var calculategas = await web3_functions._calculateGas();
//         if(calculategas.status == true){
//             return response.json({
//                 status: true,
//                 gasfee: calculategas.gasfee
//             }); 
//         }else{
//             return response.json({
//                 status: false,
//                 message: calculategas.message,
//                 error: calculategas.error
//             });
//         }
//     }catch(error){
//         return response.json({
//             status: false,
//             message : "Something went wrong",
//             error : error.message
//         }); 
//     }
// };

const userBalance = async (request, response) => {
    var address = request.body.address;
    
    if(!address){
        return response.json({
            status: false,
            message: 'address parameter missing',
            error: 'address parameter missing'
         }); 
    }

    try{
        var balanceof = await web3_functions._getbalanceof(address);
        if (balanceof.status == true) {
            return response.json({
                status: true,
                address: address,
                TOKENbalance : balanceof.token,
                BNBbalance : balanceof.bnb
            });
        } else {
            return response.json({
                status: false,
                message : balanceof.message,
                error : balanceof.error
            });
        }
    }catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

const isValidAddress = async (request, response) => {
    var address = request.body.address;
    
    if(!address){
        return response.json({
            status: false,
            message: 'address parameter missing',
            error: 'address parameter missing'
        });
    }
    
    try{
        var isvalid = await web3_functions._isValid(address);
        if (isvalid.status == true) {
            return response.json({
                status: true,
                address: address
            });
        } else {
            return response.json({
                status: false,
                address: address,
                message: isvalid.message,
                error: isvalid.error
            });
        }
    }catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        });
    }
};

const transferTokens = async (request, response) => {
    var recipient = request.body.recipient;
    var amount = request.body.amount;
    var admin_wallet_pub = request.body.admin_wallet_pub;
    // var admin_wallet_pvt = encryption._decrypt(request.body.admin_wallet_pvt);
    var admin_wallet_pvt = request.body.admin_wallet_pvt;

    if(!recipient || !amount || !admin_wallet_pub || !admin_wallet_pvt){
        return response.json({
           status: false,
           message: 'Some required parameter missing',
           error: 'Some required parameter missing'
          }); 
    }

    try{
        var sendtokens = await web3_functions._sendTokens(recipient, amount, admin_wallet_pub, admin_wallet_pvt);
        if(sendtokens.status == true){
            return response.json({
                status: true,
                from : sendtokens.from,
                to : sendtokens.to,
                amount : sendtokens.amount,
                message: sendtokens.message,
                transaction_id : sendtokens.transactionHash,
                block_number : sendtokens.block_number
            }); 
        }else{
            return response.json({
                status: false,
                from : sendtokens.from,
                to : sendtokens.to,
                amount : sendtokens.amount,
                message: sendtokens.message,
                error: sendtokens.error
            });
        }
    }catch(error){
        return response.json({
            status: false,
            message : "Something went wrong",
            error : error.message
        }); 
    }
};


module.exports = {
    ping,
    generate_Address,
    getTokenName,
    getTokenSymbol,
    getTokenDecimels,
    getTokenSupply,
    getMyBalance,
    // calculateGas,
    userBalance,
    isValidAddress,
    transferTokens,
};