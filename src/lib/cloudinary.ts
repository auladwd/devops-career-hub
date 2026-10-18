import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];

/**
 * Upload a file buffer directly to Cloudinary scoped to user folder.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  userId: string,
  folderType: 'documents' | 'resumes' | 'certificates' = 'documents'
): Promise<{ publicId: string; secureUrl: string; bytes: number; format: string }> {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials are not configured on server.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `devops_career_hub/${userId}/${folderType}`,
        resource_type: 'auto',
        tags: [userId, folderType],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            bytes: result.bytes,
            format: result.format || 'unknown',
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete an asset from Cloudinary, verifying that the asset belongs to the user
 */
export async function deleteFromCloudinary(publicId: string, userId: string): Promise<boolean> {
  // Ensure the publicId contains the user's folder to prevent deleting another user's asset
  if (!publicId.includes(userId)) {
    throw new Error('Unauthorized asset deletion attempt.');
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    return true; // No-op if not configured
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === 'ok';
}

export default cloudinary;
