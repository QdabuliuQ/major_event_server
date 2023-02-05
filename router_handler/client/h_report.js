const db = require('../../db/index')
const {
    uuid
} = require('../../tools')

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