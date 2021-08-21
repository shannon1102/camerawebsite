'use strict'

const express = require('express')
const MysqlDB = require('../../models/mysql')
const {checkRequiredFieldInBody} = require('../../middleware')
const PostService = require('../../services/postService/postService')

const { verifyToken,adminRole } = require('../../middleware/verifyToken')
const  multer = require('multer');
const cloudinary = require('cloudinary')
const {uploadFromBuffer} = require('../../utils/upLoadCloudinary')
const postApi = express.Router()


const mysqlDb = new MysqlDB()
const postService = new PostService(mysqlDb)
// cloudinary.config({ 
//     cloud_name: process.env.CLOUD_NAME, 
//     api_key: process.env.API_KEY, 
//     api_secret: process.env.API_SECRET 
// })

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

postApi.get('/', async (req, res, next) => {
    try {
        let {postsPerPage, pageNumber, orderType} = req.query
        const postsFounded = await postService.getPosts(postsPerPage, pageNumber, orderType)

        return res.status(200).json({status:200,message:"Success",data: postsFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})

postApi.get('/:id', async (req, res, next) => {
    try {
        let {id} = req.params
        const postFounded = await postService.getPostById(id)

        return res.status(200).json({status:200,message:"Success",data:postFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})
postApi.get('/get-by-slug/:slug', async (req, res, next) => {
    try {
        let {slug} = req.params
        const postFounded = await postService.getPostBySlug(slug)

        return res.status(200).json({status:200,message:"Success",data:postFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})
postApi.get('/get-by-tag-id/:tag_id', async (req, res, next) => {
    try {
        let {tag_id} = req.params
        const postFounded = await postService.getPostByTagId(tag_id)

        return res.status(200).json({status:200,message:"Success",data:postFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})
postApi.get('/get-by-tag-name/:name', async (req, res, next) => {
    try {
        let {name} = req.params
        const postFounded = await postService.getPostByTagName(id)

        return res.status(200).json({status:200,message:"Success",data:postFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})
postApi.get('/get-by-tag-slug/:tag_slug', async (req, res, next) => {
    try {
        let {tag_slug} = req.params
        const postFounded = await postService.getPostByTagSlug(tag_slug)

        return res.status(200).json({status:200,message:"Success",data:postFounded})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})
//checkRequiredFieldInBody(['title', 'content','tag_id'])
// var cpUpload = upload.fields([{ name: 'images',maxCount:1}]);
postApi.post('/',verifyToken,adminRole,
    
    async (req, res, next) => {
        console.log("SDDSDDS")
        console.log(req.files.images)
        console.log(req.body)
        try {
            // let result = await uploadFromBuffer(req);
            // console.log(result);
            
            // if(req.files) {
            //     let cld_upload_stream = cloudinary.uploader.upload_stream({folder: "test"}, function (error, result) {     
            //         console.log(error, result);  
            //         res.json({ public_id: result.public_id, url: result.secure_url });         
            //     });
            // }
        
            // streamifier.createReadStream(req.files[0].buffer).pipe(cld_upload_stream);
            // image = req.file.image;

            // const result = await cloudinary.v2.uploader.upload(image)
            // console.log(result.secure_url);

            let {title,url_image, content,tag_id} = req.body
            const insertedId = await  postService.createPost(title,url_image,content,tag_id)

            return res.status(200).json({status:200,message: 'Create new post successfully'})
        } catch (error) {
            return res.status(500).json({status:500,message: error})
        }
    })

postApi.put('/:id',verifyToken,adminRole,
    checkRequiredFieldInBody(['title', 'content']),
    async (req, res, next) => {
        let {id} = req.params
        try {
            let {title,url_image, content,tag_id} = req.body
            await postService.updatePost(id, title,url_image, content,tag_id)

            return res.status(200).json({message: 'updated post successfully'})
        } catch (error) {
            return res.status(500).json({status:500,message: error})
        }
    })

postApi.delete('/:id',verifyToken,adminRole,
    async (req, res, next) => {
        let {id} = req.params
        try {
            await postService.deletePost(id)

            return res.status(200).json({message: 'removed post successfully'})
        } catch (error) {
            return res.status(500).json({status:500,message: error})
        }
    })

module.exports = postApi