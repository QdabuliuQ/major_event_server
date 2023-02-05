const db = require('../../db/index')
const bcrypt = require('bcryptjs')
const {
  pageSize
} = require('../../config')
const {
  uuid,
} = require('../../tools')

// 获取文章分类
exports.getArticleCates = (req, res) => {

  let limitSql = req.body.limit && req.body.offset ? `limit ${(parseInt(req.body.offset) - 1) * req.body.limit}, ${req.body.limit}` : ``
  let val = req.body.val ? req.body.val : ''
  let valSql = `(id like '%${val}%' or name like '%${val}%' or alias like '%${val}%' or ev_a.desc like '%${val}%')`

  let is_deleteSql = ''
  if(req.body.is_delete) {
    is_deleteSql = `(is_delete = ${req.body.is_delete})`
  } else {
    is_deleteSql = `(is_delete <> -1)`
  }

  let timeSql = ''
  if(req.body.startTime && req.body.endTime) {
    timeSql = `(time between ${req.body.startTime} and ${req.body.endTime})`
  } else {
    timeSql = `(time between 0 and ${Date.now()})`
  }

  const sqlStr = `select * from ev_article_cate  ev_a where ${valSql} and ${is_deleteSql} and ${timeSql} order by time desc ${limitSql}`
  db.query(sqlStr, (err, results) => {
    if(err) return res.cc(err)
    let data = results
    const sqlStr = `select count(*) as count from ev_article_cate ev_a where ${valSql} and ${is_deleteSql} and ${timeSql}`
    db.query(sqlStr, (err, results) => {
      res.send({
        status: 0,
        msg: '获取分类信息成功',
        data,
        count: results && results.length ? results[0].count : 0
      })
    })
  })
}

// 添加分类
exports.addArticleCates = (req, res) => {
  if(!bcrypt.compareSync(req.body.password, req.adminData.password)) return res.cc('验证密码错误')

  const sqlStr = 'select * from ev_article_cate where name=? or alias=?'
  db.query(sqlStr, [req.body.name, req.body.alias], (err, results) => {
    if(err) return res.cc(err)
    // 判断多种被占用情况
    if(results.length == 2) return res.cc('分类名称和分类别名被占用')
    if(results.length == 1 && results[0].name == req.body.name && results[0].alias == req.body.alias) {
      return res.cc('分类名称和分类别名被占用')
    }
    if(results.length == 1 && results[0].name == req.body.name) {
      return res.cc('分类名称被占用')
    }
    if(results.length == 1 && results[0].alias == req.body.alias) {
      return res.cc('分类别名被占用')
    }

    req.body.id = uuid(5)
    const sqlStr = 'insert into ev_article_cate set ?'
    db.query(sqlStr, {
      id: uuid(6),
      name: req.body.name,
      alias: req.body.alias,
      desc: req.body.desc,
      time: Date.now(),
    }, (err, results) => {
      if(err) return res.cc(err)
      if(results.affectedRows != 1) return res.cc('添加分类信息失败')
      res.cc('添加分类信息成功', 0)
    })
  })
}

// 删除文章
exports.updateCateStatus = (req, res) => {
  const sqlStr = 'update ev_article_cate set is_delete=? where id=?'
  db.query(sqlStr, [req.params.is_delete, req.params.id], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows != 1) return res.cc('删除分类信息失败')

    res.cc((req.params.is_delete ? '禁用':'还原') + '分类信息成功', 0)
  })
}

// 获取分类信息
exports.getCateInfoById = (req, res) => {
  const sqlStr = 'select * from ev_article_cate where id=?'
  db.query(sqlStr, req.params.id, (err, results) => {
    if(err) return res.cc(err)
    if(results.length != 1) return res.cc('获取分类信息失败')

    res.send({
      status: 0,
      msg: '获取分类信息成功',
      data: results[0]
    })
  })
}

// 更新分类信息
exports.updateCateById = (req, res) => {
  if(bcrypt.compareSync(req.body.password, req.adminData.password)) {
    // 查询是否存在名称或者别名被占用
    const sqlStr = 'select * from ev_article_cate where id<>? and (name=? or alias=?)'
    db.query(sqlStr, [req.body.id, req.body.name, req.body.alias], (err, results) => {
      if(err) return res.cc(err)
      if(results.length) return res.cc('分类别名或名称被占用')
      delete req.body.password  // 去除验证密码
      const sqlStr = 'update ev_article_cate set ? where id=?'
      db.query(sqlStr, [req.body, req.body.id], (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('更新分类信息失败')

        res.cc('更新分类信息成功', 0)
      })
    })
  } else {
    res.cc('验证密码错误')
  }
}

// 获取分类标签
exports.getCateTarget = (req, res) => {
  let limitSql = ''
  if(req.params.limit && req.params.offset) {
    limitSql = `limit ${(parseInt(req.params.offset) - 1) * req.params.limit}, ${req.params.limit}`
  } else {
    limitSql = ''
  }

  const sqlStr = `select * from ev_cate_target where cate_id=? and is_delete=0 order by time desc ${limitSql}`
  db.query(sqlStr, req.params.id, (err, results) => {
    if(err) return res.cc(err)
    let data = results
    const sqlStr = 'select count(*) as count from ev_cate_target where cate_id=? and is_delete=0 order by time desc'
    db.query(sqlStr, req.params.id, (err, results) => {
      if(err) return res.cc(err)
      let targetCount = results && results.length ? results[0].count : 0
      res.send({
        status: 0,
        msg: '获取分类标签成功',
        data,
        count: targetCount,
        noMore: parseInt(req.params.offset)*req.params.limit >= targetCount
      })
    })
  })
}

// 添加标签
exports.addCateTarget = (req, res) => {
  const sqlStr = 'select * from ev_cate_target where cate_id=? and name = ?'
  db.query(sqlStr, [req.body.cate_id, req.body.name], (err, results) => {
    if(results.length >= 1) return res.cc('标签名称不能重复')
    const sqlStr = 'insert into ev_cate_target set ?'
    db.query(sqlStr, {
      id: uuid(12),
      cate_id: req.body.cate_id,
      name: req.body.name,
      time: Date.now()
    }, (err, results) => {
      if(err) return res.cc(err)
      if(results.affectedRows != 1) return res.cc('添加分类标签失败')

      res.cc('添加分类标签成功', 0)
    })
  })
}

// 删除分类标签
exports.deleteCateTarget = (req, res) => {
  const sqlStr = 'update ev_cate_target set is_delete=1 where id=? and cate_id=?'
  db.query(sqlStr, [req.body.id, req.body.cate_id], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows != 1) return res.cc('删除分类标签失败')

    res.cc('删除分类标签成功', 0)
  })
}