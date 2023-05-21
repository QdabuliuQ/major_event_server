const db = require('../../db/index')
const {pageSize} = require("../../config");
const {
    province
} = require('../../utils/city')

exports.getWebsiteData = (req, res) => {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    const end = new Date(today - 1000).getTime();
    const sqlStr = `select (select count(*) from ev_articles where pub_date <= ${end}) as art_yest, (select count(*) from ev_articles) as art_total, (select count(*) from ev_videos where time <= ${end}) as video_yest, (select count(*) from ev_videos) as video_total, (select count(*) from ev_article_comment_record where time <= ${end} and is_delete='0') as art_comment_yest, (select count(*) from ev_article_comment_record where is_delete='0') as art_comment_total, (select count(*) from ev_video_comment where time <= ${end} and is_delete='0') as video_comment_yest, (select count(*) from ev_video_comment where is_delete='0') as video_comment_total, (select count(*) from ev_article_praise_record where time <= ${end}) as art_praise_yest, (select count(*) from ev_article_praise_record) as art_praise_total, (select count(*) from ev_video_praise_record where time <= ${end}) as video_praise_yest, (select count(*) from ev_video_praise_record) as video_praise_total`
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results[0],
            msg: '获取网站数据成功'
        })
    })
}

exports.getBackNoticeList = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : 8
    const sqlStr = `select ev_bn.*, ev_a.name as nickname from ev_back_notice ev_bn join ev_admins ev_a on ev_bn.pub_id = ev_a.admin_id where ev_bn.status = "1" order by ev_bn.is_top desc, ev_bn.time desc limit ?,?`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.desc = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_back_notice where status = "1"'
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取后台公告成功',
                count: results[0].count,
                pageSize: ps
            })
        })

    })
}

exports.getReceNoticeList = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : 8
    const sqlStr = `select ev_rn.*, ev_a.name as nickname from ev_rece_notice ev_rn join ev_admins ev_a on ev_rn.pub_id = ev_a.admin_id where ev_rn.status = "1" and ev_rn.app_status="2" order by ev_rn.is_top desc, ev_rn.time desc limit ?,?`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.desc = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_rece_notice where status = "1" and app_status="2"'
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取前台公告成功',
                count: results[0].count,
                pageSize: ps
            })
        })
    })
}

exports.getCateData = (req, res) => {
    const sqlStr = 'select ev_ac.name, (select count(*) from ev_articles ev_a where ev_a.state = "1" and ev_a.cate_id = ev_ac.id) as count from ev_article_cate ev_ac'
    // const sqlStr = 'select ev_ac.name, count(*) as count from ev_articles ev_a join ev_article_cate ev_ac on ev_a.cate_id = ev_ac.id where ev_a.state = "1" group by ev_a.cate_id'
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results,
            msg: '获取分类数据成功'
        })
    })
}

exports.getUserRegion = (req, res) => {
    const sqlStr = 'select province, count(*) as value from ev_users group by province'
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        outer: for(let item of results) {
            for(let c of province) {
                if(item.province == c.id) {
                    item.name = c.alias
                    delete item.province
                    continue outer
                }
            }
            item.name = '未知'
            delete item.province
        }
        res.send({
            status: 0,
            data: results,
            msg: '获取用户分布成功'
        })
    })
}

exports.getRegisterData = (req, res) => {
    const sqlStr = 'SELECT from_unixtime( ANY_VALUE(time) / 1000, "%Y-%m-%d" ) AS days, count(*) as count FROM ev_users GROUP BY days order by ANY_VALUE(time) desc'
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        res.send({
            status: 0,
            data: results,
            msg: '获取注册数据成功',
        })
    })
}