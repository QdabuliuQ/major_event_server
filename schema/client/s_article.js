const joi = require('joi')

const title = joi.string().max(40).required()
const content = joi.string().max(10000).required()
const cover_img = joi.string().required()
const id = joi.string().required()

exports.add_article_schema = {
    body: {
        title,
        content,
        cover_img,
        cate_id: id,
        targets: id
    }
}

exports.pub_article_comment_schema = {
    body: {
        art_id: id,
        parent_id: joi.string(),
        child_id: joi.string(),
        content: joi.string().max(100).required()
    }
}

exports.delete_article_by_id_schema = {
    body: {
        id: joi.string().required(),
    }
}