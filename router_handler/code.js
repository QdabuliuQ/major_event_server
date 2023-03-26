const svgCaptcha = require('svg-captcha');

// 获取验证码
const getCaptcha = (req, res) => {
    let captcha = svgCaptcha.create({
        // 翻转颜色
        inverse: false,
        // 字体大小
        fontSize: 46,
        // 忽略字符
        ignoreChars: '0o1il',
        // 噪声线条数
        noise: 2,
        // 宽度
        width: 80,
        // 高度
        height: 30,
        color: true,
        background: '#fff'
    });
    // 保存到session,忽略大小写
    req.session = captcha.text.toLowerCase();
    //保存到cookie 方便前端调用验证
    res.cookie('captcha', req.session, { sameSite: 'None', secure: 'Secure' });
    res.setHeader('Content-Type', 'image/svg+xml');

    res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    res.setHeader('Access-Control-Allow-Credentials', "true")
    // res.write(String(captcha.data));
    res.send({
        svg: String(captcha.data),
        code: req.session
    });
}

exports.getCode = (req, res) => {
    return getCaptcha(req, res)
}