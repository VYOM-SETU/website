import R2 from './_utils/r2.js';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    try {
        const { fileName, fileType, folder } = req.body;
        if (!fileName || !fileType || !folder) {
            return res.status(400).json({ error: 'Missing fileName, fileType, or folder' });
        }

        const key = `${folder}/${randomUUID()}-${fileName.replace(/\s+/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(R2, command, { expiresIn: 600 });

        res.status(200).json({ presignedUrl, key });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ error: 'Could not generate upload URL.' });
    }
}