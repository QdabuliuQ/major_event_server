const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    pubVideo,
    getVideoList
} = require('../../router_handler/client/h_video')
const {
    pub_video_schema
} = require('../../schema/client/s_video')
const router = express.Router()

router.post('/pubVideo', expressJoi(pub_video_schema), pubVideo)

router.get('/getVideoList', getVideoList)

module.exports = router