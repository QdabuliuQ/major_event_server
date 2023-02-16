const db = require('../../db/index')
const {
    pageSize
} = require('../../config')

exports.getCommentById = (req, res) => {
    const ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = req.query.type == 1 ? `select distinct ev_ac.comment_id,  ev_ac.*, ev_acr.time, ev_acr.art_id, (select count(*) from ev_article_comment_praise_record ev_acpr where ev_acpr.comment_id = ev_ac.comment_id) as praise_count, if(ev_acr.parent_id=ev_ac.comment_id, (select count(*) - 1 from ev_article_comment_record ev_cr where ev_cr.parent_id = ev_ac.comment_id), -1) reply from ev_article_comment ev_ac join ev_article_comment_record ev_acr on (ev_ac.comment_id=ev_acr.parent_id and ev_acr.child_id is null) or (ev_ac.comment_id=ev_acr.child_id and ev_acr.parent_id <> ev_ac.comment_id) where ev_ac.is_delete = '0' and user_id = ? order by ev_acr.time desc limit ?,?` : 'select ev_vc.*, (select count(*) from ev_video_comment_praise_record ev_vcpr where ev_vcpr.comment_id = ev_vc.comment_id) as praise_count from ev_video_comment ev_vc where user_id = ? and is_delete="0" order by time desc limit ?,?'
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1) * ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        let data = results
        const sqlStr = req.query.type == '1' ? `select count(*) as count from ev_article_comment where user_id=? and is_delete="0"` : `select count(*) as count from ev_video_comment where user_id=? and is_delete="0"`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取评论列表成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*ps < results[0].count
            })
        })
    })
}

exports.deleteCommentById = (req, res) => {
    const sqlStr = req.body.type == 1 ? `select * from ev_article_comment where comment_id=? and user_id=? and is_delete='0'` : ''
    db.query(sqlStr, [
        req.body.comment_id,
        req.user.id
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('删除失败')

        const sqlStr = req.body.type == 1 ? `update ev_article_comment set is_delete='1' where comment_id=? and user_id=?` : ''
        db.query(sqlStr, [
            req.body.comment_id,
            req.user.id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('删除失败')
            if(req.body.type == 1) {
                const sqlStr = 'delete from ev_article_comment_record where parent_id=? or child_id=?'
                db.query(sqlStr, [
                    req.body.comment_id,
                    req.body.comment_id
                ], (err, results) => {
                    if(err) return res.cc(err)
                    res.cc('删除成功', 0)
                })
            } else {
                res.cc('删除成功', 0)
            }
        })
    })
}