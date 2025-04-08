const multer = require("multer");
const path = require("path");

//Create a storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "imageUploads/");
  },
  filename: function (req, file, cb) {
    //Renaming files to avoid duplicates: x-12345.jpg
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//Filter only to allow jpg and jpeg
const fileFilter = (req, file, cb) => {
  const allowedFormats = ["image/jpeg", "image/jpg"];
  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and JPG images are allowed!"), false);
  }
};

const uploadImage = multer({ storage, fileFilter });

module.exports = uploadImage;
