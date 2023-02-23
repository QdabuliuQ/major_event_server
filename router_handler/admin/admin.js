const db = require('../../db/index')
const bcrypt = require('bcryptjs')  // 加密库
const jwt = require('jsonwebtoken')  // 生成token
const config = require('../../config')  // 导入全局配置文件

exports.adminLogin = (req, res) => {
    const sqlStr = "select * from ev_admins where (phone=? or email=?) and type=?"
    db.query(sqlStr, [
        req.body.account,
        req.body.account,
        req.body.type
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('账号或者密码错误')
        const compareResult = bcrypt.compareSync(req.body.password, results[0].password)
        if(!compareResult || results.length != 1) return res.cc('账号或者密码错误')
        if(results[0].status == '2') return res.cc('账号被封禁')
        const info = {...results[0], password: null}
        const tokenStr = jwt.sign(info, config.jwtSecretKey, {
            expiresIn: config.expiresIn
        })

        res.send({
            status: 0,
            msg: '登录成功',
            token: 'Bearer ' + tokenStr,
            type: results[0].type,
            id: results[0].admin_id
        })
    })
}

