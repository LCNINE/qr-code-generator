import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/type/supabaseType'

abstract class Service {
  protected supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }
}

export default Service