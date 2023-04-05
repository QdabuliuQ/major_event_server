const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    add_report_schema,
    add_comment_report_schema,
	add_message_report_schema
} = require('../../schema/client/s_report')
const {
    addReport,
    addCommentReport,
    getArticleReportList,
    getVideoReportList,
    getCommentReportList,
    getArticleReportDetail,
	addMessageReport,
	getMessageReportList
} = require('../../router_handler/client/h_report')
const { getReportReason } = require("../../router_handler/admin/report");
const router = express.Router()

// 举报文章
router.post('/addReport', expressJoi(add_report_schema), addReport)

// 获取举报理由
router.get('/getReportReason', getReportReason)

// 举报评论
router.post('/addCommentReport', expressJoi(add_comment_report_schema), addCommentReport)

// 获取文章举报记录
router.get('/getArticleReportList', getArticleReportList)

// 获取视频举报记录
router.get('/getVideoReportList', getVideoReportList)

// 获取评论举报记录
router.get('/getCommentReportList', getCommentReportList)

// 获取举报详情
router.get('/getArticleReportDetail/:id', getArticleReportDetail)

// 举报消息
router.post('/addMessageReport', expressJoi(add_message_report_schema), addMessageReport)

// 获取消息举报记录
router.get('/getMessageReportList', getMessageReportList)

module.exports = router