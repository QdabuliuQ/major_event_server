const fs = require('fs')
const path = require('path')
const {
    oss
} = require('../config')
const {
    uuid
} = require('../tools')

let saveImg = (file, relUrl) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file.path, async (err, data) => {
            if (err) {
                reject(err)
            }
            // 拓展名
            let extName = file.mimetype.split('/')[1]
            // 拼接成图片名
            let imgName = `${Date.now()+uuid(5)}.${extName}`
            // 写入图片
            // 写入自己想要存入的地址
            await fs.writeFile(path.join(`uploads/${relUrl}/${imgName}`), data, err => {
                if (err) { reject(err) }
                fs.stat(path.join(`uploads/${relUrl}/${imgName}`), err => {
                    if (err) { reject(err) }
                    // 成功就返回图片相对地址
                    resolve(`/${relUrl}/${imgName}`)
                })
            })
            // 删除二进制文件
            await fs.unlink(file.path, err => {
                if (err) { reject(err) }

            })
        })
    })
}

// 上传图片
exports.reportProof = (req, res) => {
    let files = req.files
    Promise.all(
        files.map( async file => await saveImg(file, 'reportProof'))
    ).then(list => {
        // list保存了所有文件地址返回的相对地址
        let url = []
        for(let item of list) {
            url.push({
                link: item
            })
        }
        res.send({
            status: 0,
            url,
            msg: "图片上传成功"
        })
    }).catch((err)=>{
        res.cc('图片上传失败')
    });
}

exports.videoCover = (req, res) => {
    saveImg(req.file, 'videoCover').then(results => {
        res.send({
            status: 0,
            url: results,
            msg: "图片上传成功"
        })
    }).catch((err)=>{
        res.cc('图片上传失败')
    })
}

exports.video = (req, res) => {
    saveImg(req.file, 'videos').then(results => {
        res.send({
            status: 0,
            url: results,
            msg: "视频上传成功"
        })
    }).catch((err)=>{
        console.log(err)
        res.cc('视频上传失败')
    })
}

exports.eventImage = (req, res) => {
	let files = req.files
	Promise.all(
	    files.map( async file => await saveImg(file, 'eventImage'))
	).then(list => {
	    // list保存了所有文件地址返回的相对地址
	    let url = []
	    for(let item of list) {
	        url.push({
	            link: item
	        })
	    }
	    res.send({
	        status: 0,
	        url,
	        msg: "图片上传成功"
	    })
	}).catch((err)=>{
	    res.cc('图片上传失败')
	});
}