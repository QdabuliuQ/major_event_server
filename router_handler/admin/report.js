const db = require('../../db/index')
const {
    pageSize,
    oss
} = require('../../config')

// 获取文章举报列表
exports.getReportList = (req, res) => {
    let reasonSql = ''
    if(req.query.reason) {
        reasonSql = `(ev_r.reason = '${req.query.reason}')`
    } else {
        reasonSql = `(ev_r.reason <> '')`
    }

    let stateSql = ''
    if(req.query.state) {
        stateSql = `(ev_r.state = '${req.query.state}')`
    } else {
        stateSql = `(ev_r.state <> '')`
    }

    let timeSql = ''
    if(parseInt(req.query.startTime) && parseInt(req.query.endTime)) {
        timeSql = `(ev_r.time between ${req.query.startTime} and ${req.query.endTime})`
    } else {
        timeSql = `(ev_r.time between 0 and ${Date.now()})`
    }

    let valSql = '', val = req.query.val ? req.query.val : ''
    valSql = `(ev_r.id like '%${val}%' or ev_r.art_id like '%${val}%' or ev_r.user_id like '%${val}%' or ev_r.desc like '%${val}%')`

    const sqlStr = `select ev_r.*, ev_a.title, ev_a.content, ev_a.cover_img, ev_a.pub_date, ev_a.targets, ev_a.author_id, ev_u.nickname, ev_u.intro, ev_u.user_pic, ev_c.name as cate_name from ev_article_report ev_r join ev_articles ev_a on ev_r.art_id=ev_a.id inner join ev_users ev_u on ev_r.user_id=ev_u.id inner join ev_article_cate ev_c on ev_c.id=ev_a.cate_id where ${reasonSql} and ${stateSql} and ${timeSql} and ${valSql} order by ev_r.time desc limit ?,?`

    db.query(sqlStr, [(parseInt(req.query.offset)-1)*pageSize, pageSize], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.targets = JSON.parse(item.targets)
            item.cover_img = oss + item.cover_img
            item.user_pic = oss + item.user_pic
            if(item.proof) {
                let proof = JSON.parse(item.proof)
                for(let item of proof) {
                    item.link = oss + item.link
                }
                item.proof = proof
            }
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_article_report'
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                count: results && results.length ? results[0].count : 0,
                pageSize,
                msg: '获取文章举报成功'
            })
        })
    })
}

// 更新举报状态
exports.updateReportState = (req, res) => {
    const sqlStr = 'update ev_article_report set state=? where id=?'
    db.query(sqlStr, [req.body.state, req.body.id], (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) res.cc('操作失败，请重试')
        res.cc('操作成功', 0)
    })
}

// 获取举报理由
exports.getReportReason = (req, res) =>{
    let reason = req.query.type ? req.query.type : '1'
    const sqlStr = `select * from ev_report_reason where type = "${reason}"`
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results,
            msg: '获取举报理由成功'
        })
    })
}

// 添加举报理由
exports.addReportReason = (req, res) => {
    let reason = req.body.type ? req.body.type : '1'
    console.log(reason, req.body)
    const sqlStr = `select * from ev_report_reason where name = ? and type = "${reason}"`
    db.query(sqlStr, req.body.name, (err, results) => {
        if(err) return res.cc(err)
        if(results.length) return res.cc('举报理由不能重复')
        const sqlStr = `insert into ev_report_reason set name=?, type="${reason}"`
        db.query(sqlStr, req.body.name.trim(), (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('添加举报理由失败')
            res.cc('添加举报理由成功', 0)
        })
    })
}

// 删除举报理由
exports.deleteReportReason = (req, res) => {
    let reason = req.body.type ? req.body.type : '1'
    const sqlStr = `delete from ev_report_reason where name=? and type="${reason}"`
    db.query(sqlStr, req.body.name, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('刪除举报理由失败')
        res.cc('刪除举报理由成功', 0)
    })
}

// 获取评论举报列表
exports.getCommentReportList = (req, res) => {
    let reasonSql = ''
    if(req.query.reason) {
        reasonSql = `(ev_cr.reason = '${req.query.reason}')`
    } else {
        reasonSql = `(ev_cr.reason <> ' ')`
    }

    let stateSql = ''
    if(req.query.state) {
        stateSql = `(ev_cr.state = '${req.query.state}')`
    } else {
        stateSql = `(ev_cr.state <> ' ')`
    }

    let timeSql = ''
    if(req.query.startTime && req.query.endTime) {
        timeSql = `(ev_cr.time between ${req.query.startTime} and ${req.query.endTime})`
    } else {
        timeSql = `(ev_cr.time between 0 and ${Date.now()})`
    }

    let val = req.query.val ? req.query.val : ''
    let valSql = `(ev_cr.id like '%${val}%' or ev_cr.user_id like '%${val}%' or ev_cr.comment_id like '%${val}%' or ev_ac.user_id like '%${val}%' or ev_ac.nickname like '%${val}%' or ev_ac.content like '%${val}%')`

    const sqlStr = `select ev_cr.*, ev_ac.user_pic, ev_ac.user_id u_id, ev_ac.nickname, ev_ac.content, ev_u.user_pic re_user_pic, ev_u.nickname re_nickname from ev_comment_report ev_cr join ev_article_comment ev_ac on ev_cr.comment_id = ev_ac.comment_id inner join ev_users ev_u on ev_cr.user_id = ev_u.id where ${reasonSql} and ${stateSql} and ${timeSql} and ${valSql} order by ev_cr.time desc limit ?,?`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
            item.re_user_pic = oss + item.re_user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_comment_report ev_cr join ev_article_comment ev_ac on ev_cr.comment_id = ev_ac.comment_id inner join ev_users ev_u on ev_cr.user_id = ev_u.id where ${reasonSql} and ${stateSql} and ${timeSql} and ${valSql} order by ev_cr.time desc`

        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                msg: '获取评论举报成功',
                data,
                pageSize,
                count: results && results.length ? results[0].count : 0
            })
        })
    })
}

// 更新评论举报状态
exports.updateCommentReportState = (req, res) => {
    const sqlStr = 'select * from ev_comment_report where id=? and state="1"'
    db.query(sqlStr, req.body.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('操作失败')

        const sqlStr = 'update ev_comment_report set state=? where id=?'
        db.query(sqlStr, [req.body.state, req.body.id], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) res.cc('操作失败，请重试')
            res.cc('操作成功', 0)
        })
    })

}