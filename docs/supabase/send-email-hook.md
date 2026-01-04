Send Email Hook

Use your own email service to send authentication emails.

The Send Email Hook replaces Supabase's built-in email sending. You can use this hook to:

Send emails using your own email provider
Add internationalization or custom logic
Fall back to another provider if your primary one fails
Inputs

Field	Type	Description
user	User	The user account taking the action
email	object	Metadata specific to the email sending process

JSON

JSON Schema
{
  "user": {
    "id": "8484b834-f29e-4af2-bf42-80644d154f76",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "valid.email@supabase.io",
    "phone": "",
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    },
    "user_metadata": {
      "email": "valid.email@supabase.io",
      "email_verified": false,
      "phone_verified": false,
      "sub": "8484b834-f29e-4af2-bf42-80644d154f76"
    },
    "identities": [
      {
        "identity_id": "bc26d70b-517d-4826-bce4-413a5ff257e7",
        "id": "8484b834-f29e-4af2-bf42-80644d154f76",
        "user_id": "8484b834-f29e-4af2-bf42-80644d154f76",
        "identity_data": {
          "email": "valid.email@supabase.io",
          "email_verified": false,
          "phone_verified": false,
          "sub": "8484b834-f29e-4af2-bf42-80644d154f76"
        },
        "provider": "email",
        "last_sign_in_at": "2024-05-14T12:56:33.824231484Z",
        "created_at": "2024-05-14T12:56:33.824261Z",
        "updated_at": "2024-05-14T12:56:33.824261Z",
        "email": "valid.email@supabase.io"
      }
    ],
    "created_at": "2024-05-14T12:56:33.821567Z",
    "updated_at": "2024-05-14T12:56:33.825595Z",
    "is_anonymous": false
  },
  "email_data": {
    "token": "305805",
    "token_hash": "7d5b7b1964cf5d388340a7f04f1dbb5eeb6c7b52ef8270e1737a58d0",
    "redirect_to": "http://localhost:3000/",
    "email_action_type": "signup",
    "site_url": "http://localhost:9999",
    "token_new": "",
    "token_hash_new": "",
    "old_email": "",
    "old_phone": "",
    "provider": "",
    "factor_type": ""
  }
}
Outputs

No outputs are required. An empty response with a status code of 200 is taken as a successful response.
Email sending behavior#
Email sending depends on two settings: Email Provider and Auth Hook status.

Email Provider	Auth Hook	Result
Enabled	Enabled	Auth Hook handles email sending (SMTP not used)
Enabled	Disabled	SMTP handles email sending (custom if configured, default otherwise)
Disabled	Enabled	Email signups disabled
Disabled	Disabled	Email signups disabled
Email change behavior and token hash mapping#
When email_action_type is email_change, the hook payload can include one or two OTPs and their hashes. This depends on your Secure Email Change setting.

Secure Email Change enabled: two OTPs are generated, one for the current email (user.email) and one for the new email (user.email_new). You must send two emails.
Secure Email Change disabled: only one OTP is generated for the new email. You send a single email.
Counterintuitive field naming
The token hash field names are reversed due to backward compatibility. Pay careful attention to which token/hash pair goes with which email address:

token_hash_new → use with the current email address (user.email) and token
token_hash → use with the new email address (user.email_new) and token_new
Do not assume the _new suffix refers to the new email address.

What to send#
When Secure Email Change is enabled (both token/hash pairs present):

Send to current email address (user.email): use token with token_hash_new
Send to new email address (user.email_new): use token_new with token_hash
When Secure Email Change is disabled (only one token/hash pair present):

Send a single email to the new email address. Use token with token_hash or token_new with token_hash, depending on which fields are present in the payload.

SQL

HTTP

Use Resend as an email provider

Add Internationalization for Email Templates
You can configure Resend as the custom email provider through the "Send Email" hook. This allows you to take advantage of Resend's developer-friendly APIs to send emails and leverage React Email for managing your email templates. For a more advanced React Email tutorial, refer to this guide.

If you want to send emails through the Supabase Resend integration, which uses Resend's SMTP server, check out this integration instead.

Create a .env file with the following environment variables:

RESEND_API_KEY="your_resend_api_key"
SEND_EMAIL_HOOK_SECRET="v1,whsec_<base64_secret>"
You can generate the secret in the Auth Hooks section of the Supabase dashboard.

Set the secrets in your Supabase project:

supabase secrets set --env-file .env
Create a new edge function:

supabase functions new send-email
Add the following code to your edge function:

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend";
const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string).replace("v1,whsec_", "");
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);
  try {
    const { user, email_data } = wh.verify(payload, headers) as {
      user: {
        email: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new: string;
        token_hash_new: string;
      };
    };
    const { error } = await resend.emails.send({
      from: "welcome <onboarding@example.com>",
      to: [user.email],
      subject: "Welcome to my site!",
      text: `Confirm you signup with this code: ${email_data.token}`,
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: responseHeaders,
  });
});
Deploy your edge function and configure it as a hook:

supabase functions deploy send-email --no-verify-jwt