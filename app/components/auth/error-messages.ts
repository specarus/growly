type AuthErrorAction = "login" | "signup";

type FriendlyErrorRule = {
  equals?: string;
  contains?: string;
  message: string;
};

const friendlyErrorRules: Record<AuthErrorAction, FriendlyErrorRule[]> = {
  login: [
    {
      equals: "Invalid email or password",
      message:
        "That email and password combo doesn't match our records. Double-check your credentials or reset your password.",
    },
    {
      equals: "Invalid password",
      message:
        "The password looks incorrect. Try again or reset your password if you need a fresh start.",
    },
    {
      contains: "User not found",
      message:
        "We couldn't find an account with that email. Please double-check the address or create a new account.",
    },
    {
      contains: "Account not found",
      message:
        "We couldn't find an account with that email. Please double-check the address or create a new account.",
    },
    {
      contains: "Credential account not found",
      message:
        "We can't log you in with those credentials. Make sure you already signed up or try another method.",
    },
    {
      contains: "Email not verified",
      message:
        "Confirm your email before logging in. Check your inbox for the verification link we sent.",
    },
    {
      contains: "Invalid email",
      message: "That email doesn't look quite right. Please correct it and try again.",
    },
  ],
  signup: [
    {
      contains: "User already exists",
      message:
        "An account already exists with that email. Try logging in instead or use a different email.",
    },
    {
      contains: "Invalid email",
      message:
        "Please use a valid email address so we can send you account updates and password resets.",
    },
    {
      contains: "Password too short",
      message: "Use a longer password so your account stays secure.",
    },
    {
      contains: "Password too long",
      message: "Use a shorter password so we can save it without issues.",
    },
    {
      contains: "Failed to create user",
      message:
        "We couldn't create your account right now. Try again in a minute or reach out if the issue persists.",
    },
  ],
};

const fallbackMessages: Record<AuthErrorAction, string> = {
  login: "Something went wrong while logging you in. Please try again.",
  signup: "Something went wrong while creating your account. Please try again.",
};

export const getFriendlyAuthErrorMessage = (
  action: AuthErrorAction,
  error: unknown
): string => {
  if (error instanceof Error) {
    const normalized = error.message.trim();

    if (normalized) {
      for (const rule of friendlyErrorRules[action]) {
        if (rule.equals && rule.equals === normalized) {
          return rule.message;
        }

        if (rule.contains && normalized.includes(rule.contains)) {
          return rule.message;
        }
      }
    }
  }

  return fallbackMessages[action];
};
