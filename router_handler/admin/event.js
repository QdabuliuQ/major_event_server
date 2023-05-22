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