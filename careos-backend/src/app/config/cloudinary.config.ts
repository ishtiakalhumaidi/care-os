import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { envVars } from './env.js';

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (
    fileBuffer: Buffer, 
    folderName: string, 
    mimetype?: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const options: any = {
            folder: folderName,
            resource_type: "auto"
        };

        if (mimetype === "application/pdf") {
            options.format = "pdf";
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
