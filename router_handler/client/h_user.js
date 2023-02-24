const db = require('../../db/index')
const bcrypt = require('bcryptjs')  // 密码校验
const { uuid, cutUrl } = require("../../tools");
const jwt = require("jsonwebtoken");
const config = require("../../config");

// 注册用户
exports.registerUser = (req, res) => {
    const info = req.body  // 获取客户端传递的信息
    // 查询是否被占用
    let sqlStr = 'select * from ev_users where email = ? or phone = ?'
    // 执行sql语句
    db.query(sqlStr, [info.email, info.phone], (err, results) => {
        if(err) return res.cc(err)

        // 存在数据 表示已经被占用
        if(results.length > 0) {
            return res.cc('邮箱或手机号被占用')
        }

        // 调用 bcrypt.hashSync 对密码进行加密
        info.password = bcrypt.hashSync(info.password, 8)

        // 插入用户数据
        sqlStr = 'insert into ev_users set ?'
        db.query(sqlStr, {
            id: uuid(10, 16),  // 生成唯一id
            email: info.email,
            phone: info.phone,
            nickname: '用户'+uuid(8),
            password: info.password,
            time: Date.now()
        }, (err, result) => {
            if(err) return res.cc(err)
            if(result.affectedRows != 1) {
                return res.cc('注册用户信息失败')
            }
            // 插入成功
            res.cc('注册用户信息成功', 0)
        })
    })
}

// 用户登录
exports.loginUser = (req, res) => {
    const info = req.body
    const sql = 'select * from ev_users where email=? or phone=?'

    db.query(sql, [info.account, info.account], (err, results) => {
        if(err) return res.cc(err)
        // 判断是否存在用户
        if(results.length != 1) return res.cc('账号或密码错误')
        if(results[0].status == 2) return res.cc('账号被封禁')
        // 校验密码是否一致
        // 调用 bcrypt.compareSync 对加密前和加密后的密码进行比较判断
        const compareResult = bcrypt.compareSync(info.password, results[0].password)
        if (!compareResult) return res.cc('账号或密码错误')

        // 剔除用户关键信息
        const _info = { ...results[0], password: null, user_pic: null }

        const tokenStr = jwt.sign(_info, config.jwtSecretKey, {
            expiresIn: config.expiresIn  // token有效期
        })

        res.send({
            status: 0,
            msg: '登录成功',
            id: results[0].id,
            // token拼接
            token: 'Bearer ' + tokenStr
        })
    })
}