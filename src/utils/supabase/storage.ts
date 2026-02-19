import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

export const uploadAuditImage = async (file: Blob | string, userId: string): Promise<string | null> => {
    try {
        const fileName = `${userId}/${uuidv4()}.png`;
        let fileBody: Blob;

        if (typeof file === 'string') {
            // If it's a base64 string, convert to Blob
            const response = await fetch(file);
            fileBody = await response.blob();
        } else {
            fileBody = file;
        }

        const { data, error } = await supabase
            .storage
            .from('audit-images')
            .upload(fileName, fileBody, {
                contentType: 'image/png',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('audit-images')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadAuditImage:', error);
        return null;
    }
};
