const cloudinary = require('cloudinary').v2;
// Cấu hình cloudinary
cloudinary.config({ 
  cloud_name: 'dwxly01ng', 
  api_key: '288435484361345', 
  api_secret: 'kIH4p0GdFvLFhLD4r8hmDNVQ0CU' 
});
module.exports = cloudinary;