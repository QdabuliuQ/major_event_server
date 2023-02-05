const mysql = require('mysql')  // 导入mysql模块

// 连接数据库
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'event_db',
  multipleStatements: true  // 执行多条sql
})


// 导出db对象
module.exports = db