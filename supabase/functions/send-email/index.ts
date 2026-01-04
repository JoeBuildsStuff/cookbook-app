import React from "npm:react@18.3.1";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { SignupConfirmationEmail } from "./_templates/signup-confirmation.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

interface EmailPayload {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
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
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  try {
    const { user, email_data } = wh.verify(payload, headers) as EmailPayload;
    const { token, token_hash, redirect_to, email_action_type } = email_data;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    let subject: string;
    let html: string;

    // Handle different email types
    switch (email_action_type) {
      case "signup":
        subject = "Confirm your email";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
        break;

      case "magiclink":
        subject = "Your login link";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
        break;

      case "recovery":
        subject = "Reset your password";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
        break;

      case "invite":
        subject = "You've been invited";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
        break;

      case "email_change":
        subject = "Confirm your email change";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
        break;

      default:
        subject = "Action required";
        html = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            supabaseUrl,
            token,
            tokenHash: token_hash,
            redirectTo: redirect_to,
            emailActionType: email_action_type,
            userName: user.user_metadata?.full_name,
          })
        );
    }

    const { error } = await resend.emails.send({
      from: "Your App <noreply@joe-taylor.me>",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send email hook error:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || "Failed to send email",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
