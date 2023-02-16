const express = require('express')
const {
    getCollectList,
    getCollectVideo
} = require('../../router_handler/client/h_collect')

const router = express.Router()

// 获取用户收藏列表
router.get('/getCollectList/:offset', getCollectList)

// 获取用户视频收藏
router.get('/getCollectVideo', getCollectVideo)

module.exports = router