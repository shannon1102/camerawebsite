'use strict'
const express = require('express')
const MysqlDB = require('../../models/mysql')
const {checkRequiredFieldInBody} = require('../../middleware')
const BannerService = require('../../services/bannerService/bannerService')
const bannerApi = express.Router()
const mysqlDb = new MysqlDB()
const bannerService = new BannerService(mysqlDb)
const { verifyToken,adminRole } = require('../../middleware/verifyToken')

bannerApi.get('/', async (req, res, next) => {
    try {
        const result = await bannerService.getAllBanner()

        return res.status(200).json({status:200,data: result})
    } catch (error) {
        return res.status(500).json({status:500,message: error})
    }
})


bannerApi.post('/',verifyToken,adminRole,
    async (req, res, next) => {
        try {
           
            let {list_images} = req.body
            const insertedId = await bannerService.createBanner(list_images)
            return res.status(200).json({status:200,message: `Update  banner id successfully`})
        } catch (error) {
            return res.status(500).json({status:500,message: error})
        }
})


module.exports = bannerApi