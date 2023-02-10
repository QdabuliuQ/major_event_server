const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    pubVideo,
    getVideoList,
    praiseVideo,
    collectVideo,
} = require('../../router_handler/client/h_video')
const {
    pub_video_schema
} = require('../../schema/client/s_video')
const router = express.Router()

router.post('/pubVideo', expressJoi(pub_video_schema), pubVideo)

router.get('/getVideoList', getVideoList)

// 点赞/取消点赞video
router.get('/praiseVideo', praiseVideo)

// 收藏/取消收藏video
router.get('/collectVideo', collectVideo)

module.exports = router