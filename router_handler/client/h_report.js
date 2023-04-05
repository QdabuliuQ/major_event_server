const db = require('../../db/index')
const {
    uuid
} = require('../../tools')
const {pageSize, oss} = require("../../config");

// 举报文章
exports.addReport = (req, res) => {
    const sqlStr = req.body.type === '1' ? 'select * from ev_articles where id=?' : 'select * from ev_videos where id=?'
    db.query(sqlStr, req.body.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('举报失败')

        const sqlStr = `insert into ${req.body.type === '1' ? 'ev_article_report' : 'ev_video_report'} set ?`
        db.query(sqlStr, {
            id: (req.body.type === '1' ? 'r_a' : 'r_v') + uuid(16),
            user_id: req.user.id,
            [req.body.type === '1' ? 'art_id' : 'video_id']: req.body.id,
            reason: req.body.reason,
            time: Date.now(),
            desc: req.body.desc.trim(),
            proof: req.body.proof,
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('提交失败')
            res.cc('提交成功', 0)
        })
    })

}

// 举报评论
exports.addCommentReport = (req, res) => {
    // 判断是否存在该评论
    const sqlStr = req.body.type == '1' ? 'select * from ev_article_comment where comment_id=? and is_delete="0"' : 'select * from ev_video_comment where comment_id=? and is_delete="0"'
    db.query(sqlStr, req.body.comment_id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('举报失败')
        const sqlStr = 'insert into ev_comment_report set ?'
        db.query(sqlStr, {
            id: 'r_c'+ uuid(16),
            user_id: req.user.id,
            comment_id: req.body.comment_id,
            reason: req.body.reason,
            time: Date.now(),
            type: req.body.type
        }, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('举报失败')
            res.cc('提交成功', 0)
        })
    })
}

// 获取文章举报记录
exports.getArticleReportList = (req, res) => {
    let pageSize = 3
    const sqlStr = `select ev_ar.*, ev_a.cover_img, ev_a.title, ev_a.content from ev_article_report ev_ar join ev_articles ev_a on ev_ar.art_id = ev_a.id where user_id = ? order by ev_ar.time desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_article_report where user_id = ?'
        db.query(sqlStr, req.user.id, (err, results) => {
            console.log(pageSize)
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count,
                msg: '获取举报文章成功'
            })
        })
    })
}

// 获取评论举报记录
exports.getCommentReportList = (req, res) => {
    const sqlStr = `select ev_cr.*, if(ev_cr.type = '1', ev_ac.content, ev_vc.content) as content from ev_comment_report ev_cr LEFT JOIN ev_article_comment ev_ac ON ev_cr.comment_id = ev_ac.comment_id AND ev_cr.type = "1" LEFT JOIN ev_video_comment ev_vc ON ev_cr.comment_id = ev_vc.comment_id AND ev_cr.type = "2" where ev_cr.user_id=? order by ev_cr.time desc limit ?,?`
    console.log(sqlStr)
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        let data = results

        const sqlStr = `select count(*) as count from ev_comment_report where user_id = ?`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取举报评论成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count,
            })
        })
    })
}

exports.getVideoReportList = (req, res) => {
    let pageSize = 3
    const sqlStr = `select ev_vr.*, ev_v.cover_img, ev_v.title, ev_v.time as pub_date from ev_video_report ev_vr join ev_videos ev_v on ev_vr.video_id = ev_v.id where ev_vr.user_id = ? order by ev_vr.time desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1)*pageSize,
        pageSize
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
        }
        let data = results
        const sqlStr = 'select count(*) as count from ev_video_report where user_id = ?'
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                count: results[0].count,
                more: parseInt(req.query.offset)*pageSize < results[0].count,
                msg: '获取举报视频成功'
            })
        })
    })
}

// 获取举报详情
exports.getArticleReportDetail = (req, res) => {
    const sqlStr = `select ev_ar.*, ev_a.cover_img, ev_a.title, ev_a.content, ev_a.pub_date from ev_article_report ev_ar join ev_articles ev_a on ev_ar.art_id = ev_a.id where ev_ar.id = ?`
    db.query(sqlStr, req.params.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc(err)
        results[0].cover_img = oss + results[0].cover_img
        results[0].content = results[0].content.replace(/<[^>]+>/ig, '')
        results[0].proof = results[0].proof != '' ? JSON.parse(results[0].proof) : []
        for(let item of results[0].proof) {
            item.link = oss + item.link
        }
        res.send({
            status: 0,
            data: results[0],
            msg: '获取举报详情成功',
        })
    })
}

exports.addMessageReport = (req, res) => {
	const sqlStr = 'select * from ev_message_report where msg_id=? and user_id=? and state="1";select count(*) as count from ev_users where id=?'
	db.query(sqlStr, [
		req.body.msg_id,
		req.user.id,
		req.body.send_id
	], (err, results) => {
	    if(err) return res.cc(err)
		if(results[0].length == 1) return res.cc('举报审核中', 0)
	    if(results[1][0].count != 1) return res.cc('举报失败')
	    const sqlStr = 'insert into ev_message_report set ?'
	    db.query(sqlStr, {
	        user_id: req.user.id,
	        msg_id: req.body.msg_id,
	        reason: req.body.reason,
	        time: Date.now(),
			send_id: req.body.send_id
	    }, (err, results) => {
	        if(err) return res.cc(err)
	        if(results.affectedRows != 1) return res.cc('举报失败')
	        res.cc('提交成功', 0)
	    })
	})
}