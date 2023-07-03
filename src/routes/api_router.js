const express = require("express");
const router = express.Router();

const api_controller = require("../controllers/api_controller")

router.get("/ping", api_controller.ping)

router.get("/generate_address", api_controller.generate_Address)

router.get("/name", api_controller.getTokenName)

router.get("/symbol", api_controller.getTokenSymbol)

router.get("/decimels", api_controller.getTokenDecimels)

router.get("/supply", api_controller.getTokenSupply)

router.get("/mybalance", api_controller.getMyBalance)

// router.get("/calculategas", api_controller.calculateGas)

router.post("/userbalance", api_controller.userBalance)

router.post("/isvalid", api_controller.isValidAddress)

router.post("/transfer", api_controller.transferTokens)



module.exports = router;