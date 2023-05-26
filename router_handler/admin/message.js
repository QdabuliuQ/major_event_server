const db = require('../../db/index')
const {
  pageSize,
  oss
} = require('../../config')

// 获取消息列表
exports.getMessageList = (req, res) => {
	const sqlStr = `select ev_ml.*, ev_u_from.user_pic as from_user_pic, ev_u_from.nickname as from_nickname, ev_u_to.user_pic as to_user_pic, ev_u_to.nickname as to_nickname from ev_message_list ev_ml inner join ev_users ev_u_from on ev_ml.from_id=ev_u_from.id left join ev_users ev_u_to on ev_ml.to_id=ev_u_to.id order by ev_ml.time desc limit ?,?`
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
		const sqlStr = `select count(*) as count from ev_message_list`
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
		const sqlStr = 'select count(*) as count from ev_message_list where room_id = ?'
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