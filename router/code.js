const express = require('express')
const {getCode} = require("../router_handler/code");

const router = express.Router()

router.get('/getCode', getCode)

module.exports = router