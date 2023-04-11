// 全局配置文件
let oss = process.platform == 'win32' ? 'http://127.0.0.1:8080' : 'http://47.115.212.1:5050'
let port = process.platform == 'win32' ? 8080 : 5050
module.exports = {
  // 加密/解密token密钥
  jwtSecretKey: 'qdabuliuq',
  // token有效求
  expiresIn: '10h',
  // 域名
  oss,
  // 数据条数
  pageSize: 10,
  // 端口
  port,
  // 正则校验
  pattern: {
    email: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
    phone: /^[1][3,4,5,7,8][0-9]{9}$/,
    password: /^[\S]{6,12}$/
  }
}