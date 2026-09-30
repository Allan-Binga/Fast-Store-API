const crypto = require("crypto");
const path = require("path");

const {
  S3Client,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const { fail } = require("../utils/http");


const requiredS3Settings = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
];

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
      ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
      : undefined,
});

const imageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const imageFileFilter = (_req, file, callback) => {
  if (!imageTypes.has(file.mimetype)) {
    return callback(
      fail(400, "Only JPEG, PNG and WebP images are allowed.")
    );
  }

  callback(null, true);
};

const s3Storage = (folder) =>
  multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, callback) => {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      callback(
        null,
        folder +
          "/" +
          Date.now() +
          "-" +
          crypto.randomUUID() +
          extension
      );
    },
  });

const productPhotoUploader = multer({
  storage: s3Storage("products"),
  limits: {
    files: 4,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

const brandLogoUploader = multer({
  storage: s3Storage("brand-logos"),
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

const refundEvidenceUploader = multer({
  storage: s3Storage("refund-evidence"),
  limits: {
    files: 2,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

const ensureS3Configured = (next) => {
  const missingSetting = requiredS3Settings.find(
    (key) => !process.env[key]
  );

  if (!missingSetting) {
    return true;
  }

  next(
    fail(503, "Image storage is not configured.")
  );

  return false;
};

const handleUploadError = (error, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    return next(
      fail(400, error.message)
    );
  }

  next(error);
};

const uploadProductImages = (req, res, next) => {
  if (!ensureS3Configured(next)) {
    return;
  }

  productPhotoUploader.array("images", 4)(
    req,
    res,
    (error) => handleUploadError(error, next)
  );
};

const uploadBrandLogo = (req, res, next) => {
  if (!ensureS3Configured(next)) {
    return;
  }

  brandLogoUploader.single("logo")(
    req,
    res,
    (error) => handleUploadError(error, next)
  );
};

const uploadRefundEvidence = (req, res, next) => {
  // Ordinary refund requests may remain JSON and do not require image storage.
  if (!req.is("multipart/form-data")) {
    return next();
  }

  if (!ensureS3Configured(next)) {
    return;
  }

  refundEvidenceUploader.array("evidence", 2)(
    req,
    res,
    (error) => handleUploadError(error, next)
  );
};


module.exports = {
  uploadProductImages,
  uploadBrandLogo,
  uploadRefundEvidence,
};
