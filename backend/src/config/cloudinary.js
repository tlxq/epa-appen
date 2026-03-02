import { v2 as cloudinary } from 'cloudinary';

// Snabb debug: visar om env finns (inte själva hemligheten)
console.log(
  'Cloudinary env:',
  JSON.stringify(
    {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
        ? 'OK'
        : 'MISSING',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'OK' : 'MISSING',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? 'OK'
        : 'MISSING',
    },
    null,
    2,
  ),
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
