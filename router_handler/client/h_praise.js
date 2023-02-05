const db = require('../../db/index')
const {
    oss
} = require('../../config')

exports.getPraiseList = (req, res) => {
    const sqlStr = `select ev_a.* from ev_article_praise_record ev_apr join ev_articles ev_a on ev_a.id = ev_apr.art_id where ev_apr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1' order by ev_apr.time desc limit ?,15`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.params.offset)-1)*15
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_praise_record ev_apr join ev_articles ev_a on ev_a.id = ev_apr.art_id where ev_apr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1'`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取点赞文章成功',
                data,
                count,
                more: parseInt(req.params.offset)*15 < count
            })
        })
    })
}

exports.getBrowseList = (req, res) => {
    const sqlStr = `select ev_a.* from ev_article_browse_record ev_abr join ev_articles ev_a on ev_a.id = ev_abr.art_id where ev_abr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1' order by ev_abr.time desc limit ?,15`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.params.offset)-1)*15
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_browse_record ev_abr join ev_articles ev_a on ev_a.id = ev_abr.art_id where ev_abr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1'`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取点赞文章成功',
                data,
                count,
                more: parseInt(req.params.offset)*15 < count
            })
        })
    })
}