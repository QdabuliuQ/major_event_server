const express = require('express')
const {
    getCollectList
} = require('../../router_handler/client/h_collect')

const router = express.Router()

// 获取用户收藏列表
router.get('/getCollectList/:offset', getCollectList)

module.exports = router