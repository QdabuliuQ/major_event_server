const db = require('../../db/index')  // 数据库实例
const {
    checkStatus
} = require('../../tools')
const {
    pageSize
} = require('../../config')

// 获取超级管理员日志
exports.getSupAdminLog = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=?'
    checkStatus(sqlStr, req.user.admin_id, res, () => {
        console.log(req.body, req.body.type)
        let typeSql = ''
        if(req.body.type != undefined && req.body.type != 0) {
            typeSql = `(ev_log.type = ${req.body.type})`
        } else {
            typeSql = `(ev_log.type <> 0)`
        }
        console.log(111)
        let timeSql = ''
        if(req.body.startTime != undefined) {
            timeSql = `(ev_log.time between ${req.body.startTime} and ${req.body.endTime})`
        } else {
            timeSql = `(ev_log.time between 0 and ${Date.now()})`
        }
        let val = req.body.val ? req.body.val : ''
        let valSql = `(ev_log.admin_id like '%${val}%' or ev_log.admin_phone like '%${val}%' or ev_log.admin_name like '%${val}%' or ev_log.admin_status like '%${val}%' or ev_log.ope_desc like '%${val}%' or ev_ad.phone like '%${val}%' or ev_ad.name like '%${val}%' or ev_ad.email like '%${val}%')`

        // 查询信息
        const sqlStr = `select ev_log.*, ev_ad.phone ope_phone, ev_ad.name ope_name, ev_ad.email ope_email, ev_ad.status ope_status, ev_ad.time as ope_time from ev_superadmin_ope_log ev_log INNER join ev_admins ev_ad on ev_log.ope_id = ev_ad.admin_id where ${typeSql} and ${timeSql} and ${valSql} order by ev_log.time desc limit ${(parseInt(req.body.offset) - 1) * pageSize},${pageSize}`
        // 执行sql
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            const data = results
            db.query(`select count(*) as count from ev_superadmin_ope_log ev_log INNER join ev_admins ev_ad on ev_log.ope_id = ev_ad.admin_id where ${typeSql} and ${timeSql} and ${valSql}`, (err, results) => {
                if(err) return res.cc(err)
                res.send({
                    status: 0,
                    msg: '获取超级管理员操作日志成功',
                    data: data,
                    count: results[0] ? results[0].count : 0,
                    pageSize
                })
            })
        })
    })
}

