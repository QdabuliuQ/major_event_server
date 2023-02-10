const db = require('../../db/index')  // 数据库实例
const bcrypt = require('bcryptjs')  // 密码校验
const { oss, pageSize} = require('../../config')
const { cutUrl } = require('../../tools')

exports.getUserInfoById = (req, res) => {
  // sql语句 不能将密码返回
  const sqlStr = 'select * from ev_users where id=?'
  // express-jwt中间件会解析token 然后放在req.user当中
  db.query(sqlStr, req.query.id, (err, results) => {
    if (err) return res.cc(err)
    if(results.length != 1) return res.cc('获取用户信息失败')
    delete results[0].password
    results[0].user_pic = oss + results[0].user_pic
    results[0].bg_image = oss + results[0].bg_image
    res.send({
      status: 0,
      msg: '获取用户信息成功',
      data: results[0]
    })
  })
}

// 更新用户信息
exports.updateUserInfo = (req, res) => {
  const sqlStr = 'update ev_users set ? where id=?'
  let body = req.body
  body.user_pic = cutUrl(body.user_pic)
  body.bg_image = cutUrl(body.bg_image)
  console.log(body)
  db.query(sqlStr, [body, req.body.id], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows != 1) return res.cc('更新用户信息失败')

    res.cc('更新用户信息成功', 0)
  })
}

// 更新密码
exports.updatePassword = (req, res) => {
  // 用户传入的密码 和 数据库返回的密码进行比较
  const compareResult = bcrypt.compareSync(req.body.oldPwd, req.userData.password)
  if (!compareResult) {
    return res.cc('旧密码错误')
  }

  // 旧密码正确则进行修改
  const sqlStr = 'update ev_users set password=? where id=?'
  // 新密码加密
  const newPww = bcrypt.hashSync(req.body.newPwd, 8)
  // 执行修改密码sql
  db.query(sqlStr, [newPww, req.user.id], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows != 1) return res.cc('修改密码失败')

    res.cc('修改密码成功', 0)
  })
}

// 更新用户头像
exports.updateAvatar = (req, res) => {
  // 修改头像
  const sqlStr = 'update ev_users set user_pic=? where id=?'
  db.query(sqlStr, [req.body.avatar, req.user.id], (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows != 1) return res.cc('修改用户信息失败')

    res.cc('修改用户信息成功', 0)
  })
}

exports.getArticleById = (req, res) => {
  const sqlStr = 'select ev_a.*, ev_ac.name as cate_name from ev_articles ev_a join ev_article_cate ev_ac on ev_a.cate_id=ev_ac.id where author_id=? order by ev_a.pub_date desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.cover_img = oss + item.cover_img
      item.targets = JSON.parse(item.targets)
      item.desc = item.content.replace(/<[^>]+>/ig, '')
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_articles where author_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取文章列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getCollectArticleById = (req, res) => {
  const sqlStr = 'select ev_a.* from ev_article_collect_record ev_acr join ev_articles ev_a on ev_acr.art_id = ev_a.id where ev_acr.user_id=? order by ev_acr.time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.cover_img = oss + item.cover_img
      item.desc = item.content.replace(/<[^>]+>/ig, '')
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_article_collect_record where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取收藏列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getBrowseArticleById = (req, res) => {
  const sqlStr = 'select ev_a.* from ev_article_browse_record ev_abr join ev_articles ev_a on ev_abr.art_id = ev_a.id where ev_abr.user_id=? order by ev_abr.time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.cover_img = oss + item.cover_img
      item.desc = item.content.replace(/<[^>]+>/ig, '')
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_article_browse_record where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取浏览列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getPraiseArticleById = (req, res) => {
  const sqlStr = 'select ev_a.* from ev_article_praise_record ev_apr join ev_articles ev_a on ev_apr.art_id = ev_a.id where ev_apr.user_id=? order by ev_apr.time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.cover_img = oss + item.cover_img
      item.desc = item.content.replace(/<[^>]+>/ig, '')
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_article_praise_record where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取点赞列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getVideoById = (req, res) => {
  const sqlStr = 'select * from ev_videos where user_id=? order by time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.video_url = oss + item.video_url
      item.cover_img = oss + item.cover_img
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_videos where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取视频列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getCollectVideoById = (req, res) => {
  const sqlStr = 'select ev_v.* from ev_video_collect_record ev_vcr join ev_videos ev_v on ev_vcr.video_id = ev_v.id where ev_vcr.user_id=? order by ev_vcr.time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.video_url = oss + item.video_url
      item.cover_img = oss + item.cover_img
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_video_collect_record where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取收藏列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}

exports.getPraiseVideoById = (req, res) => {
  const sqlStr = 'select ev_v.* from ev_video_praise_record ev_vpr join ev_videos ev_v on ev_vpr.video_id = ev_v.id where ev_vpr.user_id=? order by ev_vpr.time desc limit ?,?'
  db.query(sqlStr, [
    req.query.id,
    (parseInt(req.query.offset)-1)*pageSize,
    pageSize
  ], (err, results) => {
    if(err) return res.cc(err)
    for(let item of results) {
      item.video_url = oss + item.video_url
      item.cover_img = oss + item.cover_img
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_video_praise_record where user_id=?'
    db.query(sqlStr, req.query.id, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        data,
        msg: '获取点赞列表成功',
        count: results[0].count,
        pageSize,
      })
    })
  })
}