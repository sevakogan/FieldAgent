'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Company, User } from '@/types/database'

const SYSTEM_EMAIL = 'admin@kleanhq.local'
const SYSTEM_PASSWORD = 'KleanHQ-Admin-2026!'

export async function getOrCreateCompany(): Promise<{ company: Company; user: User }> {
  const supabase = createAdminClient()

  // Check if any company exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('*')
    .limit(1)
    .single()

  if (existingCompany) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', existingCompany.owner_id)
      .single()
    return { company: existingCompany as Company, user: user as User }
  }

  // Bootstrap: create system user + company
  // 1. Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: SYSTEM_EMAIL,
    password: SYSTEM_PASSWORD,
    email_confirm: true,
  })

  if (authError) {
    // User might already exist in auth but not in public.users
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const found = existingUsers?.users?.find(u => u.email === SYSTEM_EMAIL)
    if (!found) throw new Error(`Failed to create system user: ${authError.message}`)
    
    // Use existing auth user
    const userId = found.id

    // 2. Create public user
    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      email: SYSTEM_EMAIL,
      full_name: 'Admin',
      role: 'owner',
    })
    if (userError) console.error('User upsert error:', userError)

    // 3. Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'My Company',
        slug: 'my-company',
        business_type: 'cleaning',
        owner_id: userId,
      })
      .select()
      .single()

    if (companyError) throw new Error(`Failed to create company: ${companyError.message}`)

    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
    return { company: company as Company, user: user as User }
  }

  const userId = authUser.user.id

  // 2. Create public user
  await supabase.from('users').insert({
    id: userId,
    email: SYSTEM_EMAIL,
    full_name: 'Admin',
    role: 'owner',
  })

  // 3. Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: 'My Company',
      slug: 'my-company',
      business_type: 'cleaning',
      owner_id: userId,
    })
    .select()
    .single()

  if (companyError) throw new Error(`Failed to create company: ${companyError.message}`)

  // 4. Create company member for owner
  await supabase.from('company_members').insert({
    company_id: company.id,
    user_id: userId,
    role: 'owner',
  })

  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  return { company: company as Company, user: user as User }
}

export async function getCompanyId(): Promise<string> {
  const { company } = await getOrCreateCompany()
  return company.id
}

export async function getOwnerId(): Promise<string> {
  const { user } = await getOrCreateCompany()
  return user.id
}
