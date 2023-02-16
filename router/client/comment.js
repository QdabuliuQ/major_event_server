const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    getCommentById,
    deleteCommentById
} = require("../../router_handler/client/h_comment");
const {
    get_comment_by_id_schema,
    delete_comment_by_id_schema
} = require('../../schema/client/s_comment')
const router = express.Router()

router.get('/getCommentById', expressJoi(get_comment_by_id_schema), getCommentById)

// 删除评论
router.post('/deleteCommentById', expressJoi(delete_comment_by_id_schema), deleteCommentById)

module.exports = router