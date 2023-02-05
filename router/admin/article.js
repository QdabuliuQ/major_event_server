// 文章路由模块
const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
  addArticle,
  getArticleList,
  updateArticleState
} = require('../../router_handler/admin/article')
const {
  add_article_schema,
  update_article_state_schema
} = require('../../schema/admin/article')

const router = express.Router()

// 发布文章路由
router.post('/add', expressJoi(add_article_schema), addArticle)

// 获取所有文章
router.post('/getArticleList', getArticleList)

// 修改文章状态
router.post('/updateArticleState', expressJoi(update_article_state_schema), updateArticleState)

module.exports = router
