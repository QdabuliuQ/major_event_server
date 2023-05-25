const db = require('../../db/index')
const {
    pageSize, oss
} = require('../../config')
const {createConditionSql} = require("../../tools");

// 获取动态列表
exports.getEventList = (req, res) => {
	let {stateSql,typeSql,timeSql,valSql} = createConditionSql([
	    {
	        prefix: 'ev_e',
	        name: 'state',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_e',
	        name: 'type',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_e',
	        name: 'time',
	        name_dic1: 'startTime',
	        name_dic2: 'endTime',
	        type: 'range',
	    }, {
	        name: 'val',
	        type: 'like',
	        fields: ['ev_e.ev_id','ev_e.user_id','ev_u.nickname','ev_e.content']
	    }
	], req.query)
	const sqlStr = `select ev_e.*, ev_u.nickname, ev_u.user_pic, (select count(*) from ev_event_praise_record where ev_id=ev_e.ev_id) as praise_count, (select count(*) from ev_event_comment where ev_id=ev_e.ev_id and is_delete='0') as comment_count from ev_events ev_e inner join ev_users ev_u on ev_e.user_id = ev_u.id where ${stateSql} and ${typeSql} and ${timeSql} and ${valSql} order by ev_e.time desc limit ?,?`
	db.query(sqlStr, [
		(parseInt(req.query.offset)-1)*pageSize, 
		pageSize
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_events ev_e inner join ev_users ev_u on ev_e.user_id = ev_u.id where ${stateSql} and ${typeSql} and ${timeSql} and ${valSql}`
		db.query(sqlStr, (err, results) => {
		  if(err) return res.cc(err)
		  res.send({
		    status: 0,
		    msg: '获取动态列表成功',
		    count: results && results.length ? results[0].count : 0,
		    pageSize,
		    data,
		  })
		})
	})
}

// 封禁动态
exports.deleteEvent = (req, res) => {
	const sqlStr = 'select * from ev_events where ev_id=? and state="1"'
	db.query(sqlStr, req.body.ev_id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('操作失败')
		const sqlStr = 'update ev_events set state="2" where ev_id=?'
		db.query(sqlStr, req.body.ev_id, (err, results) => {
			if(err) return res.cc(err)
			if(results.affectedRows != 1) return res.cc('操作失败')
			res.cc('更新动态状态成功', 0)
		})
	})
}

const formatData = (item) => {
	if(item.cover_img) item.cover_img = oss + item.cover_img
	if(item.video_url) item.video_url = oss + item.video_url
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

exports.getEventDetail = (req, res) => {
	const sqlStr = `select ev_e.*, ev_u.nickname, ev_u.user_pic, (
		case ev_e.type 
			when '2' then GROUP_CONCAT(JSON_OBJECT('id',ev_a.id, 'title',ev_a.title, 'cover_img', ev_a.cover_img, 'content', ev_a.content)) 
			when '3' then GROUP_CONCAT(JSON_OBJECT('id',ev_v.id, 'title',ev_v.title, 'cover_img', ev_v.cover_img, 'duration', ev_v.duration, 'time', ev_v.time, 'video_url', ev_v.video_url))
			when '4' then GROUP_CONCAT(JSON_OBJECT('ev_id',ev_e_2.ev_id, 'user_id',ev_e_2.user_id, 'user_pic', ev_u_2.user_pic, 'nickname', ev_u_2.nickname, 'content', ev_e_2.content, 'type', ev_e_2.type, 'resource_id', ev_e_2.resource_id, 'images', ev_e_2.images, 'time', ev_e_2.time, 'resource_info', (
				case ev_e_2.type
					when '2' then (select getEventArticleInfo(ev_e_2.resource_id))
					when '3' then (select getEventVideoInfo(ev_e_2.resource_id))
					else null end
				)))
			else null end
	) as resource_info, (select count(*) from ev_event_comment where ev_id=ev_e.ev_id and is_delete='0') as commentCount, (select count(*) from ev_event_praise_record where ev_id=ev_e.ev_id) as praiseCount from ev_events ev_e join ev_users ev_u on ev_e.user_id = ev_u.id left join ev_articles ev_a on ev_e.type = '2' and ev_e.resource_id = ev_a.id left join ev_videos ev_v on ev_e.type = '3' and ev_e.resource_id = ev_v.id left join ev_events ev_e_2 on ev_e.type = '4' and ev_e.resource_id = ev_e_2.ev_id left join ev_users ev_u_2 on ev_e_2.user_id = ev_u_2.id where ev_e.ev_id=?`
	// const sqlStr = `select ev_e.*, ev_u.nickname, ev_u.user_pic, (
	// 	case ev_e.type 
	// 		when '2' then if(ev_a.state = '1', GROUP_CONCAT(JSON_OBJECT('id',ev_a.id, 'title',ev_a.title, 'cover_img', ev_a.cover_img, 'content', ev_a.content)), -1) 
	// 		when '3' then if(ev_v.state = '2', GROUP_CONCAT(JSON_OBJECT('id',ev_v.id, 'title',ev_v.title, 'cover_img', ev_v.cover_img, 'duration', ev_v.duration, 'time', ev_v.time, 'video_url', ev_v.video_url)), -1)  
	// 		when '4' then if(ev_e.state = '1' and ev_e_2.state = '1', GROUP_CONCAT(JSON_OBJECT('ev_id',ev_e_2.ev_id, 'user_id',ev_e_2.user_id, 'user_pic', ev_u_2.user_pic, 'nickname', ev_u_2.nickname, 'content', ev_e_2.content, 'type', ev_e_2.type, 'resource_id', ev_e_2.resource_id, 'images', ev_e_2.images, 'time', ev_e_2.time, 'resource_info', (
	// 			case ev_e_2.type
	// 				when '2' then if(ev_e_2.state = '1', (select getEventArticleInfo(ev_e_2.resource_id)), -1) 
	// 				when '3' then if(ev_e_2.state = '1', (select getEventVideoInfo(ev_e_2.resource_id)), -1) 
	// 				else null end
	// 			))), -1)
	// 		else null end
 // 	) as resource_info, (select count(*) from ev_event_comment where ev_id=ev_e.ev_id and is_delete='0') as commentCount, (select count(*) from ev_event_praise_record where ev_id=ev_e.ev_id) as praiseCount from ev_events ev_e join ev_users ev_u on ev_e.user_id = ev_u.id left join ev_articles ev_a on ev_e.type = '2' and ev_e.resource_id = ev_a.id left join ev_videos ev_v on ev_e.type = '3' and ev_e.resource_id = ev_v.id left join ev_events ev_e_2 on ev_e.type = '4' and ev_e.resource_id = ev_e_2.ev_id left join ev_users ev_u_2 on ev_e_2.user_id = ev_u_2.id where ev_e.ev_id=?`
	db.query(sqlStr, req.query.ev_id, (err, results) => {
		if(err) return res.cc(err)
		if(results.length != 1) return res.cc('获取数据失败')
		let item = results[0]
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
		res.send({
			status: 0,
			data: item,
			msg: '获取成功'
		})
	})
}

// 获取举报列表
exports.getEventReport = (req, res) => {
	let {stateSql,reasonSql,timeSql,valSql} = createConditionSql([
	    {
	        prefix: 'ev_er',
	        name: 'state',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_er',
	        name: 'reason',
	        type: 'eval',
	        t: 'string',
	    }, {
	        prefix: 'ev_er',
	        name: 'time',
	        name_dic1: 'startTime',
	        name_dic2: 'endTime',
	        type: 'range',
	    }, {
	        name: 'val',
	        type: 'like',
	        fields: ['ev_er.ev_id','ev_er.user_id','ev_u.nickname']
	    }
	], req.query)
	const sqlStr = `select ev_er.*, ev_u.nickname, ev_u.user_pic from ev_event_report ev_er inner join ev_users ev_u on ev_er.user_id=ev_u.id where ${reasonSql} and ${stateSql} and ${timeSql} and ${valSql} order by ev_er.time desc limit ?,?`
	db.query(sqlStr, [
		(parseInt(req.query.offset)-1) * pageSize,
		pageSize
	], (err, results) => {
		if(err) return res.cc(err)
		for(let item of results) {
			item.user_pic = oss + item.user_pic
		}
		let data = results
		const sqlStr = `select count(*) as count from ev_event_report ev_er inner join ev_users ev_u on ev_er.user_id=ev_u.id where ${reasonSql} and ${stateSql} and ${timeSql} and ${valSql}`
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

// 更新举报状态
exports.updateReportState = (req, res) => {
	const sqlStr = 'update ev_event_report set state=? where ev_id=? and user_id=? and state="1" and reason=?'
	db.query(sqlStr, [
		req.body.state,
		req.body.ev_id,
		req.body.user_id,
		req.body.reason,
	], (err, results) => {
		if(err) return res.cc('更新状态失败')
		if(results.affectedRows != 1) return res.cc('更新状态失败')
		if(req.body.state == '2') {
			const sqlStr = 'update ev_events set state="2" where ev_id=? and state="1"'
			db.query(sqlStr, req.body.ev_id, (err, results) => {
				if(err) return res.cc(err)
				if(results.affectedRows != 1) return res.cc('更新状态失败')
				res.cc('更新状态成功', 0)
			})
		} else {
			return res.cc('更新状态成功', 0)
		}
	})
}