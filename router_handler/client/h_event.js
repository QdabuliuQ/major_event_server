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
}

// 获取动态列表
exports.getEventListById = (req, res) => {
	let ps = 30
	const sqlStr = `select ev_e.*, ev_u.nickname, ev_u.user_pic, (
		case ev_e.type 
			when '2' then GROUP_CONCAT(JSON_OBJECT('id',ev_a.id, 'title',ev_a.title, 'cover_img', ev_a.cover_img, 'content', ev_a.content))
			when '3' then GROUP_CONCAT(JSON_OBJECT('id',ev_v.id, 'title',ev_v.title, 'cover_img', ev_v.cover_img, 'duration', ev_v.duration, 'time', ev_v.time))
			else null end
 	) as resource_info from ev_events ev_e join ev_users ev_u on ev_e.user_id = ev_u.id left join ev_articles ev_a on ev_e.type = '2' and ev_e.resource_id = ev_a.id left join ev_videos ev_v on ev_e.type = '3' and ev_e.resource_id = ev_v.id where ev_e.user_id=? and ev_e.state='1' group by ev_e.ev_id order by ev_e.time desc limit ?,?`
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