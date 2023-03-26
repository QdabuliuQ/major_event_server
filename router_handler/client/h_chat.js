const db = require('../../db/index')
const { uuid } = require("../../tools");
const config = require("../../config");

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
		console.log(results[0].length, results[1].length)
		if(!results[0].length || !results[1].length) return res.cc('发送失败')
		const sqlStr = 'insert into ev_message_list set ?'
		db.query(sqlStr, {
			from_id: req.user.id,
			to_id: req.body.to_id,
			room_id: req.body.room_id,
			msg_id: req.body.room_id +'_'+uuid(13, 16),
			time: Date.now(),
			type: req.body.type,
			resource: req.body.resource
		}, (err, results) => {
			console.log(err)
			if(err || results.affectedRows != 1) return res.cc('发送失败')
			res.cc('发送成功', 0)
		})
	})
}

exports.getMessageList = (req, res) => {
	const sqlStr = 'select * from ev_chat_list where room_id=? and (to_id=? and from_id) or (to_id=? and from_id=?)'
	db.query(sqlStr, [
		req.body.room_id,
		req.body.to_id,
		req.body.from_id,
		req.body.from_id,
		req.body.to_id,
	], (err, results) => {
		if(err) return res.cc('获取失败')
		if(results.length != 1) return res.cc('获取失败')
		return res.cc('获取成功', 0)
	})
}