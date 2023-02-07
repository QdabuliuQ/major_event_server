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
    const sqlStr = `select ev_v.* from ev_videos ev_v where state = '2' order by ev_v.time desc limit ?,?`
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