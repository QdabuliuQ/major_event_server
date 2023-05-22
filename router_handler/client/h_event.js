const db = require('../../db/index')
const {
    pageSize,
    oss
} = require('../../config')
const {
	uuid
} = require('../../tools')

exports.pubEvent = (req, res) => {
	let {type, images, content, resource_id} = req.body
	if(type == '1' && images == '' &&  !content.length) return res.cc('提交失败')
	const sqlStr = 'insert into ev_events set ?'
	db.query(sqlStr, {
		ev_id: 'e_'+uuid(20, 16),
		user_id: req.user.id,
		content,
		type,
		resource_id: type == '1' ? null : resource_id,
		images,
		time: Date.now()
	}, (err, results) => {
		if(err) return res.cc(err)
		if(results.affectedRows != 1) return res.cc('提交失败')
		res.cc('提交成功', 0)
	})
}

const formatData = (item) => {
	if(item.cover_img) item.cover_img = oss + item.cover_img
	if(item.content) item.content = item.content.replace(/<[^>]+>/ig, '')
	if(item.user_pic) item.user_pic = oss + item.user_pic
}
const formatEventData = (data) => {
	if(data.images) {
		let images = JSON.parse(data.images)
		for(let img of images) {
			img.link = oss + img.link
		}
		data.images = images
	}
	if(data.resource_info && data.resource_info != -1) {
		data.resource_info = JSON.parse(data.resource_info)
		formatData(data.resource_info)
	}
}

// 获取动态列表
exports.getEventListById = (req, res) => {
	let ps = 30
	const sqlStr = `select ev_e.*, ev_u.nickname, ev_u.user_pic, (
		case ev_e.type 
			when '2' then if(ev_a.state = '1', GROUP_CONCAT(JSON_OBJECT('id',ev_a.id, 'title',ev_a.title, 'cover_img', ev_a.cover_img, 'content', ev_a.content)), -1) 
			when '3' then if(ev_v.state = '2', GROUP_CONCAT(JSON_OBJECT('id',ev_v.id, 'title',ev_v.title, 'cover_img', ev_v.cover_img, 'duration', ev_v.duration, 'time', ev_v.time)), -1)  
			when '4' then if(ev_e.state = '1' and ev_e_2.state = '1', GROUP_CONCAT(JSON_OBJECT('ev_id',ev_e_2.ev_id, 'user_id',ev_e_2.user_id, 'user_pic', ev_u_2.user_pic, 'nickname', ev_u_2.nickname, 'content', ev_e_2.content, 'type', ev_e_2.type, 'resource_id', ev_e_2.resource_id, 'images', ev_e_2.images, 'time', ev_e_2.time, 'resource_info', (
				case ev_e_2.type
					when '2' then if(ev_e_2.state = '1', (select getEventArticleInfo(ev_e_2.resource_id)), -1) 
					when '3' then if(ev_e_2.state = '1', (select getEventVideoInfo(ev_e_2.resource_id)), -1) 
					else null end
				))), -1)
			else null end
 	) as resource_info, (select count(*) from ev_event_comment where ev_id=ev_e.ev_id and is_delete='0') as commentCount, (select count(*) from ev_event_praise_record where ev_id=ev_e.ev_id) as praiseCount, (select count(*) from ev_event_praise_record where ev_id=ev_e.ev_id and user_id='${req.user.id}') as isPraise, (select count(*) from ev_events where type='4' and resource_id=ev_e.ev_id) as shareCount from ev_events ev_e join ev_users ev_u on ev_e.user_id = ev_u.id left join ev_articles ev_a on ev_e.type = '2' and ev_e.resource_id = ev_a.id left join ev_videos ev_v on ev_e.type = '3' and ev_e.resource_id = ev_v.id left join ev_events ev_e_2 on ev_e.type = '4' and ev_e.resource_id = ev_e_2.ev_id left join ev_users ev_u_2 on ev_e_2.user_id = ev_u_2.id where ev_e.user_id=? and ev_e.state='1' group by ev_e.ev_id order by ev_e.time desc limit ?,?`
	db.query(sqlStr, [
		req.query.id,
		(parseInt(req.query.offset)-1) * ps,
		ps
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
			if(item.images) {
				let images = JSON.parse(item.images)
				for(let img of images) {
					img.link = oss + img.link
				}
				item.images = images
			}
			if(item.resource_info) {
				item.resource_info = JSON.parse(item.resource_info)
				formatData(item.resource_info)
				if(item.type == '4') {
					formatEventData(item.resource_info)
				}
			}
		}
		let data = results
		const sqlStr = 'select count(*) as count from ev_events where user_id=? and state="1"'
		db.query(sqlStr, req.query.id, (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				count,
				more: parseInt(req.query.offset)*ps < count,
				msg: '获取成功'
			})
		})
	})
}

exports.addEventComment = (req, res) => {
	let val = req.body.content.trim()
	if(val.length == 0 || val.length > 100) return res.cc('发表失败')
	if(req.userData.status == '3') {
	    return res.cc('账号禁言中')
	}
	const sqlStr = 'insert into ev_event_comment set ?'
	db.query(sqlStr, {
		comment_id: 'ec_'+uuid(20, 16),
		ev_id: req.body.ev_id,
		user_id: req.user.id,
		content: req.body.content,
		time: Date.now(),
	}, (err, results) => {
		if(err) return res.cc(err)
		if(results.affectedRows != 1) return res.cc('发表失败')
		res.cc('发表成功', 0)
	})
}

exports.getEventComment = (req, res) => {
	let ps = 30, offset = parseInt(req.query.offset)
	const sqlStr = `select ev_ec.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_event_comment_praise_record where comment_id=ev_ec.comment_id and ev_id=ev_ec.ev_id) as praiseCount, (select count(*) from ev_event_comment_praise_record where comment_id=ev_ec.comment_id and ev_id=ev_ec.ev_id and user_id='${req.user.id}') as is_praise from ev_event_comment ev_ec join ev_users ev_u on ev_ec.user_id = ev_u.id where ev_ec.is_delete = '0' and ev_ec.ev_id=? order by praiseCount desc,ev_ec.time desc limit ?,?`
	db.query(sqlStr, [
		req.query.ev_id,
		(offset-1)*ps,
		ps
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = 'select count(*) as count from ev_event_comment where ev_id=?'
		db.query(sqlStr, req.query.ev_id, (err, results) => {
			let count = results[0].count
			res.send({ 
				status: 0,
				msg: '获取成功',
				data,
				count,
				more: offset*ps < count
			})
		})
	})
}

exports.praiseComment = (req, res) => {
	const sqlStr = req.body.is_praise == 1 ? 'insert into ev_event_comment_praise_record set ?' : 'delete from ev_event_comment_praise_record where comment_id=? and user_id=? and ev_id=?'
	db.query(sqlStr, req.body.is_praise == '1' ? {
        user_id: req.user.id,
        comment_id: req.body.comment_id,
        ev_id: req.body.ev_id,
        time: Date.now()
    } : [
        req.body.comment_id,
        req.user.id,
        req.body.ev_id
    ], (err, results) => {
		if(err) return res.cc(err)
		if(results.affectedRows != 1) return res.cc('操作失败')
		
		res.cc('操作成功', 0)
	})
}

// 点赞动态
exports.praiseEvent = (req, res) => {
	const sqlStr = req.body.is_praise == 1 ? 'insert into ev_event_praise_record set ?' : 'delete from ev_event_praise_record where user_id=? and ev_id=?'
	db.query(sqlStr, req.body.is_praise == '1' ? {
	    user_id: req.user.id,
	    ev_id: req.body.ev_id,
	    time: Date.now()
	} : [
	    req.user.id,
	    req.body.ev_id
	], (err, results) => {
		if(err) return res.cc(err)
		if(results.affectedRows != 1) return res.cc('操作失败')
		
		res.cc('操作成功', 0)
	})
}

// 动态点赞列表
exports.getEventPraiseList = (req, res) => {
	let ps = 30, offset = parseInt(req.query.offset)
	const sqlStr = 'select ev_epr.*, ev_u.nickname, ev_u.user_pic from ev_event_praise_record ev_epr join ev_users ev_u on ev_epr.user_id = ev_u.id where ev_epr.ev_id=? order by ev_epr.time desc limit ?,?'
	db.query(sqlStr, [
		req.query.ev_id,
		(offset-1)*ps,
		ps
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss+item.user_pic
		}
		let data = results
		const sqlStr = 'select count(*) as count from ev_event_praise_record where ev_id=?'
		db.query(sqlStr, req.query.ev_id, (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				msg: '获取成功',
				count,
				more: offset*ps < count
			})
		})
	})
}

// 删除动态
exports.deleteEvent = (req, res) => {
	const sqlStr = 'select * from ev_events where ev_id=? and state="1" and user_id=?'
	db.query(sqlStr, [
		req.body.ev_id,
		req.user.id
	], (err, results) => {
		if(err) return res.cc(err)
		console.log(req.body.ev_id)
		if(results.length != 1) return res.cc('删除失败')
		const sqlStr = 'update ev_events set state="3" where ev_id=?'
		db.query(sqlStr, req.body.ev_id, (err, results) => {
			if(err) return res.cc(err)
			if(results.affectedRows != 1) return res.cc('删除失败')
			res.cc('删除成功', 0)
		})
	})
}

// 获取动态转发
exports.getEventReplyList = (req, res) => {
	const ps = 30, offset = parseInt(req.query.offset)
	const sqlStr = 'select ev_u.id, ev_u.nickname, ev_u.user_pic, ev_e.time from ev_events ev_e join ev_users ev_u on ev_e.user_id = ev_u.id where ev_e.resource_id=? and ev_e.state = "1" order by ev_e.time desc limit ?,?'
	db.query(sqlStr, [
		req.query.ev_id,
		(offset-1)*ps,
		ps
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = 'select count(*) as count from ev_events where resource_id=? and state = "1"'
		db.query(sqlStr, req.query.ev_id, (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				msg: '获取成功',
				count,
				more: offset*ps < count
			})
		})
	})
}

// 获取动态数据
exports.getEventData = (req, res) => {
	let ev_id = req.query.ev_id
	const sqlStr = `select (select count(*) from ev_event_comment where ev_id='${ev_id}' and is_delete='0') as commentCount, (select count(*) from ev_event_praise_record where ev_id='${ev_id}') as praiseCount, (select count(*) from ev_event_praise_record where ev_id='${ev_id}' and user_id='${req.user.id}') as isPraise, (select count(*) from ev_events where type='4' and resource_id='${ev_id}') as shareCount from ev_events` 
	db.query(sqlStr, (err, results) => {
		if(err) return res.cc(err)
		res.send({
			status: 0,
			msg: '获取成功',
			data: results[0]
		})
	})
}

// 举报动态
exports.reportEvent = (req, res) => {
	const sqlStr = 'select * from ev_events where ev_id=? and state = "1"'
	db.query(sqlStr, req.body.ev_id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('举报失败')
		const sqlStr = 'insert ev_event_report set ?'
		db.query(sqlStr, {
			ev_id: req.body.ev_id,
			user_id: req.user.id,
			reason: req.body.reason,
		}, (err, results) => {
			if(err) return res.cc('举报审核中', 0)
			res.cc('举报成功', 0)
		})
	})
	
}