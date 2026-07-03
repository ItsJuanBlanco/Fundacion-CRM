import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://przarikhpgsfpwjpcanj.supabase.co'
const supabaseAnonKey = 'sb_publishable_4aqFw60kh2CFPOLamIpaFQ_h_gvnttD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
