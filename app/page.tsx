import { createClient } from '@/lib/supabase/server'

export default async function Page() {

  const supabase = await createClient()

  const { data: fruits } = await supabase.from('fruits').select()

  return (
    <ul>
      {fruits?.map((fruit) => (
        <li key={fruit.id}>{fruit.name}</li>
      ))}
    </ul>
  )
}
