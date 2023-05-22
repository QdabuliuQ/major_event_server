const express = require('express')
const router = express.Router()
const {
    getCommentList,
    deleteComment,
    getCommentFloor,
    getVideoCommentList,
    deleteVideoComment,
	getEventCommentList,
	deleteEventComment
} = require('../../router_handler/admin/comment')
const {
    getArticleDetail,
} = require("../../router_handler/client/h_article");

// 获取评论列表
router.get('/getCommentList', getCommentList)

// 获取文章详情
router.get('/getArticleDetail/:id', getArticleDetail)

// 删除评论
router.post('/deleteComment', deleteComment)

// 获取回复评论
router.get('/getCommentFloor', getCommentFloor)

// 获取视频评论
router.get('/getVideoCommentList', getVideoCommentList)

// 删除评论
router.post('/deleteVideoComment', deleteVideoComment)

// 获取动态评论
router.get('/getEventCommentList', getEventCommentList)

// 删除动态评论
router.post('/deleteEventComment', deleteEventComment)

module.exports = router