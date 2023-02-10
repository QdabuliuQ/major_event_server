const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    getVideoList,
    updateVideoState,
    getVideoPraise,
    getVideoCollect
} = require('../../router_handler/admin/video')
const {
    update_video_state_schema
} = require('../../schema/admin/video')
const router = express.Router()

router.get('/getVideoList', getVideoList)

// 通过/封禁视频
router.post('/updateVideoState', expressJoi(update_video_state_schema), updateVideoState)

// 获取视频点赞用户
router.get('/getVideoPraise', getVideoPraise)

// 获取视频收藏用户
router.get('/getVideoCollect', getVideoCollect)

module.exports = router