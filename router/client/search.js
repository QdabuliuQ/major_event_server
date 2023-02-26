const express = require('express')
const {
    getAllSearch,
    getArticleSearch,
    getVideoSearch,
    getUserSearch
} = require("../../router_handler/client/h_search");

const router = express.Router()

// 搜索全部内容
router.get('/getAllSearch', getAllSearch)

// 搜索文章
router.get('/getArticleSearch', getArticleSearch)

// 搜索视频
router.get('/getVideoSearch', getVideoSearch)

// 搜索用户
router.get('/getUserSearch', getUserSearch)

module.exports = router