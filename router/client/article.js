const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
    getArticleCate,
    addArticle,
    getArticleDetail,
    getArticleList,
    getArticleParams,
    praiseArticle,
    collectArticle,
    pubArticleComment,
    getArticleComment,
    getCommentFloor,
    getCommentDetail,
    praiseComment,
    getArticleById,
    deleteArticleById
} = require('../../router_handler/client/h_article')
const {
    add_article_schema,
    pub_article_comment_schema,
    delete_article_by_id_schema
} = require('../../schema/client/s_article')

const router = express.Router()

router.get('/getArticleCate', getArticleCate)

// 发布文章
router.post('/addArticle', expressJoi(add_article_schema), addArticle)

// 获取文章详情
router.get('/getArticleDetail/:id', getArticleDetail)

// 获取文章信息参数
router.get('/getArticleParams/:id', getArticleParams)

// 点赞/取消点赞文章
router.post('/praiseArticle', praiseArticle)

// 收藏/取消收藏文章
router.post('/collectArticle', collectArticle)

// 获取所有文章
router.get('/getArticleList', getArticleList)

// 发表评论
router.post('/pubArticleComment', expressJoi(pub_article_comment_schema), pubArticleComment)

// 获取文章评论
router.get('/getArticleComment', getArticleComment)

// 获取评论详情
router.get('/getCommentDetail', getCommentDetail)

// 获取楼层评论
router.get('/getCommentFloor', getCommentFloor)

// 点赞评论
router.post('/praiseComment', praiseComment)

// 获取文章
router.get('/getArticleById', getArticleById)

// 删除文章
router.post('/deleteArticleById', expressJoi(delete_article_by_id_schema), deleteArticleById)

module.exports = router