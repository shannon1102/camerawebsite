'use strict'
const express = require('express');
const MysqlDB = require('../../models/mysql');
const ProductService = require('../../services/productService/productService');
const productApi = express.Router();
const mysqlDb = new MysqlDB();
const productService = new ProductService(mysqlDb);
const {checkRequiredFieldInBody,checkRequiredFieldInQuery} = require('../../middleware/index')
const {verifyToken,adminRole} = require('../../middleware/verifyToken');
const {removeAccent} =  require('../../utils/index');
productApi.get('/', (req,res,next) => {
    let {productsPerPage,pageNumber,orderType,search} = req.query;
    productService
    .getProducts(productsPerPage,pageNumber,orderType,search)
    .then(listProduct => {
        return res.status(200).json({status:200,message:"Success",data: listProduct})
    })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })

})
productApi.get('/filter/by-price/', (req,res,next) => {
    let {minPrice,maxPrice,productsPerPage,pageNumber,orderType,search} = req.query;
    productService
    .getFilterByPrice(minPrice,maxPrice,productsPerPage,pageNumber,orderType,search)
    .then(listProduct => {
        return res.status(200).json({status:200,message:"Success",data: listProduct})
    })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })

})
productApi.get('/get-by-category-id/:category_id', (req,res,next) => {
    
    let {category_id} = req.params
    console.log(category_id);
    let {productsPerPage,pageNumber,orderType,search} = req.query;
    productService
    .getProductsByCategoryId(category_id,productsPerPage,pageNumber,orderType,search)
    .then(listProduct => {
        return res.status(200).json({status:200,message:"Success",data: listProduct})
    })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })

})
productApi.get('/get-by-category-slug/:category_slug', (req,res,next) => {
    
    let {category_slug} = req.params

    console.log(category_slug);
    let {productsPerPage,pageNumber,orderType,search} = req.query;
    productService
    .getProductsByCategorySlug(category_slug,productsPerPage,pageNumber,orderType,search)
    .then(listProduct => {
        return res.status(200).json({status:200,message:"Success",data: listProduct})
    })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })

})


// productApi.get('/get-by-category-id/:category_id', (req,res,next) => {
    
//     let {category_id} = req.params
//     console.log(category_id);
//     let {productsPerPage,pageNumber,orderType,search} = req.query;
//     productService
//     .getProductsByCategoryId(category_id,productsPerPage,pageNumber,orderType,search)
//     .then(listProduct => {
//         return res.status(200).json({status:200,message:"Success",data: listProduct})
//     })
//     .catch(err=>{
//         return res.status(500).json({status:500,message: err})
//     })

// })

// productApi.get('/get-by-category-name/',checkRequiredFieldInQuery(['main_category', 'category']), (req,res,next) => {
    
//     let {main_category, category,productsPerPage,pageNumber,orderType,search} = req.query;
//     productService
//     .getProductsByCategoryName(main_category, category,productsPerPage,pageNumber,orderType,search)
//     .then(listProduct => {
//         return res.status(200).json({status:200,message:"Success",data: listProduct})
//     })
//     .catch(err=>{
//         return res.status(500).json({status:500,message: err})
//     })

// })

productApi.get('/:id',(req,res,next)=>{
    let {id} = req.params
    console.log(id)
    productService
    .getProductById(id)
    .then(listProduct=>{
        return res.status(200).json({status:200,message:"Success",data: listProduct})
        })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })  
})
productApi.get('/get-by-slug/:slug',(req,res,next)=>{
    let {slug} = req.params
    console.log(slug)
    productService
    .getProductBySlug(slug)
    .then(listProduct=>{
        return res.status(200).json({status:200,message:"Success",data: listProduct})
        })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })  
})
productApi.post('/',verifyToken,adminRole,checkRequiredFieldInBody(['name','description','price','category_id']), (req,res,next)=>{
    let {name,description,detail,list_product_images,price,discount,category_id} = req.body
    console.log("sdadda",req.body)
    productService
    .createProduct(name, description, detail,list_product_images, price, discount, category_id)
    .then(result => { 
        return res.status(200).json({
            status:200,
            message: 'Post new product successfully'
        })
    })
    .catch(err => {
        return res.status(500).json({status:500,message: err})
    })  
})
productApi.put('/:id',verifyToken,adminRole, (req,res,next)=>{
    let {id} = req.params
    let {name,description,detail,list_product_images,price,discount,category_id} = req.body
    console.log(req.body)
    productService
    .updateProduct(id,name,description,detail,list_product_images,price,discount,category_id)
    .then(result=>{
        return res.status(200).json({  
            status:200,
            message: "Update product successfully",
            data:result
            })
        })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })  
})
productApi.delete('/:id',verifyToken,adminRole,(req,res,next)=>{
    let {id} = req.params
    productService
    .deleteProduct(id)
    .then(result=>{
        return res.status(200).json({
            status:200,
            message: 'Detele product sucessfully',
            })
    })
    .catch(err=>{
        return res.status(500).json({status:500,message: err})
    })  
})

module.exports = productApi;