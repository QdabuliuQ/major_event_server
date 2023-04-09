const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
	pub_event_schema
} = require('../../schema/client/s_event')
const {
	pubEvent,
	getEventListById
} = require('../../router_handler/client/h_event')
const router = express.Router()

router.post('/pubEvent', expressJoi(pub_event_schema), pubEvent)

router.get('/getEventListById', getEventListById)

module.exports = router