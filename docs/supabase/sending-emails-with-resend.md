Edge Functions
Third-Party Tools
Sending Emails with Resend
Sending Emails

Sending emails from Edge Functions using the Resend API.

Prerequisites#
To get the most out of this guide, you’ll need to:

Create an API key
Verify your domain
Make sure you have the latest version of the Supabase CLI installed.

1. Create Supabase function#
Create a new function locally:

supabase functions new resend
Store the RESEND_API_KEY in your .env file.

2. Edit the handler function#
Paste the following code into the index.ts file:

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const handler = async (_request: Request): Promise<Response> => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'hello world',
      html: '<strong>it works!</strong>',
    }),
  })
  const data = await res.json()
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
Deno.serve(handler)
3. Deploy and send email#
Run function locally:

supabase start
supabase functions serve --no-verify-jwt --env-file .env
Test it: http://localhost:54321/functions/v1/resend

Deploy function to Supabase:

supabase functions deploy resend --no-verify-jwt
When you deploy to Supabase, make sure that your RESEND_API_KEY is set in Edge Function Secrets Management

Open the endpoint URL to send an email: