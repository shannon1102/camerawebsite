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
                LIMIT 1
            `
            let [err, result] = await to(this.mysqlDb.poolQuery(query))
            if (err) {
                logger.error(`[BannerService][getBanner] errors: `, err)
                return reject(err?.sqlMessage ? err.sqlMessage : err)
            } else {
                return resolve(this.returnBanner(result[0]))
            }

        })
    }

    createBanner(list_images) {
        return new Promise(async (resolve, reject) => {
            try {
                const url_image1 = list_images[0] ? list_images[0] : null
                const url_image2 = list_images[1] ? list_images[1] : null
                const url_image3 = list_images[2] ? list_images[2] : null
                const url_image4 = list_images[3] ? list_images[3] : null
                const url_image5 = list_images[4] ? list_images[4] : null
                let query = '';
                const query0 = 'SELECT * FROM banner LIMIT 1';
                const [err0, result0] = await to(this.mysqlDb.poolQuery(query0))
               
                if (result0.length == 0) {
                    query = `
                    INSERT INTO  banner(url_image1,url_image2,url_image3,url_image4,url_image5)
                    VALUES (${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},${mysql.escape(url_image4)},${mysql.escape(url_image5)})`;
                }else{
                    const insertedId = result0[0]?.id;
                    query = `
                    UPDATE  banner
                    SET 
                    url_image1 = ${mysql.escape(url_image1)},
                    url_image2 = ${mysql.escape(url_image2)},
                    url_image3 = ${mysql.escape(url_image3)},
                    url_image4 = ${mysql.escape(url_image4)},
                    url_image5 = ${mysql.escape(url_image5)}
                    WHERE id = ${mysql.escape(insertedId)}`;
                }
               

                const [err, result] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[BannerService][createorUpdateBanner] errors: `, err)
                    return reject(err?.sqlMessage ? err.sqlMessage : err)
                }
                return resolve(result?.insertId)

            } catch (error) {
                reject(error);
            }
        });



    }




    returnListBanner = (listBanner) => {
        let returnList = listBanner.map(banner => {
            let list_images = []
            for (const property in banner) {
                if (banner[property] && banner[property] && property !== 'id') {
                    list_images.push(banner[property]);
                }
            }

            return {
                id: banner.id,
                list_images: list_images
            }

        })
        return returnList;

    }
    returnBanner = (banner) => {
        let list_images = []
        for (const property in banner) {
            if (banner[property] && property !== 'id') {
                list_images.push(banner[property]);
            }
        }
        return {
            list_images: list_images
        }
    }

}


module.exports = BannerService