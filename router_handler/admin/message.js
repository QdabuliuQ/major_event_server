const db = require('../../db/index')
const {
  pageSize,
  oss
} = require('../../config')
const {createConditionSql} = require("../../tools");

// 获取消息列表
exports.getMessageList = (req, res) => {
	let {stateSql,typeSql,timeSql,valSql} = createConditionSql([
	    {
	        prefix: 'ev_ml',
	        name: 'state',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_ml',
	        name: 'type',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_ml',
	        name: 'time',
	        name_dic1: 'startTime',
	        name_dic2: 'endTime',
	        type: 'range',
	    }, {
	        name: 'val',
	        type: 'like',
	        fields: ['ev_ml.msg_id','ev_ml.room_id','ev_ml.to_id','ev_ml.from_id','ev_ml.resource', 'ev_u_from.nickname', 'ev_u_to.nickname']
	    }
	], req.query)
	console.log(stateSql, typeSql, timeSql)
	const sqlStr = `select ev_ml.*, ev_u_from.user_pic as from_user_pic, ev_u_from.nickname as from_nickname, ev_u_to.user_pic as to_user_pic, ev_u_to.nickname as to_nickname from ev_message_list ev_ml inner join ev_users ev_u_from on ev_ml.from_id=ev_u_from.id left join ev_users ev_u_to on ev_ml.to_id=ev_u_to.id where ${stateSql} and ${typeSql} and ${timeSql} and ${valSql} order by ev_ml.time desc limit ?,?`
	db.query(sqlStr, [
		(parseInt(req.query.offset)-1) * pageSize,
		pageSize
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.from_user_pic = oss + item.from_user_pic
			item.to_user_pic = oss + item.to_user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_message_list ev_ml inner join ev_users ev_u_from on ev_ml.from_id=ev_u_from.id left join ev_users ev_u_to on ev_ml.to_id=ev_u_to.id where ${stateSql} and ${typeSql} and ${timeSql} and ${valSql}`
		db.query(sqlStr, (err, results) => {
			if(err) return res.cc(err)
			let count = results[0].count
			res.send({
				status: 0,
				data,
				count,
				pageSize,
				msg: '获取成功'
			})
		})
	})
}

// 删除消息
exports.deleteMessageById = (req, res) => {
	const sqlStr = 'select * from ev_message_list where msg_id=? and state="1"'
	db.query(sqlStr, req.body.msg_id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('删除消息失败')
		const sqlStr = "update ev_message_list set state='2' where msg_id=?"
		db.query(sqlStr, req.body.msg_id, (err, results) => {
			if(err) return res.cc(err)
			if(results.affectedRows != 1) return res.cc('删除消息失败')
			res.cc('删除消息成功', 0)
		})
	})
}

// 获取视频信息
exports.getVideoUrlById = (req, res) => {
	const sqlStr = 'select * from ev_videos where id=?'
	db.query(sqlStr, req.query.id, (err, results) => {
		if(err) return res.cc(err)
		results[0].video_url = oss + results[0].video_url
		res.send({
			status: 0,
			data: results[0],
			msg: '获取成功'
		})
	})
}

exports.getArticleById = (req, res) => {
	const sqlStr = `select ev_a.*, ev_c.name as cate_name, ev_u.nickname, ev_u.user_pic, ev_u.intro from ev_articles ev_a, ev_article_cate ev_c, ev_users ev_u where ev_c.id = ev_a.cate_id and ev_a.author_id=ev_u.id and ev_a.id=?`
	db.query(sqlStr, req.query.id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('获取文章失败')
		results[0].cover_img = oss + results[0].cover_img
		results[0].user_pic = oss + results[0].user_pic
		results[0].targets = JSON.parse(results[0].targets)
		res.send({
			status: 0,
			data: results[0],
			msg: '获取文章成功'
		})
	})
}

const formatData = (item) => {
	if(item.cover_img) item.cover_img = oss + item.cover_img
	if(item.content) item.content = item.content.replace(/<[^>]+>/ig, '')
}

exports.getRoomMessage = (req, res) => {
	
	const sqlStr = `select
		ev_ml.*, ev_u.user_pic from_user_pic, ev_u.nickname from_user_nickname, 
		(
			case ev_ml.type 
				when '2' then GROUP_CONCAT(JSON_OBJECT('id',ev_a.id, 'title',ev_a.title, 'cover_img', ev_a.cover_img, 'content', ev_a.content))
				when '3' then GROUP_CONCAT(JSON_OBJECT('id',ev_v.id, 'title',ev_v.title, 'cover_img', ev_v.cover_img, 'duration', ev_v.duration, 'time', ev_v.time))
				else null end
	 	) as resource_info 
	from 
		ev_message_list ev_ml 
	join 
		ev_users ev_u 
	on 
		ev_ml.from_id = ev_u.id 
	left join ev_articles ev_a on ev_ml.type = '2' and ev_ml.resource = ev_a.id 
	left join ev_videos ev_v on ev_ml.type = '3' and ev_ml.resource = ev_v.id
	where 
		room_id = ? group by ev_ml.msg_id 
	order by 
		ev_ml.time desc limit ?,?`
	db.query(sqlStr, [
		req.query.room_id,
		(parseInt(req.query.offset)-1) * pageSize,
		pageSize
	], (err, results) => {
		if(err) return res.cc('获取失败')
		for(let item of results) {
			item.from_user_pic = oss + item.from_user_pic
			if(item.resource_info) {
				item.resource_info = JSON.parse(item.resource_info)
				formatData(item.resource_info)
			}
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_message_list where room_id = ?`
		db.query(sqlStr, req.query.room_id, (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				count,
				pageSize,
				msg: '获取成功'
			})
		})
	})
}

// 获取举报消息
exports.getMessageReport = (req, res) => {
	const sqlStr = `select ev_mr.*, ev_u_re.nickname re_nickname, ev_u_re.user_pic re_user_pic, ev_u_se.nickname se_nickname, ev_u_se.user_pic se_user_pic, ev_ml.type, ev_ml.resource from ev_message_report ev_mr inner join ev_users ev_u_re on ev_mr.user_id=ev_u_re.id left join ev_users ev_u_se on ev_mr.send_id=ev_u_se.id left join ev_message_list ev_ml on ev_mr.msg_id=ev_ml.msg_id order by ev_mr.time desc`
	db.query(sqlStr, (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.re_user_pic = oss + item.re_user_pic
			item.se_user_pic = oss + item.se_user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_message_report ev_mr inner join ev_users ev_u_re on ev_mr.user_id=ev_u_re.id left join ev_users ev_u_se on ev_mr.send_id=ev_u_se.id left join ev_message_list ev_ml on ev_mr.msg_id=ev_ml.msg_id`
		db.query(sqlStr, (err, results) => {
			if(err) return res.cc(err)
			let count = results[0].count
			res.send({
				status: 0,
				data,
				count,
				pageSize,
				msg: '获取成功'
			})
		})
	})
}

exports.updateReportState = (req, res) => {
	const sqlStr = 'select * from ev_message_report where msg_id=? and user_id=? and state="1"'
	db.query(sqlStr, [
		req.body.msg_id,
		req.body.user_id
	], (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('更新状态失败')
		const sqlStr = 'update ev_message_report set state=? where msg_id=? and user_id=?'
		db.query(sqlStr, [
			req.body.state,
			req.body.msg_id,
			req.body.user_id
		], (err, results) => {
			if(err) return res.cc(err)
			if(results.affectedRows != 1) return res.cc('更新状态失败')
			if(req.body.state == '2') {
				const sqlStrs = 'update ev_message_report set state="2" where msg_id=?; update ev_message_list set state="2" where msg_id=?'
				db.query(sqlStrs, [
					req.body.msg_id,
					req.body.msg_id
				], (err, results) => {
					res.cc('更新状态成功', 0)
				})
			} else {
				res.cc('更新状态成功', 0)
			}
		})
	})
}