const db = require('../../db/index')
const {
  pageSize,
  oss
} = require('../../config')

exports.addArticle = (req, res) => {
  res.send('ok')
}

// 获取文章列表
exports.getArticleList = (req, res) => {
  let cateSql = ``
  if(req.body.cate_id) {
    cateSql = `(ev_a.cate_id = '${req.body.cate_id}')`
  } else {
    cateSql = `(ev_a.cate_id <> '0')`
  }

  let stateSql = ''
  if(req.body.state) {
    stateSql = `(ev_a.state = '${req.body.state}')`
  } else {
    stateSql = `(ev_a.state <> '-1')`
  }

  let timeSql = ''
  if(req.body.startTime && req.body.endTime) {
    timeSql = `(ev_a.pub_date between ${req.body.startTime} and ${req.body.endTime})`
  } else {
    timeSql = `(ev_a.pub_date between 0 and ${Date.now()})`
  }

  let val = req.body.val ? req.body.val : ''
  let valSql = `(ev_a.id like '%${val}%' or ev_a.title like '%${val}%' or ev_a.author_id like '%${val}%')`

  const sqlStr = `select ev_a.*, ev_c.name as cate_name, ev_u.nickname, ev_u.user_pic, ev_u.intro, (select count(*) from ev_article_browse_record where art_id=ev_a.id) as browse_count, (select count(*) from ev_article_collect_record where art_id=ev_a.id) as collect_count, (select count(*) from ev_article_comment_record where art_id=ev_a.id) as comment_count from ev_articles ev_a, ev_article_cate ev_c, ev_users ev_u where ev_c.id = ev_a.cate_id and ev_a.author_id=ev_u.id and ${cateSql} and ${stateSql} and ${timeSql} and ${valSql} order by ev_a.pub_date desc limit ?,?`
  db.query(sqlStr, [(parseInt(req.body.offset)-1)*pageSize, pageSize], (err, results) => {
    if(err) return res.cc(err)

    for(let item of results) {
      item.cover_img = oss + item.cover_img
      item.user_pic = oss + item.user_pic
      item.targets = JSON.parse(item.targets)
    }
    let data = results
    const sqlStr = 'select count(*) as count from ev_articles'
    db.query(sqlStr, (err, results) => {
      if(err) return res.cc(err)
      res.send({
        status: 0,
        msg: '获取文章列表成功',
        count: results && results.length ? results[0].count : 0,
        pageSize,
        data,
      })
    })

  })
}

// 更新文章状态
exports.updateArticleState = (req, res) => {
  // 获取文章状态
  const sqlStr = 'select * from ev_articles where id=?'
  db.query(sqlStr, req.body.id, (err, results) => {
    if(err) return res.cc(err)
    if(!results.length) return res.cc('更新文章状态失败')
    // 判断状态是否相同
    if(results[0].state == req.body.state) return res.cc('更新文章状态失败')

    const sqlStr = 'update ev_articles set state=? where id=?'
    db.query(sqlStr, [req.body.state, req.body.id], (err, results) => {
      if(err) return res.cc(err)
      if(results.affectedRows != 1) return res.cc('更新文章状态失败')
      res.cc('更新文章状态成功', 0)
    })
  })
}