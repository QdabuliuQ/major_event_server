const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    getReportList,
    updateReportState,
    getReportReason,
    addReportReason,
    deleteReportReason,
    getCommentReportList,
    updateCommentReportState,
    getVideoReportList
} = require('../../router_handler/admin/report')
const {
    update_report_state_schema,
    add_report_reason_schema,
	update_comment_report_state_schema,
} = require('../../schema/admin/report')
const router = express.Router()

// 获取举报列表
router.get('/getReportList', getReportList)

// 更新举报状态
router.post('/updateReportState', expressJoi(update_report_state_schema), updateReportState)

// 获取举报理由
router.get('/getReportReason', getReportReason)

// 添加举报理由
router.post('/addReportReason', expressJoi(add_report_reason_schema), addReportReason)

// 删除举报理由
router.post('/deleteReportReason', deleteReportReason)

// 获取评论举报
router.get('/getCommentReportList', getCommentReportList)

// 更新评论举报状态
router.post('/updateCommentReportState', expressJoi(update_comment_report_state_schema), updateCommentReportState)

// 获取视频举报列表
router.get('/getVideoReportList', getVideoReportList)

module.exports = router