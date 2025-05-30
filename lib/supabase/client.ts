import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create a single instance of the Supabase client with optimized settings
const supabase: SupabaseClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'charities-next-to-me-auth',
      storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key)
            return value ? JSON.parse(value) : null
          } catch {
            return null
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch (error) {
            console.error('Error storing auth data:', error)
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error('Error removing auth data:', error)
          }
        }
      }
    },
    global: {
      headers: {
        'x-application-name': 'charities-next-to-me'
      }
    }
  }
)

// Helper functions for common operations
export const supabaseHelpers = {
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async getUserPosts(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateUserProfile(userId: string, updates: any) {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
  },

  async likePost(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
  }
}

// Export the client instance
export const createClient = (): SupabaseClient => supabase
