'use strict'
const mysql = require('mysql');
const logger = require('../../logger');
const { to } = require('../../helper/to');
class BannerService {
    constructor(mysqlDb) {
        this.mysqlDb = mysqlDb
    }

    getAllBanner() {
        return new Promise(async (resolve, reject) => {
        
            const query = `
                SELECT * FROM banner
            `
            console.log(query);
            let [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[BannerService][getBanner] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            } else {
                console.log(result)
                return resolve(this.returnListBanner(result))
            }

        })
    }
    getBannerById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = `
                SELECT * FROM banner WHERE id = ${mysql.escape(id)}
                `
                console.log(query);
                const [err, Banner] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[BannerService][getBannerById] errors: `, err)
                    return reject(err?.sqlMessage ? err.sqlMessage : err)
                }
                if (!Banner.length) {
                    return reject(`banner with id ${id} not found`)
                }
                return resolve(this.returnBanner(Banner[0]))
            } catch (error) {
                return reject(`Error : ${error}`)
            }

        })
    }
    createBanner(list_images) {
        console.log("Post")
        return new Promise(async (resolve, reject) => {
            const url_image1 = list_images[0] ? list_images[0] : null 
            const url_image2 = list_images[1] ? list_images[1] : null
            const url_image3 = list_images[2] ? list_images[2] : null
            const url_image4 = list_images[3] ? list_images[3] : null
            const url_image5 = list_images[4] ? list_images[4] : null
            const query = `
                INSERT INTO banner (url_image1,url_image2,url_image3,url_image4,url_image5)
                VALUES (${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},${mysql.escape(url_image4)},${mysql.escape(url_image5)})`

            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                console.log(err);
                logger.error(`[BannerService][createBanner] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            return resolve(result?.insertId)
        })
    }

    updateBanner(id,list_images) {
        return new Promise(async (resolve, reject) => {
            const url_image1 = list_images[0] ? list_images[0] : null 
            const url_image2 = list_images[1] ? list_images[1] : null
            const url_image3 = list_images[2] ? list_images[2] : null
            const url_image4 = list_images[3] ? list_images[3] : null
            const url_image5 = list_images[4] ? list_images[4] : null
            const query = `
                UPDATE banner SET 
                url_image1 = ${mysql.escape(url_image1)},
                url_image2 = ${mysql.escape(url_image2)},
                url_image3 = ${mysql.escape(url_image3)},
                url_image4 = ${mysql.escape(url_image4)},
                url_image5 = ${mysql.escape(url_image5)}
                WHERE id = ${mysql.escape(id)}
            `
            const [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[BannerService][updateMaibanner] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
            if (result.affectedRows === 0) {
                return reject(`Banner with id ${id} not found`)
            }

            return resolve(result)
        })
    }
    deleteBanner(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.mysqlDb.beginTransaction()
                const query =
                    `
                    DELETE  FROM banner
                    WHERE id = ${mysql.escape(id)}
                `
                let result = await this.mysqlDb.poolQuery(query)
                console.log(result)
                if (result.affectedRows === 0) {
                    return reject(` banner with id ${id} not found`)
                }
                await this.mysqlDb.commit()
                return resolve(`message: Remove successfully`);
            } catch (err) {
                logger.error(`[bannerService][deletebanner] errors: `, err)
                await this.mysqlDb.rollback()
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            }
        })
    }

    returnListBanner = (listBanner) => {
        let returnList = listBanner.map(banner =>{
            let list_images = []
            for(const property in banner) {
                if(banner[property] && banner[property] && property !== 'id') {
                    list_images.push(banner[property]);
                } 
            }
    
            return {
                id :banner.id,
                list_images : list_images
            }

        })
        return returnList;
       
    }
    returnBanner = (banner) => {
        let list_images = []
        for(const property in banner) {
            if(banner[property] && property !== 'id') {
                list_images.push(banner[property]);
            } 
        }

        return {
            id :banner.id,
            list_images : list_images
        }
    }

}


module.exports = BannerService