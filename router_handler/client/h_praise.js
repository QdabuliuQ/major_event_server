const db = require('../../db/index')
const {
    oss, pageSize
} = require('../../config')

exports.getPraiseList = (req, res) => {
    const sqlStr = `select ev_a.*, ev_apr.time p_time from ev_article_praise_record ev_apr join ev_articles ev_a on ev_a.id = ev_apr.art_id where ev_apr.user_id=? and ev_a.state = '1' order by ev_apr.time desc limit ?,15`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.params.offset)-1)*15
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_praise_record ev_apr join ev_articles ev_a on ev_a.id = ev_apr.art_id where ev_apr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1'`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取点赞文章成功',
                data,
                count,
                more: parseInt(req.params.offset)*15 < count
            })
        })
    })
}

exports.getBrowseList = (req, res) => {
    const sqlStr = `select ev_a.*, ev_abr.time b_time from ev_article_browse_record ev_abr join ev_articles ev_a on ev_a.id = ev_abr.art_id where ev_abr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1' order by ev_abr.time desc limit ?,15`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.params.offset)-1)*15
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_browse_record ev_abr join ev_articles ev_a on ev_a.id = ev_abr.art_id where ev_abr.user_id=? and ev_a.is_delete = '0' and ev_a.state = '1'`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                msg: '获取点赞文章成功',
                data,
                count,
                more: parseInt(req.params.offset)*15 < count
            })
        })
    })
}

exports.getVideoPraiseList = (req, res) => {
	const sqlStr = `select ev_v.*, ev_avpr.time p_time, ev_u.nickname, ev_u.user_pic from ev_video_praise_record ev_avpr join ev_videos ev_v on ev_v.id = ev_avpr.video_id join ev_users ev_u on ev_avpr.user_id=ev_u.id where ev_avpr.user_id=? and ev_v.state = '2' order by ev_avpr.time desc limit ?,15`
	db.query(sqlStr, [
		req.user.id,
		(parseInt(req.params.offset)-1)*15
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
		    item.cover_img = oss + item.cover_img
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_video_praise_record ev_avpr join ev_videos ev_v on ev_v.id = ev_avpr.video_id where ev_avpr.user_id=? and ev_v.state = '2'`
		db.query(sqlStr, req.user.id, (err, results) => {
		    if(err) return res.cc(err)
		    let count = results && results.length ? results[0].count : 0
		    res.send({
		        status: 0,
		        msg: '获取点赞视频成功',
		        data,
		        count,
		        more: parseInt(req.params.offset)*15 < count
		    })
		})
	})
}

exports.getVideoBrowseList = (req, res) => {
	const sqlStr = `select ev_v.*, ev_avpr.time p_time, ev_u.nickname, ev_u.user_pic from ev_video_praise_record ev_avpr join ev_videos ev_v on ev_v.id = ev_avpr.video_id join ev_users ev_u on ev_avpr.user_id=ev_u.id where ev_avpr.user_id=? and ev_v.state = '2' order by ev_avpr.time desc limit ?,15`
	db.query(sqlStr, [
		req.user.id,
		(parseInt(req.params.offset)-1)*15
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
		    item.cover_img = oss + item.cover_img
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_video_praise_record ev_avpr join ev_videos ev_v on ev_v.id = ev_avpr.video_id where ev_avpr.user_id=? and ev_v.state = '2'`
		db.query(sqlStr, req.user.id, (err, results) => {
		    if(err) return res.cc(err)
		    let count = results && results.length ? results[0].count : 0
		    res.send({
		        status: 0,
		        msg: '获取点赞视频成功',
		        data,
		        count,
		        more: parseInt(req.params.offset)*15 < count
		    })
		})
	})
}