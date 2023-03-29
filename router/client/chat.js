const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
	addChatObject,
	addMessageRecord,
	getMessageList,
	getChatObject
} = require('../../router_handler/client/h_chat')
const {
	add_chat_object_schema,
	add_message_record_schema
} = require('../../schema/client/s_chat')
const router = express.Router()

// 添加聊天室
router.post('/addChatObject', expressJoi(add_chat_object_schema), addChatObject)

// 发送消息
router.post('/addMessageRecord', expressJoi(add_message_record_schema), addMessageRecord)

// 获取聊天记录
router.post('/getMessageList', getMessageList)

// 获取聊天室
router.post('/getChatObject', getChatObject)

module.exports = router