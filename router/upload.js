const express = require('express')
const multer = require('multer');  // 上传文件
const {
    oss
} = require('../config')
const router = express.Router()
const {
    uploadAvatar,
    reportProof,
    videoCover,
    video,
} = require('../router_handler/upload')

// 配置存储信息
let fileName = ''
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        fileName = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, fileName);
    }
})

const avatar = multer({ storage: avatarStorage })

// 存放到 uploads 文件当中
router.post('/avatar', avatar.single('avatar'), (req, res) => {
    res.send({
        status: 0,
        msg: '上传成功',
        url: `${oss}/avatars/${fileName}`
    })
})

let imageNoticeFile = ''
const imageNoticeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/imageNotice/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        imageNoticeFile = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, imageNoticeFile);
    }
})

const imageNotice = multer({ storage: imageNoticeStorage })

// 公告上传图片
router.post('/imageNotice', imageNotice.single('image'), (req, res) => {
    res.send({
        "errno": 0, // 注意：值是数字，不能是字符串
        "data": {
            "url": `${oss}/imageNotice/${imageNoticeFile}`, // 图片 src
        }
    })
})


let videoNoticeFile = ''
const videoNoticeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/videoNotice/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        videoNoticeFile = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, videoNoticeFile);
    }
})

const videoNotice = multer({ storage: videoNoticeStorage })

// 公告上传视频
router.post('/videoNotice', videoNotice.single('video'), (req, res) => {
    res.send({
        "errno": 0, // 注意：值是数字，不能是字符串
        "data": {
            "url": `${oss}/videoNotice/${videoNoticeFile}`, // 视频 src
        }
    })
})

let userBgimageFile = ''
const userBgimageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/userBgimage/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        userBgimageFile = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, userBgimageFile);
    }
})

const userBgimage = multer({ storage: userBgimageStorage })

// 上传背景图片
router.post('/userBgimage', userBgimage.single('bg_image'), (req, res) => {
    res.send({
        status: 0,
        msg: '上传成功',
        url: `${oss}/userBgimage/${userBgimageFile}`,
    })
})

// 上传文章封面
let articleCoverFile = ''
const articleCoverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/articleCover/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        articleCoverFile = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, articleCoverFile);
    }
})

const articleCover = multer({ storage: articleCoverStorage })

// 上传背景图片
router.post('/articleCover', articleCover.single('cover'), (req, res) => {
    res.send({
        status: 0,
        msg: '上传成功',
        url: `${oss}/articleCover/${articleCoverFile}`,
    })
})

// 上传文章资源
let articleSourceFile = ''
const articleSourceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/articleSource/')
    },
    filename(req,file,cb){
        let time = Date.now()
        const filenameArr = file.originalname.split('.');
        articleSourceFile = time + '.' + filenameArr[filenameArr.length-1]
        cb(null, articleSourceFile);
    }
})
const articleSource = multer({ storage: articleSourceStorage })
router.post('/articleSource', articleSource.single('source'), (req, res) => {
    res.send({
        "errno": 0, // 注意：值是数字，不能是字符串
        "data": {
            "url": `${oss}/articleSource/${articleSourceFile}`, // 视频 src
        }
    })
})

let upload = multer({ dest: 'uploads/' })
// 上传举报材料
router.post('/reportProof', upload.array('proof', 4), reportProof)

// 上传视频封面
router.post('/videoCover', upload.single('videoCover'), videoCover)

// 上传视频
router.post('/video', upload.single('video'), video)

module.exports = router