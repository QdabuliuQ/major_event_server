const db = require('../../db/index')
const {
    uuid
} = require('../../tools')
const {pageSize, oss} = require("../../config");

// 举报文章
exports.addArticleReport = (req, res) => {
    const sqlStr = 'insert into ev_article_report set ?'
    db.query(sqlStr, {
        id: 'r_a'+ uuid(16),
        user_id: req.user.id,
        art_id: req.body.art_id,
        reason: req.body.reason,
        time: Date.now(),
        desc: req.body.desc.trim(),
        proof: req.body.proof,
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('举报文章失败')
        res.cc('举报以提交', 0)
    })
}

// 举报评论
exports.addCommentReport = (req, res) => {
    // 判断是否存在该评论
    const sqlStr = 'select * from ev_article_comment where comment_id=? and is_delete="0"'
    db.query(sqlStr, req.body.comment_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('举报失败')

        const sqlStr = 'insert into ev_comment_report set ?'
        db.query(sqlStr, {
            id: 'r_c'+ uuid(16),
            user_id: req.user.id,
            comment_id: req.body.comment_id,
            reason: req.body.reason,
            time: Date.now()
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('举报失败')
            res.cc('提交成功', 0)
        })
    })
}

// 获取文章举报记录
exports.getArticleReportList = (req, res) => {

    const sqlStr = `select ev_ar.*, ev_a.cover_img, ev_a.title, ev_a.content from ev_article_report ev_ar join ev_articles ev_a on ev_ar.art_id = ev_a.id where user_id = ? order by ev_ar.time desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_article_report where user_id = ?'
        db.query(sqlStr, req.user.id, (err, results) => {
            console.log(pageSize)
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count,
                msg: '获取举报文章成功'
            })
        })
    })
}

// 获取评论举报记录
exports.getCommentReportList = (req, res) => {
    const sqlStr = 'select ev_cr.*, ev_ac.content from ev_comment_report ev_cr join ev_article_comment ev_ac on ev_cr.comment_id = ev_ac.comment_id where ev_cr.user_id=? order by ev_cr.time desc limit ?,?'
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        console.log(results)
        if(err) return res.cc(err)
        let data = results
        const sqlStr = `select count(*) as count from ev_comment_report where user_id = ?`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取举报评论成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count,
            })
        })
    })
}

// 获取举报详情
exports.getArticleReportDetail = (req, res) => {
    const sqlStr = `select ev_ar.*, ev_a.cover_img, ev_a.title, ev_a.content, ev_a.pub_date from ev_article_report ev_ar join ev_articles ev_a on ev_ar.art_id = ev_a.id where ev_ar.id = ?`
    db.query(sqlStr, req.params.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc(err)
        results[0].cover_img = oss + results[0].cover_img
        results[0].content = results[0].content.replace(/<[^>]+>/ig, '')
        results[0].proof = results[0].proof != '' ? JSON.parse(results[0].proof) : []
        for(let item of results[0].proof) {
            item.link = oss + item.link
        }
        res.send({
            status: 0,
            data: results[0],
            msg: '获取举报详情成功',
        })
    })
}
