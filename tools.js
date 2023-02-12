const {
    oss
} = require('./config')
const db = require('./db/index')

exports.cutUrl = (url) => {
    if(typeof url != 'string') return null
    return url.replace(oss, '')
}

// 生成 uuid
exports.uuid = (len, radix) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
}

// 拼接url
exports.addUrl = (results, key='user_pic') => {
    for(let item of results) {
        if(item[key]) {
            item[key] = oss + item[key]
        }
        if(item.password) {
            delete item.password
        }
    }
    return results
}

// 检查身份
exports.checkStatus = (sql, data, res, cb) => {
    db.query(sql, data, (err, results) => {
        if(err) {
            return res.cc(err)
        }
        if(results.length != 1) {
            return res.cc('管理员信息错误')
        }
        cb(results[0])
    })
}

// 验证身份sql
exports.createSql = (whereSql) => {
    let sql = ''
    if(whereSql) {
        sql = `select * from ev_admins where admin_id=? and ${whereSql}`
    } else {
        sql = `select * from ev_admins where admin_id=?`
    }
    return sql
}

exports.createConditionSql = (conditions, data) => {
    let res = {}
    for(let item of conditions) {
        let prefix = item.prefix ? item.prefix+'.' : ''
        res[item.name+'Sql'] = ''
        if(item.type == 'range') {
            if(data[item.name_dic1] && data[item.name_dic2]) {
                res[item.name+'Sql'] = `(${prefix}${item.name} between ${data[item.name_dic1]} and ${data[item.name_dic2]})`
            } else {
                res[item.name+'Sql'] = `(${prefix}${item.name} between 0 and ${Date.now()})`
            }
        } else if(item.type == 'eval'){  // 相等条件sql
            let val = item.t == 'string' ? `"${data[item.name]}"` : data[item.name]
            if(data[item.name]) {
                res[item.name+'Sql'] = `(${prefix}${item.name} = ${val})`
            } else {
                res[item.name+'Sql'] = `(${prefix}${item.name} <> -999)`
            }
        } else if(item.type == 'like') {
            let val = data[item.name] ? data[item.name] : ''
            for(let i = 0; i < item.fields.length; i ++) {
                item.fields[i] = `${item.fields[i]} like "%${val}%"`
            }
            res[item.name+'Sql'] = `(${item.fields.join(' or ')})`
        }
    }
    return res
}