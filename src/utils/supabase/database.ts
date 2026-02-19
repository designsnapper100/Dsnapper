import { supabase } from './client';

export const saveAudit = async (userId: string, data: any, imageUrl: string, projectName: string = 'Untitled Project') => {
    try {
        const { data: result, error } = await supabase
            .from('audits')
            .insert([
                {
                    user_id: userId,
                    thumbnail_url: imageUrl,
                    project_name: projectName,
                    analysis_data: data,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving audit:', error);
            throw error;
        }

        return result;
    } catch (error) {
        console.error('Error in saveAudit:', error);
        throw error;
    }
};

export const getUserAudits = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user audits:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserAudits:', error);
        throw error;
    }
};

export const getAuditById = async (auditId: string) => {
    try {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('id', auditId)
            .single();

        if (error) {
            console.error('Error fetching audit by ID:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getAuditById:', error);
        throw error;
    }
};
