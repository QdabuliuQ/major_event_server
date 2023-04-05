const db = require('../../db/index')
const { uuid } = require("../../tools");
const {
	oss, pageSize
} = require("../../config");

// 创建聊天室
exports.addChatObject = (req, res) => {
	if(req.body.to_id == req.user.id) return res.cc('操作失败')
	// 判断目标用户是否存在
	const sqlStr = 'select * from ev_users where id = ?'
	db.query(sqlStr, req.body.to_id, (err, results) => {
		if(err || results.length != 1) return res.cc('操作失败')
		
		// 判断房间是否已经创建
		const sqlStr = 'select * from ev_chat_list where (user_id=? and another_id=?) or (user_id=? and another_id=?)'
		db.query(sqlStr, [
			req.user.id,
			req.body.to_id,
			req.body.to_id,
			req.user.id
		], (err, results) => { 
			if(err) return res.cc('操作失败')
			if(results.length == 1) return res.send({
				status: 0,
				room_id: results[0].room_id,
				msg: '添加成功'
			})
			
			// 创建新的聊天室
			const sqlStr = 'insert into ev_chat_list set ?'
			let room_id = 'r_'+ uuid(15, 16)
			db.query(sqlStr, {
				room_id,
				user_id: req.user.id,
				another_id: req.body.to_id,
				time: Date.now(),
			}, (err, results) => {
				if(results.affectedRows == 1) return res.send({
					status: 0,
					room_id,
					msg: '添加成功'
				})
				return res.cc('操作失败')
			})
		})
	})
}

// 发送消息
exports.addMessageRecord = (req, res) => {
	if(req.user.status == '3') return res.cc('账号禁言中')
	const sqlStr = 'select * from ev_users where id=?;select * from ev_chat_list where room_id=?'
	db.query(sqlStr, [
		req.body.to_id,
		req.body.room_id
	], (err, results) => {
		
		if(err) return res.cc('发送失败')
		if(!results[0].length || !results[1].length) return res.cc('发送失败')
		const sqlStr = 'insert into ev_message_list set ?'
		const msg_id = req.body.room_id +'_'+uuid(13, 16)
		db.query(sqlStr, {
			from_id: req.user.id,
			to_id: req.body.to_id,
			room_id: req.body.room_id,
			msg_id,
			time: Date.now(),
			type: req.body.type,
			resource: req.body.resource
		}, (err, results) => {
			console.log(err)
			if(err || results.affectedRows != 1) return res.cc('发送失败')
			res.send({
				status: 0,
				msg: '发送成功',
				msg_id,
				time: Date.now()
			})
		})
	})
}

const formatData = (item) => {
	if(item.cover_img) item.cover_img = oss + item.cover_img
	if(item.content) item.content = item.content.replace(/<[^>]+>/ig, '')
}

// 获取聊天记录
exports.getMessageList = (req, res) => {
	let ps = req.body.pageSize ? parseInt(req.body.pageSize) : pageSize
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
		req.body.room_id,
		(parseInt(req.body.offset)-1) * ps,
		ps
	], (err, results) => {
		if(err) return res.cc('获取失败')
		for(let item of results) {
			item.from_user_pic = oss + item.from_user_pic
			if(item.resource_info) {
				item.resource_info = JSON.parse(item.resource_info)
				formatData(item.resource_info)
			}
		}
		results.reverse()
		let data = results
		const sqlStr = 'select count(*) as count from ev_message_list where room_id = ?'
		db.query(sqlStr, req.body.room_id, (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				count,
				more: parseInt(req.body.offset)*ps < count,
				msg: '获取成功'
			})
		})
		
	})
}

// 获取聊天对象
exports.getChatObject = (req, res) => {
	let ps = req.body.pageSize ? parseInt(req.body.pageSize) : pageSize
	const sqlStr = 'select ev_cl.*, ev_u.nickname, ev_u.user_pic, ev_u.id as u_id, res.type, res.time as msg_time, res.resource from ev_chat_list ev_cl join ev_users ev_u on ev_u.id = if(ev_cl.user_id = ?, ev_cl.another_id, ev_cl.user_id) inner join (select ev_a.time as time, ev_a.resource as resource, ev_a.room_id as room_id, ev_a.type as type from ev_message_list ev_a left join ev_message_list ev_b on ev_a.room_id=ev_b.room_id and ev_a.time < ev_b.time where ev_b.time is null) res on res.room_id = ev_cl.room_id where user_id = ? or another_id = ? order by msg_time desc limit ?,?'
	db.query(sqlStr, [
		req.user.id,
		req.user.id,
		req.user.id,
		(parseInt(req.body.offset)-1) * ps,
		ps
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = 'select count(*) as count from ev_chat_list ev_cl join (select any_value(room_id) as room_id from ev_message_list group by room_id) res on res.room_id = ev_cl.room_id where user_id = ? or another_id = ?'
		db.query(sqlStr, [
			req.user.id,
			req.user.id
		], (err, results) => {
			let count = results[0].count
			res.send({
				status: 0,
				data,
				msg: '获取成功',
				count,
				more: parseInt(req.body.offset)*ps < count,
			})
		})
		
	})
}