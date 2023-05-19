const express = require('express')
const {
    getPraiseList,
    getBrowseList,
	getVideoPraiseList
} = require('../../router_handler/client/h_praise')
const router = express.Router()

// 获取用户点赞列表
router.get('/getPraiseList/:offset', getPraiseList)

// 获取用户浏览记录
router.get('/getBrowseList/:offset', getBrowseList)

// 获取用户点赞视频列表
router.get('/getVideoPraiseList/:offset', getVideoPraiseList)

module.exports = router