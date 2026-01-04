import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface SignupConfirmationEmailProps {
  supabaseUrl: string;
  emailActionType: string;
  redirectTo: string;
  tokenHash: string;
  token: string;
  userName?: string;
}

const getEmailContent = (emailActionType: string, userName?: string) => {
  const name = userName || "there";

  switch (emailActionType) {
    case "signup":
      return {
        preview: "Confirm your email address",
        heading: "Welcome!",
        text: `Hi ${name}, thanks for signing up! Please confirm your email address by clicking the button below.`,
        buttonText: "Confirm Email",
        footerText: "If you didn't create an account, you can safely ignore this email.",
      };
    case "magiclink":
      return {
        preview: "Your login link",
        heading: "Login Link",
        text: `Hi ${name}, click the button below to log in to your account.`,
        buttonText: "Log In",
        footerText: "If you didn't request this link, you can safely ignore this email.",
      };
    case "recovery":
      return {
        preview: "Reset your password",
        heading: "Reset Password",
        text: `Hi ${name}, we received a request to reset your password. Click the button below to choose a new password.`,
        buttonText: "Reset Password",
        footerText: "If you didn't request a password reset, you can safely ignore this email.",
      };
    case "invite":
      return {
        preview: "You've been invited",
        heading: "You're Invited!",
        text: `Hi ${name}, you've been invited to join. Click the button below to accept the invitation and set up your account.`,
        buttonText: "Accept Invitation",
        footerText: "If you weren't expecting this invitation, you can safely ignore this email.",
      };
    case "email_change":
      return {
        preview: "Confirm your new email",
        heading: "Confirm Email Change",
        text: `Hi ${name}, please confirm your new email address by clicking the button below.`,
        buttonText: "Confirm Email Change",
        footerText: "If you didn't request this change, please contact support immediately.",
      };
    default:
      return {
        preview: "Action required",
        heading: "Action Required",
        text: `Hi ${name}, please click the button below to continue.`,
        buttonText: "Continue",
        footerText: "If you didn't request this action, you can safely ignore this email.",
      };
  }
};

export const SignupConfirmationEmail = ({
  supabaseUrl,
  emailActionType,
  redirectTo,
  tokenHash,
  token,
  userName,
}: SignupConfirmationEmailProps) => {
  const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${emailActionType}&redirect_to=${redirectTo}`;
  const content = getEmailContent(emailActionType, userName);

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{content.heading}</Heading>
          <Text style={paragraph}>{content.text}</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              {content.buttonText}
            </Button>
          </Section>
          <Text style={paragraph}>
            Or copy and paste this code:
          </Text>
          <Section style={codeContainer}>
            <code style={code}>{token}</code>
          </Section>
          <Hr style={hr} />
          <Text style={footerText}>{content.footerText}</Text>
          <Text style={footerText}>
            This link will expire in 24 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SignupConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 20px",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const codeContainer = {
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "20px 0",
};

const code = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  letterSpacing: "4px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 10px",
};
