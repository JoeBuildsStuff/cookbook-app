export type Contact = {
  idx: number
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  nickname: string | null
  primary_email: string
  primary_phone: string
  company: string
  job_title: string
  birthday: string
  notes: string
  is_favorite: boolean
  tags: string[]
  display_name: string
}