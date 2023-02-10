// 用户信息相关模块
const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
  getUserInfoById,
  updateUserInfo,
  updatePassword,
  updateAvatar,
  getArticleById,
  getCollectArticleById,
  getBrowseArticleById,
  getPraiseArticleById,
  getVideoById,
  getCollectVideoById,
  getPraiseVideoById
} = require('../../router_handler/admin/userInfo')
const {
  update_userInfo_schema,
  update_password_schema,
  update_avatar_schema
} = require('../../schema/admin/user')
const router = express.Router()

// 获取用户信息
router.get('/getUserInfoById', getUserInfoById)

// 修改用户信息
router.post('/userInfo', expressJoi(update_userInfo_schema), updateUserInfo)

// 修改密码
router.post('/updatePwd', expressJoi(update_password_schema), updatePassword)

// 修改头像
router.post('/update/avatar', expressJoi(update_avatar_schema), updateAvatar)

// 获取发布文章
router.get('/getArticleById', getArticleById)

// 获取收藏文章
router.get('/getCollectArticleById', getCollectArticleById)

// 获取文章浏览
router.get('/getBrowseArticleById', getBrowseArticleById)

// 获取文章点赞
router.get('/getPraiseArticleById', getPraiseArticleById)

// 获取发布视频
router.get('/getVideoById', getVideoById)

// 获取视频收藏
router.get('/getCollectVideoById', getCollectVideoById)

// 获取视频点赞
router.get('/getPraiseVideoById', getPraiseVideoById)

module.exports = router