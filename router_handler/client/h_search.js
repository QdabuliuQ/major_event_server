const db = require('../../db/index')
const {oss, pageSize} = require("../../config");
const {createConditionSql} = require("../../tools");

exports.getAllSearch = (req, res) => {
    let _key = req.query.key
    let conSql_1 = `title like '%${_key}%'`
    let conSql_2 = `ev_u.nickname like '%${_key}%'`
    let conSql_3 = `ev_v.title like '%${_key}%'`

    const sqlStr = `select * from ev_articles where state="1" and ${conSql_1} order by pub_date desc limit 0,5; select *, (select count(*) from ev_user_follow ev_uf where ev_uf.follow_id = ev_u.id and ev_uf.user_id = '${req.user.id}') as is_follow from ev_users ev_u where status <> "2" and ${conSql_2} limit 0,6; select ev_v.*, ev_u.user_pic, ev_u.nickname from ev_videos ev_v join ev_users ev_u on ev_v.user_id = ev_u.id where ev_v.state = "2" and ${conSql_3} limit 0,6`

    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)

        if(results.length != 3) return res.cc('搜索失败')
        for(let item of results[0]) {
            item.desc = item.content.replace(/<[^>]+>/ig, '')
            item.cover_img = oss + item.cover_img
        }
        for(let item of results[1]) {
            item.user_pic = oss + item.user_pic
        }
        for(let item of results[2]) {
            item.cover_img = oss + item.cover_img
            item.user_pic = oss + item.user_pic
            item.video_url = oss + item.video_url
        }

        let data = {
            articles: results[0],
            users: results[1],
            videos: results[2],
        }
        res.send({
            status: 0,
            data,
            msg: '搜索成功',
        })
    })
}

exports.getArticleSearch = (req, res) => {
    let _key = req.query.key
    let conSql = `title like '%${_key}%'`
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize

    const sqlStr = `select * from ev_articles where state="1" and ${conSql} order by pub_date desc limit ?,?; select count(*) as count from ev_articles where state="1"`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1) * ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 2) return res.cc('获取失败')
        for(let item of results[0]) {
            item.desc = item.content.replace(/<[^>]+>/ig, '')
            item.cover_img = oss + item.cover_img
        }
        let count = results[1][0].count
        res.send({
            status: 0,
            data: results[0],
            count,
            pageSize: ps,
            more: parseInt(req.query.offset)*ps < count
        })
    })
}

exports.getVideoSearch = (req, res) => {
    let _key = req.query.key
    let conSql = `ev_v.title like '%${_key}%'`
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize

    const sqlStr = `select ev_v.*, ev_u.user_pic, ev_u.nickname from ev_videos ev_v join ev_users ev_u on ev_v.user_id = ev_u.id where ev_v.state = "2" and ${conSql} limit ?,?; select count(*) as count from ev_videos ev_v where state="2" and ${conSql}`;
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1) * ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 2) return res.cc('获取失败')
        for(let item of results[0]) {
            item.cover_img = oss + item.cover_img
            item.user_pic = oss + item.user_pic
            delete item.video_url
        }
        let count = results[1][0].count
        res.send({
            status: 0,
            data: results[0],
            count,
            pageSize: ps,
            more: parseInt(req.query.offset)*ps < count
        })
    })
}

exports.getUserSearch = (req, res) => {
    let _key = req.query.key
    let conSql = `ev_u.nickname like '%${_key}%'`
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize;
    const sqlStr = `select *, (select count(*) from ev_user_follow ev_uf where ev_uf.follow_id = ev_u.id and ev_uf.user_id = '${req.user.id}') as is_follow from ev_users ev_u where status <> "2" and ${conSql} limit ?,?; select count(*) as count from ev_users ev_u where status <> "2" and ${conSql}`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1) * ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results[0]) {
            item.user_pic = oss + item.user_pic
            delete item.password
        }
        let count = results[1][0].count
        res.send({
            status: 0,
            data: results[0],
            msg: '获取成功',
            count,
            more: parseInt(req.query.offset)*ps < count
        })
    })
}