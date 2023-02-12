const db = require('../../db/index')
const {
    pageSize, oss
} = require('../../config')
const {createConditionSql} = require("../../tools");

// 获取评论列表
exports.getCommentList = (req, res) => {

    let is_deleteSql = ''
    if(req.query.is_delete) {
        is_deleteSql = `(ev_c.is_delete = ${req.query.is_delete})`
    } else {
        is_deleteSql = `(ev_c.is_delete <> -1)`
    }

    let timeSql = ''
    if(req.query.startTime && req.query.endTime) {
        timeSql = `(ev_cr.time between ${req.query.startTime} and ${req.query.endTime})`
    } else {
        timeSql = `(ev_cr.time between 0 and ${Date.now()})`
    }

    let val = req.query.val ? req.query.val : ''
    let valSql = `(ev_c.comment_id like '%${val}%' or ev_c.content like '%${val}%' or ev_c.nickname like '%${val}%' or ev_c.user_id like '%${val}%' or ev_cr.art_id like '%${val}%')`

    const sqlStr = `select *, (select count(*) - 1 from ev_article_comment_record ev_cr where ev_cr.parent_id = ev_c.comment_id) as reply, (select count(IF(ev_cr.parent_id = ev_cpr.comment_id,true,null)) from ev_article_comment_praise_record ev_cpr) as praise from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id where ev_cr.child_id is null and ${is_deleteSql} and ${timeSql} and ${valSql} order by ev_cr.time desc limit ?,?`
    console.log(sqlStr)
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id where ev_cr.child_id is null`
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取评论列表成功',
                count: results && results.length ? results[0].count : 0,
                pageSize
            })
        })
    })
}

// 删除评论
exports.deleteComment = (req, res) => {
    const sqlStr = `select * from ev_article_comment where comment_id=?`
    db.query(sqlStr, req.body.comment_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('删除评论失败')
        if(results[0].is_delete == 1) return res.cc('删除评论失败')
        const sqlStr = 'update ev_article_comment set is_delete=1 where comment_id=?'
        db.query(sqlStr, req.body.comment_id, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('删除评论失败')
            res.cc('删除评论成功', 0)
        })
    })
}

// 获取楼层评论
exports.getCommentFloor = (req, res) => {
    const sqlStr = `select *, (select count(IF(ev_cr.child_id = ev_cpr.comment_id,true,null)) from ev_article_comment_praise_record ev_cpr) as praise from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.child_id = ev_c.comment_id where ev_cr.art_id=? and ev_cr.parent_id=? and ev_cr.child_id is not null order by ev_cr.time desc limit ?, ?`
    db.query(sqlStr, [
        req.query.art_id,
        req.query.comment_id,
        (parseInt(req.query.offset) - 1)  * req.query.limit,
        parseInt(req.query.limit)
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id where ev_cr.art_id=? and ev_cr.parent_id=? and ev_cr.child_id is not null`
        db.query(sqlStr, [
            req.query.art_id,
            req.query.comment_id
        ], (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                data,
                msg: '获取楼层评论成功',
                count,
                more: parseInt(req.query.offset)*req.query.limit < count
            })
        })
    })
}

// 获取视频评论
exports.getVideoCommentList = (req, res) => {
    let {is_deleteSql, timeSql, valSql} = createConditionSql([
        {
            prefix: 'ev_vc',
            name: 'is_delete',
            type: 'eval',
            t: 'string',
        },{
            prefix: 'ev_vc',
            name: 'time',
            name_dic1: 'startTime',
            name_dic2: 'endTime',
            type: 'range',
        },{
            name: 'val',
            type: 'like',
            fields: ['ev_vc.comment_id','ev_vc.user_id','ev_vc.video_id','ev_vc.content', 'ev_u.nickname']
        }
    ], req.query)

    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = `select ev_vc.*, ev_v.video_url, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_video_comment_praise_record ev_vcpr where ev_vcpr.comment_id=ev_vc.comment_id) as praise_count from ev_video_comment ev_vc join ev_users ev_u on ev_vc.user_id = ev_u.id inner join ev_videos ev_v on ev_vc.video_id = ev_v.id where ${is_deleteSql} and ${timeSql} and ${valSql} order by ev_vc.time desc limit ?,?`
    console.log(sqlStr)
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
            item.video_url = oss + item.video_url
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_video_comment ev_vc join ev_users ev_u on ev_vc.user_id = ev_u.id`
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取视频评论列表成功',
                count: results[0].count,
                pageSize: ps
            })
        })
    })
}

exports.deleteVideoComment = (req, res) => {
    const sqlStr = 'select * from ev_video_comment where comment_id=?'
    db.query(sqlStr, req.body.comment_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('评论内容不存在')
        if(results[0].is_delete == '1') return res.cc('评论已删除')

        const sqlStr = 'update ev_video_comment set is_delete=? where comment_id=?'
        db.query(sqlStr, [
            '1',
            req.body.comment_id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('删除评论失败')
            res.cc('删除评论成功', 0)
        })
    })
}