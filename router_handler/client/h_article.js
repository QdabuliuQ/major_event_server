const db = require('../../db/index')
const {
    oss, pageSize
} = require('../../config')
const {
    uuid,
    cutUrl
} = require('../../tools')

// 获取分类信息
exports.getArticleCate = (req, res) => {
    const sqlStr = 'select ev_c.*, ev_a.name as cate_name from ev_cate_target ev_c join ev_article_cate ev_a on ev_a.id = ev_c.cate_id where ev_c.is_delete=0'
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        let data = results
        let resData = []
        outer: for(let item of results) {
            for(let d of resData) {
                if(d && d.cate_name == item.cate_name) {
                    continue outer
                }
            }
            resData.push({
                cate_name: item.cate_name,
                cate_id: item.cate_id,
                targets: []
            })
        }

        for(let item of resData) {
            for(let d of data) {
                if(d.cate_name == item.cate_name) {
                    delete d.cate_name
                    item.targets.push({...d})
                }
            }
        }

        res.send({
            status: 0,
            msg: '获取分类信息成功',
            data: resData,
        })
    })
}

// 发布文章
exports.addArticle = (req, res) => {
    console.log(req.user)
    if(req.userData.status == '3') {
        return res.cc('账号以禁言')
    }
    if(req.userData.status == '2') {
        return res.cc('账号以封禁')
    }
    const sqlStr = 'insert into ev_articles set ?'
    db.query(sqlStr, {
        id: uuid(13),
        title: req.body.title,
        content: req.body.content,
        // cover_img: req.body.cover_img,
        cover_img: cutUrl(req.body.cover_img),
        pub_date: Date.now(),
        cate_id: req.body.cate_id,
        author_id: req.user.id,
        targets: req.body.targets,
    }, (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('发布文章失败')

        res.cc('发布文章成功', 0)
    })
}

// 获取文章详情
exports.getArticleDetail = (req, res) => {
    const sqlStr = `select ev_a.*, ev_c.name as cate_name, ev_u.nickname, ev_u.user_pic, ev_u.intro from ev_articles ev_a, ev_article_cate ev_c, ev_users ev_u where ev_c.id = ev_a.cate_id and ev_a.author_id=ev_u.id and ev_a.id=? ${req.type === 'client' ? 'and ev_a.state="1" and ev_a.is_delete=0 and ev_c.is_delete=0' : ''}`
    db.query(sqlStr, req.params.id, (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('获取文章信息失败', -2)
        results[0].targets = JSON.parse(results[0].targets)
        results[0].user_pic = oss + results[0].user_pic
        results[0].cover_img = oss + results[0].cover_img
        res.send({
            status: 0,
            data: results[0],
            msg: '获取文章信息成功'
        })
        // 添加浏览记录
        const sqlStr = 'select * from ev_article_browse_record where user_id=? and art_id=?'
        db.query(sqlStr, [req.user.id, req.params.id], (err, results) => {
            if(results && results.length > 0) return
            const sqlStr = 'insert into ev_article_browse_record set ?'
            db.query(sqlStr, {
                record_id: uuid(32),
                user_id: req.user.id,
                art_id: req.params.id,
                time: Date.now()
            })
        })
    })
}

// 文章信息参数
exports.getArticleParams = (req, res) => {
    let art_id = req.params.id, u_id = req.user.id
    const praiseSql = `select count(case when(art_id='${art_id}' and user_id='${u_id}') then 1 else null end) as is_praise, count(case when(art_id='${art_id}') then 1 else null end) as praise_count from ev_article_praise_record`

    const collectSql = `select count(case when(art_id='${art_id}' and user_id='${u_id}') then 1 else null end) as is_collect, count(case when(art_id='${art_id}') then 1 else null end) as collect_count from ev_article_collect_record`

    const sqlStr = `${praiseSql};${collectSql}`

    db.query(sqlStr, [req.params.id, req.params.id], (err, results) => {
        if(err) return res.cc(err)
        res.send({
            status: 0,
            msg: '获取文章信息成功',
            data: {
                is_praise: results[0][0].is_praise ? true : false,
                is_collect: results[1][0].is_collect ? true : false,
                praise_count: results[0][0].praise_count,
                collect_count: results[1][0].collect_count
            }
        })
    })
}

// 获取文章列表
exports.getArticleList = (req, res) => {
    let offsetSql = ''
    if(req.query.offset) {
        offsetSql = `limit ${(parseInt(req.query.offset) - 1)  * req.query.limit}, ${req.query.limit}`
    }
    let whereSql = ''
    if(req.query.id) {
        whereSql = `cate_id='${req.query.id}'`
    } else {
        whereSql = `cate_id<>'-1'`
    }
    const sqlStr = `select * from ev_articles where ${whereSql} and state="1" order by pub_date desc ${offsetSql}`
    db.query(sqlStr, (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
            item.targets = JSON.parse(item.targets)
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_articles where ${whereSql} and state="1" and is_delete=0 ${offsetSql}`
        db.query(sqlStr, (err, results) => {
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                data,
                msg: '获取文章列表成功',
                count,
                more: parseInt(req.query.offset)*req.query.limit < count
            })
        })
    })
}

// 点赞/取消点赞文章
exports.praiseArticle = (req, res) => {
    const sqlStr = 'select * from ev_article_praise_record where user_id=? and art_id=?'
    db.query(sqlStr, [req.user.id, req.body.id], (err, results) => {
        if(err) return res.cc(err)
        // 点赞 并且存在点赞记录的情况下
        if(req.body.is_praise == 1 && results.length) {
            return res.cc('网络错误')
        }
        // 取消点赞 并且不存在点赞记录的情况下
        if(req.body.is_praise == 0 && !results.length) {
            return res.cc('网络错误')
        }

        const sqlStr = req.body.is_praise == 1 ? `insert into ev_article_praise_record set ?` : `delete from ev_article_praise_record where user_id=? and art_id=?`
        db.query(sqlStr, req.body.is_praise == 1 ? {
            record_id: 'p_'+uuid(32),
            user_id: req.user.id,
            art_id: req.body.id,
            time: Date.now()
        } : [
            req.user.id,
            req.body.id
        ], (err, results) => {
            if(results.affectedRows != 1) return res.cc('网络错误')
            res.cc('操作成功', 0)
        })
    })
}

// 收藏/取消收藏文章
exports.collectArticle = (req, res) => {
    const sqlStr = 'select * from ev_article_collect_record where user_id=? and art_id=?'
    db.query(sqlStr, [req.user.id, req.body.id], (err, results) => {
        if(err) return res.cc(err)
        // 收藏 并且存在收藏记录的情况下
        if(req.body.is_collect == 1 && results.length) {
            return res.cc('网络错误')
        }
        // 取消收藏 并且不存在收藏记录的情况下
        if(req.body.is_collect == 0 && !results.length) {
            return res.cc('网络错误')
        }

        const sqlStr = req.body.is_collect == 1 ? `insert into ev_article_collect_record set ?` : `delete from ev_article_collect_record where user_id='${req.user.id}' and art_id='${req.body.id}'`
        db.query(sqlStr, {
            record_id: 'c_'+uuid(32),
            user_id: req.user.id,
            art_id: req.body.id,
            time: Date.now()
        }, (err, results) => {
            if(results.affectedRows != 1) return res.cc('网络错误')
            res.cc('操作成功', 0)
        })
    })
}

// 发表文章评论
exports.pubArticleComment = (req, res) => {
    let content = req.body.content.trim()
    if(content == '' || content.length > 100) return res.cc('发表评论失败')
    // 记录sql
    const sqlStr = 'insert into ev_article_comment_record set ?'
    let p_id = req.body.parent_id ? req.body.parent_id : uuid(24)
    let c_id = req.body.parent_id ? uuid(24) : null
    db.query(sqlStr, {
        id: uuid(20),
        parent_id: p_id,
        child_id: c_id,
        art_id: req.body.art_id,
        time: Date.now()
    }, (err, results) => {
        if(results.affectedRows != 1) return res.cc('发表评论失败')
        const sqlStr = 'insert into ev_article_comment set ?'
        db.query(sqlStr, {
            comment_id: c_id ? c_id : p_id,
            user_id: req.user.id,
            content,
            // nickname: req.user.nickname,
            // user_pic: req.userData.user_pic
        }, (err, results) => {
            if(err) return res.cc('发表评论失败')

            if(results.affectedRows != 1) return res.cc('发表评论失败')
            res.cc('发表评论成功', 0)
        })
    })
}

// 获取文章评论
exports.getArticleComment = (req, res) => {
    const sqlStr = `select *, ev_u.nickname, ev_u.user_pic, (select count(*) - 1 from ev_article_comment_record ev_cr where ev_cr.parent_id = ev_c.comment_id) as reply, (select count(IF(ev_cr.parent_id = ev_cpr.comment_id,true,null)) from ev_article_comment_praise_record ev_cpr) as praise, (select count(IF(ev_cr.parent_id = ev_cpr.comment_id and ev_cpr.user_id = '${req.user.id}',true,null)) from ev_article_comment_praise_record ev_cpr) as is_praise from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id inner join ev_users ev_u on ev_c.user_id = ev_u.id where ev_cr.art_id=? and ev_c.is_delete='0' and ev_cr.child_id is null order by ev_cr.time desc limit ?, ?`
    db.query(sqlStr, [
        req.query.art_id,
        (parseInt(req.query.offset) - 1)  * req.query.limit,
        parseInt(req.query.limit)
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id where ev_cr.art_id=? and ev_c.is_delete='0'`
        db.query(sqlStr, req.query.art_id, (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                data,
                msg: '获取文章评论成功',
                count,
                more: parseInt(req.query.offset)*req.query.limit < count
            })
        })
    })
}

// 获取楼层评论
exports.getCommentFloor = (req, res) => {
    const sqlStr = `select *, ev_u.nickname, ev_u.user_pic, (select count(IF(ev_cr.child_id = ev_cpr.comment_id,true,null)) from ev_article_comment_praise_record ev_cpr) as praise, (select count(IF(ev_cr.child_id = ev_cpr.comment_id and ev_cpr.user_id = '${req.user.id}',true,null)) from ev_article_comment_praise_record ev_cpr) as is_praise from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.child_id = ev_c.comment_id inner join ev_users ev_u on ev_c.user_id = ev_u.id where ev_cr.art_id=? and ev_cr.parent_id=? and ev_cr.child_id is not null and ev_c.is_delete='0' order by ev_cr.time desc limit ?, ?`
    db.query(sqlStr, [
        req.query.art_id,
        req.query.comment_id,
        (parseInt(req.query.offset) - 1)  * req.query.limit,
        parseInt(req.query.limit)
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.user_pic = oss + item.user_pic
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_article_comment_record ev_cr join ev_article_comment ev_c on ev_cr.parent_id = ev_c.comment_id where ev_cr.art_id=? and ev_cr.parent_id=? and ev_cr.child_id is not null and ev_c.is_delete='0'`
        db.query(sqlStr, [
            req.query.art_id,
            req.query.comment_id
        ], (err, results) => {
            if(err) return res.cc(err)
            let count = results && results.length ? results[0].count : 0
            res.send({
                status: 0,
                data,
                msg: '获取楼层评论成功',
                count,
                more: parseInt(req.query.offset)*req.query.limit < count
            })
        })
    })
}

// 获取评论
exports.getCommentDetail = (req, res) => {
    const sqlStr = `select *, ev_u.nickname, ev_u.user_pic, (select count(IF(ev_cr.parent_id = ev_cpr.comment_id,true,null)) from ev_article_comment_praise_record ev_cpr) as praise, (select count(IF(ev_cr.parent_id = ev_cpr.comment_id and ev_cpr.user_id = '${req.user.id}',true,null)) from ev_article_comment_praise_record ev_cpr) as is_praise from ev_article_comment ev_c join ev_article_comment_record ev_cr on ev_c.comment_id = ? and ev_c.comment_id = ev_cr.parent_id and ev_cr.child_id is null and ev_c.is_delete = '0' inner join ev_users ev_u on ev_c.user_id = ev_u.id`
    db.query(sqlStr, req.query.comment_id, (err, results) => {
        if(err) return res.cc(err)
        if(!results || !results.length) return  res.cc('获取评论信息失败', -2)
        results[0].user_pic = oss + results[0].user_pic
        res.send({
            status: 0,
            msg: '获取评论信息成功',
            data: results[0],
        })
    })
}

// 点赞评论
exports.praiseComment = (req, res) => {
    const sqlStr = req.body.is_praise == 1 ? 'insert into ev_article_comment_praise_record set ?' : 'delete from ev_article_comment_praise_record where comment_id=? and user_id=? and art_id=?'
    db.query(sqlStr, req.body.is_praise == '1' ? {
        user_id: req.user.id,
        comment_id: req.body.comment_id,
        art_id: req.body.art_id,
        time: Date.now()
    } : [
        req.body.comment_id,
        req.user.id,
        req.body.art_id
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows != 1) return res.cc('操作失败')

        res.cc('操作成功', 0)
    })
}

exports.getArticleById = (req, res) => {
    let ps = req.query.pageSize ? parseInt(req.query.pageSize) : pageSize
    let typeSql = ''
    switch (req.query.type) {
        case '1':
            typeSql = `(ev_a.state='1' and ev_a.is_delete='0')`
            break;
        case '2':
            typeSql = `(ev_a.state='2')`
            break
        case '3':
            typeSql = `(ev_a.is_delete='1')`
            break
        default:
            typeSql = `(ev_a.state <> -999)`
    }

    const sqlStr = `select ev_a.*, (select count(*) from ev_article_browse_record where art_id=ev_a.id) as browse_count, (select count(*) from ev_article_praise_record where art_id=ev_a.id) as praise_count, (select count(*) from ev_article_comment_record where art_id=ev_a.id and is_delete='0') as comment_count, (select count(*) from ev_article_collect_record where art_id=ev_a.id and is_delete='0') as collect_count from ev_articles ev_a where author_id=? and ${typeSql} order by pub_date desc limit ?,?`
    db.query(sqlStr, [
        req.user.id,
        (parseInt(req.query.offset)-1) * ps,
        ps
    ], (err, results) => {
        if(err) return res.cc(err)
        for(let item of results) {
            item.cover_img = oss + item.cover_img
            item.content = item.content.replace(/<[^>]+>/ig, '')
        }
        let data = results
        const sqlStr = `select count(*) as count from ev_articles ev_a where author_id = ? and is_delete = "0" and ${typeSql}`
        db.query(sqlStr, req.user.id, (err, results) => {
            if(err) return res.cc(err)
            res.send({
                status: 0,
                data,
                msg: '获取文章列表成功',
                count: results[0].count,
                more: parseInt(req.query.offset)*ps < results[0].count
            })
        })
    })
}

exports.deleteArticleById = (req, res) => {
    const sqlStr = 'select * from ev_articles where id = ? and author_id=? and state = "1" and is_delete = "0"'
    db.query(sqlStr, [
        req.body.id,
        req.user.id
    ], (err, results) => {
        if(err) return res.cc(err)
        if(results.length != 1) return res.cc('操作失败')
        const sqlStr = 'update ev_articles set is_delete="1" where id=?'
        db.query(sqlStr, req.body.id, (err, results) => {
            if(err) return res.cc(err)
            if(results.affectedRows != 1) return res.cc('操作失败')
            res.cc('删除成功', 0)
        })
    })
}