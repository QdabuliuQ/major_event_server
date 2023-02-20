const express = require('express')
const {
    getWebsiteData,
    getBackNoticeList,
    getReceNoticeList,
    getCateData,
    getUserRegion
} = require('../../router_handler/admin/index')
const router = express.Router()

// 获取网站数据
router.get('/getWebsiteData', getWebsiteData)

// 获取后台公告
router.get('/getBackNoticeList', getBackNoticeList)

// 获取前台公告
router.get('/getReceNoticeList', getReceNoticeList)

// 获取文章分类数据
router.get('/getCateData', getCateData)

// 获取用户分布
router.get('/getUserRegion', getUserRegion)

module.exports = router