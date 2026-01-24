import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone';

export const getUserByEmail = async (email: string) => {
  try {
    const supabase = createServiceRoleSupabaseClient()
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found' is not an error for us here
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

export const getUserByEmailOrPhone = async (identifier: string) => {
  const id = String(identifier ?? '').trim().toLowerCase();
  if (!id) {
    return null;
  }

  const isEmail = id.includes('@');
  const phone = isEmail ? null : normalizePhone(id);

  try {
    const supabase = createServiceRoleSupabaseClient()
    let query = supabase.from('clients').select('*');

    if (isEmail) {
      query = query.eq('email', id);
    } else {
      query = query.eq('phone', phone);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user by email/phone:', error);
    return null;
  }
};