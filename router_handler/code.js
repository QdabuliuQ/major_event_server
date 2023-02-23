const svgCaptcha = require('svg-captcha');

// 获取验证码
const getCaptcha = (req, res) => {
    let captcha = svgCaptcha.create({
        // 翻转颜色
        inverse: false,
        // 字体大小
        fontSize: 36,
        // 噪声线条数
        noise: 2,
        // 宽度
        width: 80,
        // 高度
        height: 30,
        background: '#e9e9e9'
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