import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zswqxvhkchazgupmaigw.supabase.co';
const supabaseKey = 'sb_publishable_cGbtz8_q0HHOV6MbNB9Njw_VyN13tQB';

export const supabase = createClient(supabaseUrl, supabaseKey);