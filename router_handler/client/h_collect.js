const db = require('../../db/index')
const {
    pageSize,
    oss
} = require('../../config')

// 获取收藏列表
exports.getCollectList = (req, res) => {
    // let pageSize = 6
    const sqlStr = 'select ev_c.*, ev_a.* from ev_article_collect_record ev_c join ev_articles ev_a on ev_c.art_id = ev_a.id where ev_c.user_id=? order by ev_c.time desc limit ?,?'
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