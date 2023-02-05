// 文章分类
const express = require('express')
const expressJoi = require('@escook/express-joi')
const {
  getArticleCates,
  addArticleCates,
  updateCateStatus,
  getCateInfoById,
  updateCateById,
  getCateTarget,
  addCateTarget,
  deleteCateTarget
} = require('../../router_handler/admin/artcate')
const {
  add_cate_schema,
  delete_cate_schema,
  get_cate_schema,
  update_cate_schema,
  add_cate_target_schema
} = require('../../schema/admin/artcate')

const router = express.Router()

// 获取文章分类
router.post('/getArticleCates', getArticleCates)

// 新增文章分类
router.post('/addArticleCates', expressJoi(add_cate_schema), addArticleCates)

// 更新文章分类状态
// :id 动态参数 通过 req.params 获取
router.get('/updateCateStatus/:id/:is_delete', expressJoi(delete_cate_schema), updateCateStatus)

// 根据id获取文章分类数据
router.get('/cates/:id', expressJoi(get_cate_schema), getCateInfoById)
 
// 根据id更新分类信息
router.post('/updateCateById', expressJoi(update_cate_schema), updateCateById)

// 获取分类标签
router.get('/getCateTarget/:id/:limit/:offset', getCateTarget)

// 添加分类标签
router.post('/addCateTarget', expressJoi(add_cate_target_schema), addCateTarget)

// 删除分类标签
router.post('/deleteCateTarget', deleteCateTarget)
module.exports = router