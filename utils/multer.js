const multer = require('multer') // khai báo multer
module.exports = multer({
    storage: multer.diskStorage({}),
    fieldFilter: (req, file , callback ) => {
        if(!file.mimetpye.match(/jpe|jpeg|png|gif$i/)){
            callback(new Error('File is not supported'), false)
            return
        }
        callback(null,true)
    } 
})
