const db = require('../../db/index')  // 数据库实例
const bcrypt = require('bcryptjs')  // 密码校验
const { oss } = require('../../config')
const { cutUrl } = require('../../tools')

exports.getUserInfo = (req, res) => {
  // sql语句 不能将密码返回
  const sqlStr = 'select * from ev_users where id=?'
  // express-jwt中间件会解析token 然后放在req.user当中
  db.query(sqlStr, req.user.id, (err, results) => {
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

// // 获取所有用户
// exports.getUserList = (req, res) => {
//   const sqlStr = 'select * from ev_admins where admin_id=?'
//   // 验证是否是管理员
//   db.query(sqlStr, req.user.admin_id, (err, results) => {
//     if(err) return res.cc(err)
//     if(results.length != 1) return res.cc('管理员信息错误')
//
//     // 查询所有用户信息
//     const sqlStr = "select id, username, nickname, email, user_pic, status from ev_users limit ?,?"
//     const pageSize = 10
//     db.query(sqlStr, [(parseInt(req.body.offset) - 1) * pageSize, pageSize], (err, results) => {
//       if(err) return res.cc(err)
//       for(let item of results) {
//         item.user_pic = oss + item.user_pic
//       }
//       let data = results
//       const sqlStr = 'select count(*) as count from ev_users'
//       db.query(sqlStr, (err, results) => {
//         res.send({
//           status: 0,
//           msg: '查询所有用户信息成功',
//           data: data,
//           count: results[0].count,
//           pageSize,
//         })
//       })
//     })
//   })
// }