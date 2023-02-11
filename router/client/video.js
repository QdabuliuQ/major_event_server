const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    pubVideo,
    getVideoList,
    praiseVideo,
    collectVideo,
    pubVideoComment,
    getVideoComment,
    praiseComment
} = require('../../router_handler/client/h_video')
const {
    pub_video_schema,
    pub_video_comment_schema,
    praise_comment_schema
} = require('../../schema/client/s_video')
const router = express.Router()

router.post('/pubVideo', expressJoi(pub_video_schema), pubVideo)

router.get('/getVideoList', getVideoList)

// 点赞/取消点赞video
router.get('/praiseVideo', praiseVideo)

// 收藏/取消收藏video
router.get('/collectVideo', collectVideo)

// 发布评论
router.post('/pubVideoComment', expressJoi(pub_video_comment_schema), pubVideoComment)

// 获取评论
router.get('/getVideoComment', getVideoComment)

// 点赞/取消点赞评论
router.post('/praiseComment', expressJoi(praise_comment_schema), praiseComment)

module.exports = router