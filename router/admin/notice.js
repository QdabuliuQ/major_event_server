const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    addBackNotice,
    getBackNotice,
    getBackNoticeDetail,
    updateBackNotice,
    addReceNotice,
    getReceNotice,
    updateNoticeAppStatus,
    getReceNoticeDetail,
    updateReceNotice
} = require('../../router_handler/admin/notice')
const {
    add_back_notice_schema,
    add_rece_notice_schema,
    update_notice_status_schema
} = require('../../schema/admin/notice')
const router = express.Router()

// 添加后台公告
router.post('/addBackNotice', expressJoi(add_back_notice_schema), addBackNotice)

// 获取后台公告
router.post('/getBackNotice', getBackNotice)

// 获取后台公告详情
router.post('/getBackNoticeDetail', getBackNoticeDetail)

// 修改后台公告
router.post('/updateBackNotice', expressJoi(add_back_notice_schema), updateBackNotice)

// 添加前台公告
router.post('/addReceNotice', expressJoi(add_rece_notice_schema), addReceNotice)

// 获取后台公告
router.post('/getReceNotice', getReceNotice)

// 审核前台公告
router.post('/updateNoticeAppStatus', expressJoi(update_notice_status_schema), updateNoticeAppStatus)

// 获取后台公告详情
router.post('/getReceNoticeDetail', getReceNoticeDetail)

// 修改后台公告
router.post('/updateReceNotice', expressJoi(add_back_notice_schema), updateReceNotice)

module.exports = router