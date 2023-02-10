const db = require('../../db/index')
const {
    uuid
} = require('../../tools')
const {pageSize, oss} = require("../../config");

// 发布视频
exports.pubVideo = (req, res) => {
    const sqlStr = 'insert into ev_videos set ?'
    db.query(sqlStr, {
        id: 'v_'+uuid(16),
        title: req.body.title,
        video_url: req.body.video_url,
        cover_img: req.body.cover_img,
        duration: req.body.duration,
        time: Date.now(),
        user_id: req.user.id,
        nickname: req.user.nickname,
        user_pic: req.userData.user_pic
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('发布视频失败')
        res.cc('发布视频成功', 0)
    })
}

exports.getVideoList = (req, res) => {
    let pageSize = 5
    const sqlStr = `select ev_v.*, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id) as praise_count, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_praise, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id) as collect_count, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_collect from ev_videos ev_v where state = '2' and ev_v.is_delete = '0' order by ev_v.time desc limit ?,?`
    db.query(sqlStr, [
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.video_url = oss + item.video_url
            item.cover_img = oss + item.cover_img
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_videos ev_v where state = '2'`
        db.query(sqlStr, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取视频列表成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count
            })
        })
    })
}

// 点赞/取消点赞video
exports.praiseVideo = (req, res) => {
    const sqlStr = 'select * from ev_video_praise_record where video_id=? and user_id=?'
    db.query(sqlStr, [
        req.query.video_id,
        req.user.id,
    ], (err, results) => {
        if(err) return res.cc(err)
        let is_praise = req.query.is_praise
        if(is_praise == 1 && results.length === 1) {
            return res.cc('网络错误')
        }
        if(is_praise == 0 && results.length === 0) {
            return res.cc('网络错误')
        }
        const sqlStr = is_praise == 1 ? 'insert into ev_video_praise_record set ?' : 'delete from ev_video_praise_record where video_id=? and user_id=?'
        db.query(sqlStr, is_praise == 1 ? {
            video_id: req.query.video_id,
            user_id: req.user.id,
            time: Date.now(),
            nickname: req.user.nickname,
            intro: req.user.intro,
            user_pic: req.userData.user_pic
        } : [
            req.query.video_id,
            req.user.id
        ], (err, results) => {
            console.log(err,)
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc('操作成功', 0)
        })
    })
}

// 收藏/取消收藏video
exports.collectVideo = (req, res) => {
    const sqlStr = 'select * from ev_video_collect_record where video_id=? and user_id=?'

    db.query(sqlStr, [
        req.query.video_id,
        req.user.id,
    ], (err, results) => {
        if(err) return res.cc(err)
        let is_praise = req.query.is_praise
        if(is_praise == 1 && results.length === 1) {
            return res.cc('网络错误')
        }
        if(is_praise == 0 && results.length === 0) {
            return res.cc('网络错误')
        }
        const sqlStr = is_praise == 1 ? 'insert into ev_video_collect_record set ?' : 'delete from ev_video_collect_record where video_id=? and user_id=?'
        db.query(sqlStr, is_praise == 1 ? {
            video_id: req.query.video_id,
            user_id: req.user.id,
            time: Date.now(),
            nickname: req.user.nickname,
            intro: req.user.intro,
            user_pic: req.userData.user_pic
        } : [
            req.query.video_id,
            req.user.id
        ], (err, results) => {
            console.log(err,)
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc('操作成功', 0)
        })
    })
}