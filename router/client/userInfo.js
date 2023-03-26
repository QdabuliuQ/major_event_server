const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    getUserInfo,
    updateUserInfo,
    getUserInfoById,
    getUserArticleById,
    getUserCollectById,
    updateFollowUser,
    getUserFollow,
    getUserFans,
    getUserVideoById,
    getUserCollectVideoById
} = require('../../router_handler/client/h_userInfo')
const {
	getReceNoticeList
} = require('../../router_handler/admin/index')
const {
	getReceNoticeDetail
} = require('../../router_handler/admin/notice')
const {
    update_user_info_schema,
    update_follow_user_schema
} = require('../../schema/client/s_userInfo')

const router = express.Router()

// 获取用户信息
router.get('/getUserInfo', getUserInfo)

// 更新用户信息
router.post('/updateUserInfo', expressJoi(update_user_info_schema), updateUserInfo)

// 获取用户信息
router.get('/getUserInfoById/:id', getUserInfoById)

// 获取用户发布文章
router.get('/getUserArticleById', getUserArticleById)

// 获取用户收藏文章
router.get('/getUserCollectById', getUserCollectById)

// 获取用户收藏视频
router.get('/getUserCollectVideoById', getUserCollectVideoById)

// 获取用户发布视频
router.get('/getUserVideoById', getUserVideoById)

// 关注/取消关注用户
router.post('/updateFollowUser', expressJoi(update_follow_user_schema), updateFollowUser)

// 获取用户关注
router.get('/getUserFollow', getUserFollow)

// 获取用户粉丝
router.get('/getUserFans', getUserFans)

// 获取前台公告
router.get('/getReceNoticeList', getReceNoticeList)

// 获取公告详情
router.post('/getReceNoticeDetail', getReceNoticeDetail)

module.exports = router