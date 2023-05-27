const express = require('express')
const expressJoi = require('@escook/express-joi')
const router = express.Router()
const {
	getMessageList,
	deleteMessageById,
	getVideoUrlById,
	getArticleById,
	getRoomMessage,
	getMessageReport,
	updateReportState
} = require('../../router_handler/admin/message')
const {
	update_report_state_schema
} = require('../../schema/admin/message')

// 获取消息列表
router.get('/getMessageList', getMessageList)

// 删除消息
router.post('/deleteMessageById', deleteMessageById)

// 获取视频消息
router.get('/getVideoUrlById', getVideoUrlById)

// 获取文章消息
router.get('/getArticleById', getArticleById)

// 获取房间消息
router.get('/getRoomMessage', getRoomMessage)

// 获取消息举报
router.get('/getMessageReport', getMessageReport)

// 更新举报状态
router.post('/updateReportState', expressJoi(update_report_state_schema), updateReportState)

module.exports = router