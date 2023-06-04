const db = require('../../db/index')
const {
    pageSize,
    oss
} = require('../../config')

// 获取收藏列表
exports.getCollectList = (req, res) => {
    let pageSize = 15
    const sqlStr = 'select ev_c.*, ev_a.* from ev_article_collect_record ev_c join ev_articles ev_a on ev_c.art_id = ev_a.id where ev_c.user_id=? and ev_a.state="1" order by ev_c.time desc limit ?,?'
    db.query(sqlStr, [req.user.id, (parseInt(req.params.offset) - 1)  * pageSize, pageSize], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.content = item.content.replace(/<[^>]+>/ig, '')
            item.targets = JSON.parse(item.targets)
            item.cover_img = oss + item.cover_img
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_article_collect_record where user_id=?'
        db.query(sqlStr, req.user.id, (err, results) => {
            res.send({
                status: 0,
                data,
                count: results[0].count,
                more: parseInt(req.params.offset)*pageSize < results[0].count,
                msg: '获取收藏文章成功'
            })
        })
    })
}

exports.getCollectVideo = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = `select ev_vcr.*, ev_v.cover_img, ev_v.title, ev_v.time as pub_date, ev_v.video_url, ev_u.nickname,  ev_u.user_pic from ev_video_collect_record ev_vcr join ev_videos ev_v on ev_vcr.video_id = ev_v.id and ev_v.state='2' inner join ev_users ev_u on ev_v.user_id=ev_u.id where ev_vcr.user_id=? order by ev_vcr.time desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.video_url = oss + item.video_url
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_video_collect_record where user_id=?'
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取收藏列表成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*ps < results[0].count
            })
        })
    })
}