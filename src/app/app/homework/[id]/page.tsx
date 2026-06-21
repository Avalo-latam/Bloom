import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Paperclip } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { gradeSubmission } from "@/app/app/homework/actions";
import { SubmitHomeworkForm } from "@/components/app/submit-homework-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("homework");

  const { data: sub } = await supabase
    .from("submissions")
    .select(
      "id, status, text_answer, file_url, grade, feedback, student_id, assignment:assignments(title, instructions, due_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!sub) notFound();

  const a = sub.assignment as {
    title: string;
    instructions: string | null;
    due_at: string | null;
  } | null;
  const isOwner = sub.student_id === me.id;
  const isStaff = me.role !== "student";
  if (!isOwner && !isStaff) notFound();

  let fileUrl: string | null = null;
  if (sub.file_url) {
    const { data } = await supabase.storage
      .from("submissions")
      .createSignedUrl(sub.file_url, 3600);
    fileUrl = data?.signedUrl ?? null;
  }

  const graded = sub.status === "graded";

  return (
    <div className="mx-auto max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
        <Link href="/app/homework">
          <ArrowLeft className="size-4" />
          {t("title")}
        </Link>
      </Button>

      <div className="glass-card rounded-3xl p-6">
        <h1 className="font-heading text-2xl font-bold">{a?.title}</h1>
        {a?.instructions && (
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {a.instructions}
          </p>
        )}
        {a?.due_at && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("due")}: {new Date(a.due_at).toLocaleDateString("es-AR")}
          </p>
        )}
      </div>

      {/* Graded feedback (visible to both once graded) */}
      {graded && (
        <div className="mt-5 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {t("feedback")}
            </h2>
            {sub.grade != null && (
              <span className="font-heading text-3xl font-extrabold text-primary">
                {Number(sub.grade)}
              </span>
            )}
          </div>
          {sub.feedback && (
            <p className="mt-2 whitespace-pre-line text-muted-foreground">
              {sub.feedback}
            </p>
          )}
        </div>
      )}

      {/* Student's own work */}
      {isOwner ? (
        graded ? (
          <SubmissionView
            t={t}
            text={sub.text_answer}
            fileUrl={fileUrl}
            label={t("yourWork")}
          />
        ) : (
          <div className="mt-5 glass-card rounded-3xl p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold">
              {t("yourWork")}
            </h2>
            <SubmitHomeworkForm
              submissionId={sub.id}
              userId={me.id}
              defaultText={sub.text_answer ?? ""}
            />
          </div>
        )
      ) : (
        <>
          <SubmissionView
            t={t}
            text={sub.text_answer}
            fileUrl={fileUrl}
            label={t("studentSubmission")}
            empty={sub.status === "assigned"}
          />
          {/* Grade form */}
          <div className="mt-5 glass-card rounded-3xl p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold">
              {t("gradeAndFeedback")}
            </h2>
            <form action={gradeSubmission} className="space-y-4">
              <input type="hidden" name="submissionId" value={sub.id} />
              <div className="w-32 space-y-1.5">
                <Label htmlFor="grade">{t("grade")} (0–100)</Label>
                <Input
                  id="grade"
                  name="grade"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={sub.grade != null ? Number(sub.grade) : ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="feedback">{t("feedback")}</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  rows={4}
                  defaultValue={sub.feedback ?? ""}
                />
              </div>
              <Button type="submit">{t("saveGrade")}</Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function SubmissionView({
  t,
  text,
  fileUrl,
  label,
  empty,
}: {
  t: (k: string) => string;
  text: string | null;
  fileUrl: string | null;
  label: string;
  empty?: boolean;
}) {
  return (
    <div className="mt-5 glass-card rounded-3xl p-6">
      <h2 className="mb-3 font-heading text-lg font-semibold">{label}</h2>
      {empty && !text && !fileUrl ? (
        <p className="text-sm text-muted-foreground">{t("noSubmissionYet")}</p>
      ) : (
        <>
          {text && (
            <p className="whitespace-pre-line text-sm text-foreground/90">{text}</p>
          )}
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Paperclip className="size-4" />
              {t("attachFile")}
            </a>
          )}
        </>
      )}
    </div>
  );
}
