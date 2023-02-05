const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    add_article_report_schema,
    add_comment_report_schema
} = require('../../schema/client/s_report')
const {
    addArticleReport,
    addCommentReport
} = require('../../router_handler/client/h_report')
const { getReportReason } = require("../../router_handler/admin/report");
const router = express.Router()

// 举报文章
router.post('/addArticleReport', expressJoi(add_article_report_schema), addArticleReport)

// 获取举报理由
router.get('/getReportReason', getReportReason)

// 举报评论
router.post('/addCommentReport', expressJoi(add_comment_report_schema), addCommentReport)

module.exports = router