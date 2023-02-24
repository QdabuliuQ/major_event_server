const db = require('../../db/index')
const bcrypt = require('bcryptjs')  // 加密库
const {  // 导入全局配置文件
    oss,
    pageSize
} = require('../../config')
const { addUrl, uuid } = require("../../tools");

function checkExist(sql, data, msg='用户信息出现重复', res, cb) {
    db.query(sql, data, (err, results) => {
        if(err) return res.cc(err)
        if(results.length >= 1) return res.cc(msg)
        cb()
    })
}

// 检查身份
function checkStatus(sql, data, res, cb) {
    db.query(sql, data, (err, results) => {
        if(err) {
            return res.cc(err)
        }
        if(results.length != 1) {
            return res.cc('管理员信息错误')
        }
        cb()
    })
}

// 更新用户密码
exports.adminUpdateUserPwd = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=? and password=?'

    checkStatus(sqlStr, [req.user.admin_id, req.body.rootPwd], res, () => {
        const sqlStr = 'update ev_users set password=? where id=?'
        // 执行更新sql  生成加密后的密码
        db.query(sqlStr, [bcrypt.hashSync(req.body.newPwd, 8), req.body.id], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows != 1) return res.cc('更新用户信息失败')

            res.cc('更新用户信息成功', 0)
        })
    })
}

// 获取所有用户
exports.adminGetUserList = (req, res) => {
    // 查询所有用户信息
    let val = req.body.val ? req.body.val : ''
    let valSql = `(nickname like '%${req.body.val}%' or nickname like '%${req.body.val}%' or email like '%${req.body.val}%')`

    let statusSql = ''
    if(req.body.status) {
        statusSql = `(status = ${req.body.status})`
    } else {
        statusSql = `(status <> -1)`
    }

    const sqlStr = `select * from ev_users where ${valSql} and ${statusSql} order by time desc limit ?,?`
    db.query(sqlStr, [(parseInt(req.body.offset) - 1) * pageSize, pageSize], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
            item.bg_image = oss + item.bg_image
            delete item.password
        }
        let data = results

        const sqlStr = 'select count(*) as count from ev_users where ${valSql} and ${statusSql}'
        // 查询条数
        db.query(sqlStr, (err, results) => {
            res.send({
                status: 0,
                msg: '查询所有用户信息成功',
                data: data,
                count: results && results.length ? results[0].count : 0,
                pageSize,
            })
        })
    })
}

// 获取管理员信息
exports.adminGetAdminList = (req, res) => {
    // 验证身份
    const sqlStr = 'select * from ev_admins where admin_id=? and type=1'
    checkStatus(sqlStr, req.user.admin_id, res, () => {
        // 查询普通管理员信息
        let val = req.body.val ? req.body.val : ''
        let valSql = `(name like '%${req.body.val}%' or phone like '%${req.body.val}%' or email like '%${req.body.val}%')`

        let statusSql = ''
        if(req.body.status) {
            statusSql = `(status = ${req.body.status})`
        } else {
            statusSql = `(status <> -1)`
        }
        const sqlStr = `select * from ev_admins where type = 2 and ${valSql} and ${statusSql} order by time desc limit ?,?`

        db.query(sqlStr, [(parseInt(req.body.offset) - 1) * pageSize, pageSize], (err, results) => {
            if(err) return res.cc(err)
            let data = addUrl(results)
            // 查询条数
            let sqlStr = ''

            if(req.body.val || req.body.status != undefined) {
                if(req.body.status == 0) {
                    sqlStr = `select count(*) as count from ev_admins where type=2 and (name like '%${req.body.val}%' or phone like '%${req.body.val}%' or email like '%${req.body.val}%')`
                } else {
                    sqlStr = `select count(*) as count from ev_admins where type=2 and status = ${req.body.status} and (name like '%${req.body.val}%' or phone like '%${req.body.val}%' or email like '%${req.body.val}%')`
                }
            } else {
                sqlStr = 'select count(*) as count from ev_admins where type = 2'
            }
            // const sqlStr = 'select count(*) as count from ev_admins where type = 2'
            db.query(sqlStr, [(parseInt(req.body.offset) - 1) * pageSize, pageSize], (err, results) => {
                if(err) return res.cc(err)
                // 返回数据
                res.send({
                    status: 0,
                    msg: '获取普通管理员信息成功',
                    data: data,
                    count: results[0] ? results[0].count : 0,
                    pageSize
                })
            })
        })
    })
}

// 添加管理员信息
exports.adminAddAdminInfo = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=? and type=1 and password=?'
    // 判断身份
    checkStatus(sqlStr, [req.user.admin_id, req.body.rootPwd], res, () => {
        const sqlStr = 'select * from ev_admins where phone=? or email=?'
        // 判断是否信息重复
        checkExist(sqlStr, [req.body.phone, req.body.email], '手机号或邮箱已被占用', res, () => {
            const sqlStr = 'insert into ev_admins set ?'
            let info = req.body
            // 密码加密
            info.password = bcrypt.hashSync(info.password, 8)
            console.log(info.password)
            // 执行sql
            db.query(sqlStr, {
                admin_id: uuid(10, 16),
                name: info.name,
                email: info.email,
                phone: info.phone,
                password: info.password,
                time: Date.now()
            }, (err, results) => {
                if(err) return res.cc(err)
                // 插入数据失败
                if(results.affectedRows != 1) {
                    return res.cc('添加管理员信息失败')
                }
                // 插入成功
                res.cc('添加管理员信息成功', 0)
            })
        })
    })
}

// 更新管理员信息
exports.adminUpdateAdminInfo = (req, res) => {
    // 查询是否是超级管理员
    if(req.adminData.type == 1) {
        // 判断信息是否重复
        const sqlStr = 'select * from ev_admins where admin_id <> ? and (email=? or phone=?)'
        checkExist(sqlStr, [req.body.admin_id, req.body.email, req.body.phone], '手机号或邮箱已被占用', res, () => {
            // 更新管理员信息
            const sqlStr = 'update ev_admins set email=?,name=?,phone=?,status=? where admin_id=?'
            // 执行sql
            db.query(sqlStr, [req.body.email, req.body.name, req.body.phone, req.body.status, req.body.admin_id], (err, results) => {
                if(err) return res.cc(err)
                if(results.affectedRows != 1) return res.cc('更新管理员信息失败')

                res.cc('更新管理员信息成功', 0)
            })
        })
    } else {
        res.cc('更新管理员信息失败')
    }
}

// 更新管理员密码
exports.adminUpdateAdminPwd = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=? and type=1 and password=?'
    checkStatus(sqlStr, [req.user.admin_id, req.body.rootPwd], res, () => {
        const sqlStr = 'update ev_admins set password=? where admin_id=?'
        // 密码加密
        const password = bcrypt.hashSync(req.body.newPwd, 8)
        // 执行update sql
        db.query(sqlStr, [password, req.body.admin_id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('更新管理员密码失败')

            res.cc('更新管理员密码成功', 0)
        })
    })
}