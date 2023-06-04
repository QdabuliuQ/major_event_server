const db = require('../../db/index')
const {pageSize, oss} = require("../../config");
const {
    createConditionSql
} = require('../../tools')

exports.getVideoList = (req, res) => {
    let { stateSql, timeSql, valSql } = createConditionSql([
        {
                prefix: 'ev_v',
                name: 'state',
                type: 'eval',
                t: 'string',
        },{
            prefix: 'ev_v',
            name: 'time',
            name_dic1: 'startTime',
            name_dic2: 'endTime',
            type: 'range',
        },{
            name: 'val',
            type: 'like',
            fields: ['ev_v.id','ev_v.title','ev_v.user_id','ev_u.nickname']
        }],
        req.query
    )

    const sqlStr = `select ev_v.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id) as praise_count, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id) as collect_count from ev_videos ev_v join ev_users ev_u on ev_v.user_id=ev_u.id where ${stateSql} and ${timeSql} and ${valSql} order by ev_v.time desc limit ?,?`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.video_url = oss + item.video_url
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_videos ev_v join ev_users ev_u on ev_v.user_id=ev_u.id where ${stateSql} and ${timeSql} and ${valSql}`
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取视频列表成功',
                count: results[0].count,
                pageSize,
            })
        })
    })
}

// 通过/封禁视频
exports.updateVideoState = (req, res) => {
    const sqlStr = `select * from ev_videos where id = ?`
    db.query(sqlStr, req.body.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('更新视频状态失败')
        if(results[0].state == '4') res.cc('更新视频状态失败')
        const sqlStr = 'update ev_videos set state = ? where id = ?'
        db.query(sqlStr, [
            req.body.state,
            req.body.id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('更新审核状态失败')
            res.cc('更新审核状态成功', 0)
        })
    })


}

// 获取视频点赞用户
exports.getVideoPraise = (req, res) => {
    let pageSize = 30
    const sqlStr = 'select ev_u.id, ev_u.nickname, ev_u.intro, ev_u.user_pic from ev_video_praise_record ev_vpr join ev_users ev_u on ev_vpr.user_id = ev_u.id where ev_vpr.video_id=? order by ev_vpr.time desc limit ?,?'

    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_video_praise_record ev_vpr join ev_users ev_u on ev_vpr.user_id = ev_u.id where ev_vpr.video_id=?`
        db.query(sqlStr, req.query.id,(err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取点赞列表成功',
                count: results[0].count,
                pageSize,
            })
        })
    })
}

// 获取视频收藏
exports.getVideoCollect = (req, res) => {
    let pageSize = 30
    const sqlStr = 'select ev_u.id, ev_u.nickname, ev_u.intro, ev_u.user_pic from ev_video_collect_record ev_vcr join ev_users ev_u on ev_vcr.user_id = ev_u.id where ev_vcr.video_id=? order by ev_vcr.time desc limit ?,?'

    db.query(sqlStr, [
        req.query.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_video_collect_record ev_vcr join ev_users ev_u on ev_vcr.user_id = ev_u.id where ev_vcr.video_id=?`
        db.query(sqlStr, req.query.id,(err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取收藏列表成功',
                count: results[0].count,
                pageSize,
            })
        })
    })
}