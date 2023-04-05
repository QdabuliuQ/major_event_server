const db = require('../../db/index')
const bcrypt = require('bcryptjs')  // 密码校验
const { oss, pageSize} = require('../../config')
const { cutUrl, uuid } = require("../../tools");

// 获取用户信息
exports.getUserInfo = (req, res) => {
    delete req.userData.password
    req.userData.user_pic = oss + req.userData.user_pic
    req.userData.bg_image = oss + req.userData.bg_image
    res.send({
        status: 0,
        msg: '获取用户信息成功',
        data: req.userData
    })
}

// 更新用户信息
exports.updateUserInfo = (req, res) => {
    const sqlStr = `update ev_users set ? where id='${req.user.id}'`
    let body = req.body
    body.user_pic = cutUrl(body.user_pic)
    body.bg_image = cutUrl(body.bg_image)
    db.query(sqlStr, body, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('更新用户信息失败')
        const sqlStr = 'select * from ev_users where id = ?'
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            delete results[0].password
            results[0].user_pic = oss + results[0].user_pic
            results[0].bg_image = oss + results[0].bg_image
            res.send({
                status: 0,
                msg: '更新用户信息成功',
                data: results[0]
            })
        })
    })
}

// 获取用户信息
exports.getUserInfoById = (req, res) => {
    const sqlStr = `select *, (select count(*) from ev_user_follow where follow_id = '${req.params.id}' and user_id = '${req.user.id}') as is_follow, (select count(*) from ev_user_follow where user_id = '${req.params.id}') as followCount, (select count(*) from ev_user_follow where follow_id = '${req.params.id}') as fanCount from ev_users where id = ?`
    db.query(sqlStr, req.params.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('获取用户信息失败')
        if(results[0].status == 2) return res.cc('账号被封禁', 0)
        results[0].user_pic = oss + results[0].user_pic
        results[0].bg_image = oss + results[0].bg_image
        delete results[0].password
        delete results[0].phone
        delete results[0].email
        res.send({
            status: 0,
            msg: '获取用户信息成功',
            data: results[0],
        })
    })
}

exports.getUserArticleById = (req, res) => {
    const sqlStr = `select * from ev_articles where author_id= ? and is_delete = "0" and state = "1" order by pub_date desc limit ?,?`
    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1) * pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
            item.targets = JSON.parse(item.targets)
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_articles where author_id=? and is_delete = "0" and state = "1"`
        db.query(sqlStr, req.query.id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                data,
                msg: '获取文章列表成功',
                count,
                more: parseInt(req.query.offset)*pageSize < count
            })
        })
    })
}

// 获取用户收藏
exports.getUserCollectById = (req, res) => {
    const sqlStr = 'select ev_c.*, ev_a.* from ev_article_collect_record ev_c join ev_articles ev_a on ev_c.art_id = ev_a.id where ev_c.user_id=? order by ev_c.time desc limit ?,?'
    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.content = item.content.replace(/<[^>]+>/ig, '')
            item.targets = JSON.parse(item.targets)
            item.cover_img = oss + item.cover_img
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_article_collect_record where user_id=?'
        db.query(sqlStr, req.query.id, (err, results) => {
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

exports.getUserVideoById = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = `select ev_v.*, ev_u.user_pic, ev_u.nickname from ev_videos ev_v join ev_users ev_u on ev_v.user_id = ev_u.id where ev_v.state = "2" and user_id=? limit ?,?; select count(*) as count from ev_videos ev_v where state="2" and user_id=?`;

    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1)*ps,
        ps,
        req.query.id
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

exports.getUserCollectVideoById = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = 'select ev_c.*, ev_v.*, ev_u.nickname, ev_u.user_pic from ev_video_collect_record ev_c join ev_videos ev_v on ev_c.video_id = ev_v.id inner join ev_users ev_u on ev_v.user_id = ev_u.id where ev_c.user_id=? order by ev_c.time desc limit ?,?; select count(*) as count from ev_video_collect_record where user_id = ?'
    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1)*ps,
        ps,
        req.query.id
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

// 关注/取消关注用户
exports.updateFollowUser = (req, res) => {
    if(req.body.follow_id == req.user.id) return res.cc('操作失败')
    // is_follow  1 关注用户  0 取关用户
    const sqlStr = 'select * from ev_user_follow where follow_id = ? and user_id = ?'
    db.query(sqlStr, [
        req.body.follow_id,
        req.user.id
    ], (err, results) => {
        if(err) return res.cc(err)
        if(req.body.is_follow && results.length > 0) {
            return res.cc('已关注用户', 0)
        }
        if(!req.body.is_follow && results.length == 0) {
            return res.cc('已取关用户', 0)
        }
        const sqlStr = req.body.is_follow ? 'insert into ev_user_follow set ?' : 'delete from ev_user_follow where user_id = ? and follow_id = ?'
        db.query(sqlStr, req.body.is_follow ? {
            follow_id: req.body.follow_id,
            user_id: req.user.id,
            time: Date.now()
        } : [
            req.user.id,
            req.body.follow_id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc(req.body.is_follow ? '关注成功' : '取关成功', 0)
        })
    })
}

// 获取用户关注
exports.getUserFollow = (req, res) => {
	let val = req.query.val ? `and ev_u.nickname like '%${req.query.val}%'` : `and ev_u.nickname like '%%'`
    const sqlStr = `select ev_u.id, ev_u.nickname, ev_u.user_pic, ev_u.intro, (select count(*) from ev_user_follow ev_uf_2 where ev_uf_2.follow_id = ev_u.id and ev_uf_2.user_id = '${req.user.id}') as is_follow from ev_user_follow ev_uf join ev_users ev_u on ev_uf.follow_id = ev_u.id where ev_uf.user_id = ? ${val} order by ev_uf.time desc limit ?,?`
     
    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1) * pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_user_follow ev_uf join ev_users ev_u on ev_uf.follow_id = ev_u.id where user_id = '${req.query.id}' ${val}`
		console.log(sqlStr)
        db.query(sqlStr, (err, results) => {
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取关注列表成功',
                data,
                more: parseInt(req.query.offset)*pageSize < count,
                pageSize,
                count
            })
        })
    })
}

exports.getUserFans = (req, res) => {
    const sqlStr = `select ev_u.id, ev_u.nickname, ev_u.user_pic, ev_u.intro, (select count(*) from ev_user_follow ev_uf_2 where ev_uf_2.follow_id = ev_u.id and ev_uf_2.user_id = '${req.user.id}') as is_follow from ev_user_follow ev_uf join ev_users ev_u on ev_uf.user_id = ev_u.id where ev_uf.follow_id = ? order by ev_uf.time desc limit ?,?`

    db.query(sqlStr, [
        // req.user.id,
        req.query.id,
        (parseInt(req.query.offset)-1) * pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_user_follow where follow_id = '${req.query.id}'`
        db.query(sqlStr, (err, results) => {
            console.log(results)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取关注列表成功',
                data,
                more: parseInt(req.query.offset)*pageSize < count,
                pageSize,
                count
            })
        })
    })
}
