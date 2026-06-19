"use client";

import * as React from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Check, Copy, Loader2 } from "lucide-react";
import { createMember, type CreateMemberResult } from "@/app/app/students/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/roles";

type Option = { id: string; label: string };

export function AddMemberDialog({
  role,
  teachers,
  levels,
}: {
  role: UserRole;
  teachers: Option[];
  levels: Option[];
}) {
  const t = useTranslations("students");
  const [open, setOpen] = React.useState(false);
  const [memberRole, setMemberRole] = React.useState<"student" | "teacher">(
    "student",
  );
  const [state, action, pending] = useActionState<
    CreateMemberResult | null,
    FormData
  >(createMember, null);

  const created = state?.ok ? state : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {role === "owner" ? t("newMember") : t("addStudent")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {created ? (
          <CreatedView
            email={created.email}
            password={created.tempPassword}
            onDone={() => setOpen(false)}
          />
        ) : (
          <form action={action}>
            <DialogHeader>
              <DialogTitle>
                {role === "owner" ? t("newMember") : t("newStudent")}
              </DialogTitle>
              <DialogDescription>{t("subtitle")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {role === "owner" && (
                <div className="space-y-1.5">
                  <Label>{t("role")}</Label>
                  <input type="hidden" name="role" value={memberRole} />
                  <Select
                    value={memberRole}
                    onValueChange={(v) =>
                      setMemberRole(v as "student" | "teacher")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        {t("roleStudent")}
                      </SelectItem>
                      <SelectItem value="teacher">
                        {t("roleTeacher")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {role !== "owner" && (
                <input type="hidden" name="role" value="student" />
              )}

              <div className="space-y-1.5">
                <Label htmlFor="m-name">{t("name")}</Label>
                <Input id="m-name" name="fullName" required minLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-email">{t("email")}</Label>
                <Input id="m-email" name="email" type="email" required />
              </div>

              {memberRole === "student" && (
                <>
                  {role === "owner" && (
                    <div className="space-y-1.5">
                      <Label>{t("selectTeacher")}</Label>
                      <SelectField name="teacherId" placeholder={t("selectTeacher")} options={teachers} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label>{t("level")}</Label>
                    <SelectField name="levelId" placeholder={t("selectLevel")} options={levels} />
                  </div>
                </>
              )}

              {state && !state.ok && (
                <p className="text-sm text-destructive">
                  {state.error === "exists"
                    ? t("errorExists")
                    : t("errorGeneric")}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending} className="gap-2">
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? t("creating") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Controlled Select that mirrors its value into a hidden input for form posts. */
function SelectField({
  name,
  placeholder,
  options,
}: {
  name: string;
  placeholder: string;
  options: Option[];
}) {
  const [value, setValue] = React.useState("");
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function CreatedView({
  email,
  password,
  onDone,
}: {
  email: string;
  password: string;
  onDone: () => void;
}) {
  const t = useTranslations("students");
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard.writeText(`${email} · ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="size-4" />
          </span>
          {t("createdTitle")}
        </DialogTitle>
        <DialogDescription>{t("tempPasswordInfo")}</DialogDescription>
      </DialogHeader>
      <div className="my-4 space-y-2 rounded-xl border bg-muted/40 p-4 font-mono text-sm">
        <div>
          <span className="text-muted-foreground">{t("email")}: </span>
          {email}
        </div>
        <div>
          <span className="text-muted-foreground">pass: </span>
          {password}
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={copy} className="gap-2">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button onClick={onDone}>{t("done")}</Button>
      </DialogFooter>
    </div>
  );
}
