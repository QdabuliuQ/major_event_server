const db = require('../../db/index')
const {
    uuid
} = require('../../tools')
const {pageSize, oss} = require("../../config");

// 发布视频
exports.pubVideo = (req, res) => {
    if(req.userData.status == 3) {
        return res.cc('账号被禁言')
    }
    const sqlStr = 'insert into ev_videos set ?'
    db.query(sqlStr, {
        id: 'v_'+uuid(16),
        title: req.body.title,
        video_url: req.body.video_url,
        cover_img: req.body.cover_img,
        duration: req.body.duration,
        time: Date.now(),
        user_id: req.user.id,
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('发布视频失败')
        res.cc('发布视频成功', 0)
    })
}

exports.getVideoList = (req, res) => {
    const sqlStr = `select ev_v.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id) as praise_count, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_praise, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id) as collect_count, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_collect, (select count(*) from ev_video_comment ev_vc where ev_vc.video_id = ev_v.id) as comment_count from ev_videos ev_v join ev_users ev_u on ev_v.user_id=ev_u.id where state = '2' order by ev_v.time desc limit ?,?`
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
            return res.cc('已收藏', 0)
        }
        if(is_praise == 0 && results.length === 0) {
            return res.cc('网络错误')
        }
        const sqlStr = is_praise == 1 ? 'insert into ev_video_collect_record set ?' : 'delete from ev_video_collect_record where video_id=? and user_id=?'
        db.query(sqlStr, is_praise == 1 ? {
            video_id: req.query.video_id,
            user_id: req.user.id,
            time: Date.now()
        } : [
            req.query.video_id,
            req.user.id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc('操作成功', 0)
        })
    })
}

// 发表评论
exports.pubVideoComment = (req, res) => {
    if(req.userData.status == 3) {
        return res.cc('账号被禁言')
    }
    const sqlStr = 'insert into ev_video_comment set ?'
    db.query(sqlStr, {
        comment_id: 'vc_'+uuid(16),
        user_id: req.user.id,
        video_id: req.body.video_id,
        content: req.body.content,
        time: Date.now(),
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('发送失败')
        res.cc('发送成功', 0)
    })
}

// 获取视频评论
exports.getVideoComment = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    const sqlStr = `select ev_vc.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_video_comment_praise_record ev_vcpr where ev_vcpr.comment_id=ev_vc.comment_id) as praise_count, (select count(*) from ev_video_comment_praise_record ev_vcpr where ev_vcpr.comment_id=ev_vc.comment_id and ev_vcpr.user_id='${req.user.id}') as is_praise from ev_video_comment ev_vc join ev_users ev_u on ev_vc.user_id = ev_u.id where ev_vc.video_id = ? ${req.u_type === 'client' ? 'and ev_vc.is_delete = "0"' : ''} order by ev_vc.time desc limit ?,?`
    db.query(sqlStr, [
        req.query.video_id,
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
            delete item.is_delete
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_video_comment  where video_id = ? ${req.type === 'client' ? 'and is_delete = "0"' : ''}`
        db.query(sqlStr, req.query.video_id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取视频评论成功',
                count: results[0].count,
                pageSize: ps,
                more: parseInt(req.query.offset)*ps < results[0].count
            })
        })
    })
}

// 点赞/取消点赞评论
exports.praiseComment = (req, res) => {
    const sqlStr = 'select * from ev_video_comment_praise_record where user_id=? and comment_id=? and video_id=?'
    db.query(sqlStr, [
        req.user.id,
        req.body.comment_id,
        req.body.video_id
    ], (err, results) => {
        if(err) return res.cc(err)
        let is_praise = req.body.is_praise
        if(results.length == 0 && is_praise == 0) return res.cc('操作失败')
        if(results.length == 1 && is_praise == 1) return res.cc('操作失败')

        const sqlStr = is_praise == 1 ?  'insert into ev_video_comment_praise_record set ?' : 'delete from ev_video_comment_praise_record where user_id=? and comment_id=? and video_id=?'
        db.query(sqlStr, is_praise == 1 ? {
            user_id: req.user.id,
            comment_id: req.body.comment_id,
            video_id: req.body.video_id,
            time: Date.now()
        } : [
            req.user.id,
            req.body.comment_id,
            req.body.video_id
        ], (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc('操作成功',0)
        })
    })
}

exports.getVideoById = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize

    let stateSql = ''
    if(!req.query.state || req.query.state == '0') {
        stateSql = `ev_v.state <> 0`
    } else {
        stateSql = `ev_v.state = '${req.query.state}'`
    }

    const sqlStr = `select *, (select count(*) as count from ev_video_comment where ev_v.id=video_id) as comment_count, (select count(*) as count from ev_video_praise_record where ev_v.id=video_id) as praise_count, (select count(*) as count from ev_video_collect_record where ev_v.id=video_id) as collect_count from ev_videos ev_v where user_id=? and ${stateSql} order by ev_v.time desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.video_url = oss + item.video_url
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_videos where user_id = ?`
        db.query(sqlStr, [
            req.user.id
        ], (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取视频列表成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*ps < results[0].count
            })
        })
    })
}

exports.getVideoDetail = (req, res) => {
    const sqlStr = `select ev_v.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id) as praise_count, (select count(*) from ev_video_praise_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_praise, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id) as collect_count, (select count(*) from ev_video_collect_record ev_vpr where ev_vpr.video_id = ev_v.id and ev_vpr.user_id = '${req.user.id}') as is_collect, (select count(*) from ev_video_comment ev_vc where ev_vc.video_id = ev_v.id) as comment_count from ev_videos ev_v join ev_users ev_u on ev_v.user_id=ev_u.id where state = '2' and ev_v.id=?`

    db.query(sqlStr, req.query.id, (err, results) => {
        console.log(results)
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('获取视频信息失败')
        for(let item of results) {
            item.video_url = oss + item.video_url
            item.cover_img = oss + item.cover_img
            item.user_pic = oss + item.user_pic
        }
        res.send({
            status: 0,
            data: results[0],
            msg: '获取视频信息成功',
        })
    })
}

// 删除视频
exports.deleteVideoById = (req, res) => {
    const sqlStr = 'select * from ev_videos where id=? and user_id=? and state="2"'
    db.query(sqlStr, [
        req.body.id,
        req.user.id
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('删除失败')

        const sqlStr = 'update ev_videos set state="4" where id=?'
        db.query(sqlStr, req.body.id, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('删除失败')
            res.cc('删除成功', 0)
        })
    })
}