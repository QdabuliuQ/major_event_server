const db = require('../../db/index')
const {
    pageSize
} = require('../../config')
const {
    uuid,
    checkStatus
} = require('../../tools')

// 添加后台公告
exports.addBackNotice = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=? and type=1'
    checkStatus(sqlStr, req.user.admin_id, res, () => {
        const sqlStr = 'insert into ev_back_notice set ?'
        db.query(sqlStr, {
            id: uuid(12, 16),
            title: req.body.title,
            time: Date.now(),
            // content: unicodeEncode(req.body.content),
            content: req.body.content,
            is_top: req.body.is_top,
            pub_id: req.user.admin_id,
            status: req.body.status,
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('添加后台公告失败')
            res.cc('添加后台公告成功', 0)
        })
    })
}

// 获取后台公告
exports.getBackNotice = (req, res) => {

    const sqlStr = 'select * from ev_admins where admin_id=?'
    checkStatus(sqlStr, req.user.admin_id, res, () => {

        let is_topSql = ''
        if(req.body.is_top != undefined && req.body.is_top != -1) {
            is_topSql = `(ev_b.is_top = ${req.body.is_top})`
        } else {
            is_topSql = `(ev_b.is_top <> 9)`
        }
        let statusSql = ''
        if(req.body.status != undefined && req.body.status != '0') {
            statusSql = `(ev_b.status = ${req.body.status})`
        } else {
            statusSql = `(ev_b.status <> '-1')`
        }

        let timeSql = ''
        if(req.body.startTime != undefined) {
            timeSql = `(ev_b.time between ${req.body.startTime} and ${req.body.endTime})`
        } else {
            timeSql = `(ev_b.time between 0 and ${Date.now()})`
        }

        let val = req.body.val ? req.body.val : ''
        let valSql = `(ev_b.id like '%${val}%' or ev_b.title like '%${val}%' or ev_a.name like '%${val}%' or ev_a.phone like '%${val}%' or ev_a.email like '%${val}%')`

        const sqlStr = `select ev_b.*, ev_a.name, ev_a.phone, ev_a.email, ev_a.status pub_status from ev_back_notice as ev_b join ev_admins as ev_a on ev_b.pub_id = ev_a.admin_id where ${is_topSql} and ${statusSql} and ${timeSql} and ${valSql} order by ev_b.time desc limit ?,${pageSize}`
        db.query(sqlStr, (parseInt(req.body.offset) - 1) * pageSize, (err, results) => {

            if(err) return res.cc(err)
            let data = results
            const sqlStr = `select count(*) as count from ev_back_notice as ev_b join ev_admins as ev_a on ev_b.pub_id = ev_a.admin_id where ${is_topSql} and ${statusSql} and ${timeSql} and ${valSql}`

            db.query(sqlStr, (err, results) => {
                res.send({
                    status: 0,
                    msg: '获取后台公告成功',
                    data,
                    count: results && results.length ? results[0].count : 0,
                    pageSize
                })
            })

        })
    })
}

// 获取后台公告详情
exports.getBackNoticeDetail = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=?'
    checkStatus(sqlStr, req.user.admin_id, res, () => {
        const sqlStr = 'select ev_b.*, ev_a.name, ev_a.phone, ev_a.email, ev_a.status pub_status from ev_back_notice as ev_b join ev_admins as ev_a on ev_b.pub_id = ev_a.admin_id where ev_b.id = ?'
        db.query(sqlStr, req.body.id, (err, results) => {
            if(err) return res.cc(err)
            if(results.length != 1) return res.cc('获取公告详情失败')

            res.send({
                status: 0,
                msg: '获取公告详情成功',
                data: results[0]
            })
        })
    })
}

// 更新公告内容
exports.updateBackNotice = (req, res) => {
    const sqlStr = 'select * from ev_admins where admin_id=?'
    checkStatus(sqlStr, req.user.admin_id, res, () => {
        const sqlSql = 'update ev_back_notice set title=?, is_top=?, status=?, content=? where id=?'
        db.query(sqlSql, [req.body.title, req.body.is_top, req.body.status, req.body.content, req.body.id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('更新公告内容失败')

            res.cc('更新公告内容成功', 0)
        })
    })
}

// 添加前台公告
exports.addReceNotice = (req, res) => {
    let sqlStr = ''
    // 超级管理员身份  添加前台公告
    if(req.adminData.type == 1) {
        sqlStr = 'insert into ev_rece_notice set ?'
        db.query(sqlStr, {
            id: uuid(12, 16),
            title: req.body.title,
            time: Date.now(),
            // content: unicodeEncode(req.body.content),
            content: req.body.content,
            is_top: req.body.is_top,
            pub_id: req.user.admin_id,
            status: req.body.status,
            app_status: '2'  // 无需审核
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('发布前台公告失败')
            res.cc('发布前台公告成功', 0)
        })
    } else {  // 普通管理员身份
        sqlStr = 'insert into ev_rece_notice set ?'
        db.query(sqlStr, {
            id: uuid(12, 16),
            title: req.body.title,
            time: Date.now(),
            // content: unicodeEncode(req.body.content),
            content: req.body.content,
            is_top: 0,
            pub_id: req.user.admin_id,
            status: '1',
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('提交发布公告申请失败')

            res.cc('提交发布公告成功', 0)
        })
    }
}

// 获取前台公告
exports.getReceNotice = (req, res) => {
    let is_topSql = ''
    if(req.body.is_top && req.body.is_top != -1) {
        is_topSql = `(ev_r.is_top = ${req.body.is_top})`
    } else {
        is_topSql = `(ev_r.is_top <> 9)`
    }

    let statusSql = ''
    if(req.body.status && req.body.status != '0') {
        statusSql = `(ev_r.status = ${req.body.status})`
    } else {
        statusSql = `(ev_r.status <> '999')`
    }

    let timeSql = ''
    if(req.body.startTime) {
        timeSql = `(ev_r.time between ${req.body.startTime} and ${req.body.endTime})`
    } else {
        timeSql = `(ev_r.time between 0 and ${Date.now()})`
    }

    let app_statusSql = ''
    if(req.body.app_status && req.body.app_status != '0') {
        app_statusSql = `(ev_r.app_status = ${req.body.app_status})`
    } else {
        app_statusSql = `(ev_r.app_status <> '999')`
    }

    let val = req.body.val ? req.body.val : ''
    let valSql = `(ev_r.id like '%${val}%' or ev_r.title like '%${val}%' or ev_a.name like '%${val}%' or ev_a.phone like '%${val}%' or ev_a.email like '%${val}%')`

    // 查询前台公告
    const sqlStr = `select ev_r.*, ev_a.name, ev_a.phone, ev_a.email, ev_a.status pub_status from ev_rece_notice as ev_r join ev_admins as ev_a on ev_r.pub_id = ev_a.admin_id where ${is_topSql} and ${statusSql} and ${timeSql} and ${app_statusSql} and ${valSql} order by ev_r.time desc limit ?,${pageSize}`

    db.query(sqlStr, (parseInt(req.body.offset) - 1) * pageSize, (err, results) => {
        for(let item of results) {
            item.isMe = item.pub_id == req.user.admin_id
        }
        let data = results

        // 查找条数
        const sqlStr = `select count(*) as count from ev_rece_notice as ev_r join ev_admins as ev_a on ev_r.pub_id = ev_a.admin_id where ${is_topSql} and ${statusSql} and ${timeSql} and ${app_statusSql} and ${valSql}`
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                msg: '获取前台公告成功',
                data,
                count: results && results.length ? results[0].count : 0,
                pageSize
            })
        })
    })
}

// unicode -> text
function unicodeEncode(str){
    if(!str)return '';
    if(typeof str !== 'string') return str
    let text = escape(str);
    text = text.replaceAll(/(%u[ed][0-9a-f]{3})/ig, (source, replacement) => {
        return source.replace('%', '\\\\')
    })
    return unescape(text);
}

// text -> unicode
function unicodeDecode(str)
{
    let text = escape(str);
    text = text.replaceAll(/(%5Cu[ed][0-9a-f]{3})/ig, source=>{
        return source.replace('%5C', '%')
    })
    return unescape(text);
}

// 审核前台公告
exports.updateNoticeAppStatus = (req, res) => {
	if(req.adminData.type != '1') return res.cc('权限错误')
    // 判断状态
    const sqlStr = 'select * from ev_admins where admin_id=? and type=1'
    checkStatus(sqlStr, req.user.admin_id, res, () => {

        const sqlStr = `select * from ev_rece_notice where id=?`
        db.query(sqlStr, req.body.id, (err, results) => {
            if(err) return res.cc(err)
            if(results.length != 1 || results[0].app_status != '1') return res.cc('前台公告信息错误')
            const sqlStr = 'update ev_rece_notice set app_status=? where id=?'
            db.query(sqlStr, [req.body.app_status, req.body.id], (err, results) => {
                if(err) return res.cc(err)
                if(results.affectedRows != 1) return res.cc('更新前台公告失败')

                res.cc('更新前台公告成功', 0)
            })
        })
    })
}

// 获取前台公告详情
exports.getReceNoticeDetail = (req, res) => {
    const sqlStr = 'select ev_r.*, ev_a.name as pub_name, ev_a.admin_id as pub_id from ev_rece_notice as ev_r join ev_admins as ev_a on ev_r.pub_id = ev_a.admin_id where ev_r.id = ?'
    db.query(sqlStr, req.body.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('无法获取公告信息')

        if(results[0].status == '2') {
            if(req.user.type == 2) {
                return res.cc('该公告以禁用')
            }
        }
        return res.send({
            status: 0,
            msg: '获取公告信息成功',
            data: results[0]
        })

    })
}

const updateStatus = (req, res) => {
    const sqlStr = `update ev_rece_notice set ? where id='${req.body.id}'`
    db.query(sqlStr, {
        title: req.body.title,
        content: req.body.content,
        is_top: req.body.is_top,
        status: req.body.status,
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('更新前台公告失败')

        res.cc('更新前台公告失败', 0)
    })
}

// 更新前台公告
exports.updateReceNotice = (req, res) => {
	if(req.adminData.type != '1') return res.cc('权限错误')
	const sqlStr = 'select * from ev_rece_notice where app_status<>"3" and id=?'
	db.query(sqlStr, req.body.id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('修改公告失败')
		updateStatus(req, res)
	})
//     const sqlStr = `select * from ev_rece_notice where app_status<>"3"`
//     db.query(sqlStr, (err, results) => {
//         if(err) return res.cc(err)
//         if(results.length != 1) return res.cc('修改公告失败')
//         // 审核状态
//         if(results[0].app_status == '1') {
//             // 超管
//             if(req.adminData.type == 1) {
//                 return updateStatus(req, res)
//             }
//         }
//         res.cc('修改公告失败')
//     })
}
