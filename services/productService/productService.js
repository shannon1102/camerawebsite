'use strict'
const mysql = require('mysql');
const { orderTypeSetting } = require('../../config/index');
const logger = require('../../logger');
const { to } = require('../../helper/to');
const { createSlug } = require('../../utils/index')

class ProductService {
    constructor(mysqlDb) {
        this.mysqlDb = mysqlDb
    }
    getProducts(minPrice, maxPrice, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100
                offsetDb = productsPerPage * (pageNumber - 1)
                if (minPrice == -1 && maxPrice == -1) {
                    minPrice = 0
                    maxPrice = 10000000000000
                }
                minPrice = minPrice ? minPrice : 0
                maxPrice = maxPrice ? maxPrice : 10000000000000
                // search = search ? search : ""
                if (search) {
                    var stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')
                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }

                const query =
                    `SELECT p.*,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,pi.url_image5 
                    FROM product as p
            JOIN product_image AS pi ON p.id = pi.product_id
            WHERE 
            ((p.price*(100-p.discount)/100) >= ${minPrice}  
                    AND (p.price*(100-p.discount)/100) <= ${maxPrice})
                    AND (${stringSearch})          
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`
                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                let listProductReturn = this.returnListProduct(listProduct)
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(listProductReturn)
                }

            });
    }

    getProductsByCategoryId(category_id, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100
                offsetDb = productsPerPage * (pageNumber - 1)
                search = search ? search : ""
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }
                const query =
                    `SELECT p.*,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,pi.url_image5
                     FROM product as p
                    JOIN product_image AS pi ON pi.product_id = p.id
            WHERE p.category_id = ${mysql.escape(category_id)}
            AND ( p.name LIKE ${mysql.escape('%' + search + '%')}
            OR p.description LIKE ${mysql.escape('%' + search + '%')})
            ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
            LIMIT ${productsPerPage}
            OFFSET ${mysql.escape(offsetDb)}`

                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(this.returnListProduct(listProduct))
                }

            });

    }
    getProductById(id) {

        return new Promise(async (resolve, reject) => {

            const query1 =
                `SELECT p.*,c.slug AS category_slug,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,pi.url_image5
                FROM product AS p
                JOIN product_image AS pi ON pi.product_id = p.id
                JOIN category AS c ON c.id = p.category_id
            WHERE p.id = ${mysql.escape(id)}`

            const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))

            if (err1) {
                logger.error(`[productService][getProductById] errors: `, err)
                return reject(err)
            }
            if (!productResult.length) {
                return reject(`product with id ${id} not found`)
            }

            return resolve(this.returnProduct(productResult[0]))
        })
    }
    getProductsByCategorySlug(category_slug, minPrice, maxPrice, productsPerPage, pageNumber, orderType, search) {
        return new Promise(
            async (resolve, reject) => {
                let offsetDb = 0, orderByDb;
                orderType = orderType ? orderType : 2
                pageNumber = pageNumber ? pageNumber : 1
                productsPerPage = productsPerPage ? productsPerPage : 100
                offsetDb = productsPerPage * (pageNumber - 1)
                if (minPrice == -1 && maxPrice == -1) {
                    minPrice = 0
                    maxPrice = 10000000000000
                }
                minPrice = minPrice ? minPrice : 0
                maxPrice = maxPrice ? maxPrice : 10000000000000
                // search = search ? search : ""
                if (search) {
                    var stringSearch = search.split(' ').map(element => {
                        return `p.name LIKE ${mysql.escape('%' + element + '%')} OR p.description LIKE ${mysql.escape('%' + element + '%')}`
                    }).join(' OR ')

                } else {
                    stringSearch = `p.name LIKE ${mysql.escape('%' + "" + '%')} OR p.description LIKE ${mysql.escape('%' + "" + '%')}`
                }
                if (orderType == orderTypeSetting.ASC) {
                    orderByDb = 'ASC'
                } else {
                    orderByDb = 'DESC'
                }

                const query =
                    `SELECT p.*,c.slug AS category_slug,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,pi.url_image5
                    FROM product as p
                    JOIN category AS c ON p.category_id = c.id
                    JOIN product_image AS pi ON pi.product_id= p.id

                    WHERE c.slug = ${mysql.escape(category_slug)}
                    AND ((p.price*(100-p.discount)/100) >= ${minPrice}  
                        AND (p.price*(100-p.discount)/100) <= ${maxPrice})
                    AND (${stringSearch})          
                    ORDER BY p.create_at ${mysql.escape(orderByDb).split(`'`)[1]}
                    LIMIT ${productsPerPage}
                    OFFSET ${mysql.escape(offsetDb)}`


                let [err, listProduct] = await to(this.mysqlDb.poolQuery(query))
                if (err) {
                    logger.error(`[productService][getProducts] errors : `, err)
                    return reject(err)
                } else {
                    return resolve(this.returnListProduct(listProduct))
                }

            });

    }
    getProductBySlug(slug) {

        return new Promise(async (resolve, reject) => {
            try {
                const query1 =
                    `SELECT p.*,c.slug AS category_slug,pi.url_image1,pi.url_image2,pi.url_image3,pi.url_image4,pi.url_image5
                    FROM product AS p
                    JOIN product_image AS pi ON pi.product_id = p.id
                    JOIN category AS c ON c.id = p.category_id
                    WHERE p.slug = ${mysql.escape(slug)}`


                const [err1, productResult] = await to(this.mysqlDb.poolQuery(query1))


                if (err1) {
                    logger.error(`[productService][getProductById] errors: `, err)
                    return reject(err1)
                }
                if (!productResult.length) {
                    return reject(`product with id ${id} not found`)
                }

                return resolve(this.returnProduct(productResult[0]));

            } catch (error) {
                logger.error(error);
                return reject(error)

            }

        })
    }
    createProduct(name, description, detail, list_product_images, price, discount, category_id) {
        const slug = createSlug(name);

        const url_image1 = list_product_images[0] ? list_product_images[0] : null;
        const url_image2 = list_product_images[1] ? list_product_images[1] : null;
        const url_image3 = list_product_images[2] ? list_product_images[2] : null;
        const url_image4 = list_product_images[3] ? list_product_images[3] : null;
        const url_image5 = list_product_images[4] ? list_product_images[4] : null;
        return new Promise(async (resolve, reject) => {
            try {
                this.mysqlDb.pool.getConnection(
                    async (err, connection) => {
                        if (err) {
                            logger.error(`[tutorialService][addPost] Getting connection from pool failed \n ${err}`, { filename: `${__filename}` })
                            reject(err)
                        } else {
                            connection.beginTransaction(async err => {
                                if (err) {
                                    logger.error(`Begin transaction fail`, { filename: `${__filename}` })
                                    connection.rollback(() => {
                                        connection.release()
                                        reject(err)
                                    })
                                } else {
                                    const query = `INSERT INTO product(name,description,detail,price, discount,category_id,slug) 
                                    VALUES (${mysql.escape(name)},${mysql.escape(description)},${mysql.escape(detail)},${mysql.escape(price)},${mysql.escape(discount)},${mysql.escape(category_id)},${mysql.escape(slug)})
                                    `

                                    await connection.query(query, (err, result) => {
                                        if (err) {
                                            connection.rollback(() => {
                                                logger.error(`[productService][createProduct] errors: `, err)
                                                connection.release()
                                                reject(err.sqlMessage)
                                            })
                                        } else {
                                            const insertId = result.insertId;
                                            console.log(insertId)

                                            const query2 = `INSERT INTO product_image (product_id,url_image1,url_image2,url_image3,url_image4,url_image5) 
                                            VALUES (${mysql.escape(insertId)},${mysql.escape(url_image1)},${mysql.escape(url_image2)},${mysql.escape(url_image3)},
                                            ${mysql.escape(url_image4)},${mysql.escape(url_image5)})`

                                            connection.query(query2, (err1, result1) => {
                                                if (err1) {
                                                    connection.rollback(() => {
                                                        logger.error(`[productService][addImage] Insert to blog table fail: ${err}`)
                                                        connection.release()
                                                        reject(err.sqlMessage)
                                                    })
                                                } else {
                                                    console.log(result);
                                                    connection.release();
                                                    resolve('success');
                                                }

                                            })


                                        }
                                    })


                                }
                            })
                        }
                    })



            } catch (error) {
                logger.error(`[productService][createProduct] errors: `, error)
                connection.release()
                return reject(error?.sqlMessage)
            }

        })
    }
    updateProduct(id, name, description, detail, list_product_images, price, discount, category_id) {

        const url_image1 = list_product_images[0] ? list_product_images[0] : null;
        const url_image2 = list_product_images[1] ? list_product_images[1] : null;
        const url_image3 = list_product_images[2] ? list_product_images[2] : null;
        const url_image4 = list_product_images[3] ? list_product_images[3] : null;
        const url_image5 = list_product_images[4] ? list_product_images[4] : null;
        return new Promise(async (resolve, reject) => {
                this.mysqlDb.pool.getConnection(
                    async (err, connection) => {
                        if (err) {
                            logger.error(`[tutorialService][addPost] Getting connection from pool failed \n ${err}`, { filename: `${__filename}` })
                            connection.release()
                            reject(err)
                        } else {
                            connection.beginTransaction(async err => {
                                if (err) {
                                    console.log(err);
                                    connection.release()
                                } else {
                                    const query = `UPDATE product
                                    SET name = ${mysql.escape(name)},
                                    description = ${mysql.escape(description)},
                                    detail = ${mysql.escape(detail)},
                                    price = ${mysql.escape(price)},
                                    discount = ${mysql.escape(discount)},
                                    category_id = ${mysql.escape(category_id)}
                                    WHERE id = ${mysql.escape(id)}
                                    `
                                    await connection.query(query, (err, result) => {
                                        if (err) {
                                            logger.error(`[productService][updateProduct] errors: `, err)
                                            connection.rollback()
                                            connection.release()
                                            return reject(err)
                                        } else {

                                            const query1 = `UPDATE product_image
                                            SET url_image1 = ${mysql.escape(url_image1)},
                                            url_image2 = ${mysql.escape(url_image2)},
                                            url_image3 = ${mysql.escape(url_image3)},
                                            url_image4 = ${mysql.escape(url_image4)},
                                            url_image5 = ${mysql.escape(url_image5)}
                                            WHERE product_id = ${mysql.escape(id)}
                                        `
                                            connection.query(query1, (err1, result) => {
                                                if (err1) {
                                                    connection.rollback(() => {
                                                        logger.error(`[productService][updateProductImage] errors: `, err1)
                                                        connection.release()
                                                        reject(err.sqlMessage);
                                                    })
                                                } else {
                                                    connection.release()
                                                    resolve('Update product success');
                                                }
                                            })
                                        }

                                    })

                                }

                        })}
                        
                    }
                )


            })
        }
    deleteProduct(id) {
                return new Promise(async (resolve, reject) => {
                    let query = `SELECT COUNT(*) AS numProduct FROM product WHERE id = ${mysql.escape(id)}`
                    let result1 = await this.mysqlDb.poolQuery(query)
                    if (!result1[0].numProduct) {
                        return reject(`Product with id ${id} not found`)
                    }
                    this.mysqlDb.pool.getConnection(
                        (err, connection) => {
                            if (err) {
                                reject(`Error connect database ${err}`);
                            }
                            connection.beginTransaction(async (err, result) => {
                                if (err) {
                                    reject('Conection vs DB fault');
                                }
                                const query = `
                            DELETE FROM product
                            WHERE id = ${mysql.escape(id)}
                            `
                                connection.query(query, (err1, result1) => {
                                    if (err1) {
                                        connection.rollback(() => {
                                            connection.release()
                                            reject(err1)
                                        })
                                    }
                                    connection.release();
                                    return resolve(`Delete product with id ${id} sucessfully`)

                                })


                            })


                        })
                })
            }
            returnListProduct = (listProduct) => {
                return listProduct.map(e => {
                    return {
                        "id": e.id,
                        "name": e.name,
                        "description": e.description,
                        "detail": e.detail,
                        "price": e.price,
                        "discount": e.discount,
                        "new_price": Math.round(e.price - e.price * (e.discount / 100)),
                        "category_id": e.category_id,
                        "slug": e.slug,
                        "create_at": e.create_at,
                        "update_at": e.update_at,
                        "list_product_images": [e.url_image1, e.url_image2, e.url_image3, e.url_image4, e.url_image5].filter(e1 => (e1 !== null && e1?.length > 0))
                    }
                })
            }
            returnProduct = (e) => {
                return {
                    "id": e.id,
                    "name": e.name,
                    "description": e.description,
                    "detail": e.detail,
                    "price": e.price,
                    "discount": e.discount,
                    "new_price": Math.round(e.price - e.price * (e.discount / 100)),
                    "category_id": e.category_id,
                    "slug": e.slug,
                    "create_at": e.create_at,
                    "update_at": e.update_at,
                    "list_product_images": [e.url_image1, e.url_image2, e.url_image3, e.url_image4, e.url_image5].filter(e1 => (e1 !== null && e1?.length > 0))
                }
            }
        }

module.exports = ProductService;