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
    console.log(sql)
    return sql
}
