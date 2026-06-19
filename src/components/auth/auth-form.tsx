"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, Sparkles } from "lucide-react";
import {
  signInWithPassword,
  signUp,
  signInWithOtp,
  type AuthState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const initial: AuthState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <Button type="submit" className="w-full" size="lg">
      {children}
    </Button>
  );
}

export function AuthForm() {
  const t = useTranslations("auth");

  const [signInState, signInAction, signingIn] = useActionState(
    signInWithPassword,
    initial,
  );
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initial);
  const [otpState, otpAction, sendingOtp] = useActionState(
    signInWithOtp,
    initial,
  );

  const [magic, setMagic] = React.useState(false);

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
        <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
      </TabsList>

      {/* Sign in */}
      <TabsContent value="signin" className="mt-6">
        {magic ? (
          <form action={otpAction} className="space-y-4">
            <Field
              id="otp-email"
              name="email"
              type="email"
              label={t("email")}
              autoComplete="email"
              required
            />
            {otpState.sent ? (
              <p className="rounded-xl bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
                {t("magicLinkSent")}
              </p>
            ) : (
              <SubmitButton>
                {sendingOtp ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {t("magicLink")}
              </SubmitButton>
            )}
            <button
              type="button"
              onClick={() => setMagic(false)}
              className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("signIn")}
            </button>
          </form>
        ) : (
          <form action={signInAction} className="space-y-4">
            <Field
              id="signin-email"
              name="email"
              type="email"
              label={t("email")}
              autoComplete="email"
              required
            />
            <Field
              id="signin-password"
              name="password"
              type="password"
              label={t("password")}
              autoComplete="current-password"
              required
            />
            {signInState.error && (
              <p className="text-sm text-destructive">{t("errorInvalid")}</p>
            )}
            <SubmitButton>
              {signingIn && <Loader2 className="size-4 animate-spin" />}
              {t("signInCta")}
            </SubmitButton>
            <button
              type="button"
              onClick={() => setMagic(true)}
              className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="size-3.5" />
              {t("magicLink")}
            </button>
          </form>
        )}
      </TabsContent>

      {/* Sign up */}
      <TabsContent value="signup" className="mt-6">
        <form action={signUpAction} className="space-y-4">
          <Field
            id="signup-name"
            name="fullName"
            label={t("fullName")}
            autoComplete="name"
            required
          />
          <Field
            id="signup-email"
            name="email"
            type="email"
            label={t("email")}
            autoComplete="email"
            required
          />
          <Field
            id="signup-password"
            name="password"
            type="password"
            label={t("password")}
            autoComplete="new-password"
            required
            minLength={6}
          />
          {signUpState.sent ? (
            <p className="rounded-xl bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
              {t("checkEmail")} — {t("magicLinkSent")}
            </p>
          ) : (
            <SubmitButton>
              {signingUp && <Loader2 className="size-4 animate-spin" />}
              {t("signUpCta")}
            </SubmitButton>
          )}
          {signUpState.error && (
            <p className="text-sm text-destructive">{t("errorGeneric")}</p>
          )}
        </form>
      </TabsContent>
    </Tabs>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} {...rest} />
    </div>
  );
}
