let cloudinary = require("cloudinary").v2;
let streamifier = require('streamifier');
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})

let uploadFromBuffer = (req) => {

   return new Promise((resolve, reject) => {

     let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "foo"
      },
      (error,result) => {

        if (result) {
          resolve(result);
        } else {
          reject(error);
         }
       }
     );

     streamifier.createReadStream(req.files.images[0].buffer).pipe(cld_upload_stream);
   });

};
module.exports = Object.assign({},{uploadFromBuffer})