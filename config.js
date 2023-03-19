// 全局配置文件

module.exports = {
  // 加密/解密token密钥
  jwtSecretKey: 'qdabuliuq',
  // token有效求
  expiresIn: '10h',
  // 域名
  oss: 'http://127.0.0.1:8080',
  // 数据条数
  pageSize: 10,
  // pageSize: 5,

  // 正则校验
  pattern: {
    email: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
    phone: /^[1][3,4,5,7,8][0-9]{9}$/,
    password: /^[\S]{6,12}$/
  }
}