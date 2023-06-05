// utils/supabase.js
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const getSupabase = (userId, SUPABASE_JWT_SECRET) => {
  const options = {}

  if (userId) {
    console.log("userId", userId)
    const payload = {
      userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }

    //console.log("In supabase payload", payload, SUPABASE_JWT_SECRET)
    const token = jwt.sign(payload, SUPABASE_JWT_SECRET)

    options.global = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
   }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options
  )
  return supabase
}

export { getSupabase }