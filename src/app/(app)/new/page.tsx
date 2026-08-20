"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { QUESTIONS } from "@/lib/constants";
import { questionnaireSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  Type,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  X,
} from "lucide-react";

type WizardFormData = z.infer<typeof questionnaireSchema>;

const TOTAL_STEPS = QUESTIONS.length + 2; // CV + 11 questions + review

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvMode, setCvMode] = useState<"upload" | "paste">("upload");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<WizardFormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      education_status: "",
      education_status_other: "",
      field_of_study: "",
      expected_graduation: "",
      preferred_work_style: [],
      career_priorities: [],
      things_i_enjoy: "",
      things_i_dislike: "",
      past_experiences: "",
      target_location: "",
      salary_goal: "",
      biggest_current_problem: "",
      industries_of_interest: "",
      hard_constraints: "",
    },
  });

  const formValues = watch();

  const isCvValid = useCallback(() => {
    if (cvMode === "upload") return cvFile !== null;
    return cvText.trim().length >= 50;
  }, [cvMode, cvFile, cvText]);

  async function handleNext() {
    if (currentStep === 0) {
      if (!isCvValid()) {
        toast.error(
          cvMode === "upload"
            ? "Please upload your CV"
            : "Please paste at least 50 characters of your CV",
        );
        return;
      }
    } else if (currentStep >= 1 && currentStep <= QUESTIONS.length) {
      const question = QUESTIONS[currentStep - 1];
      const fieldName = question.fieldName as keyof WizardFormData;
      const fieldsToValidate: (keyof WizardFormData)[] = [fieldName];

      if (fieldName === "education_status") {
        if (formValues.education_status === "Other") {
          fieldsToValidate.push("education_status_other");
        } else if (
          formValues.education_status ===
          "Currently pursuing a degree (in progress)"
        ) {
          fieldsToValidate.push("field_of_study", "expected_graduation");
        }
      }

      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 5 * 1024 * 1024
    ) {
      setCvFile(file);
    } else {
      toast.error("Please upload a PDF file under 5MB");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 5 * 1024 * 1024
    ) {
      setCvFile(file);
    } else if (file) {
      toast.error("Please upload a PDF file under 5MB");
    }
  }

  async function onSubmit(data: WizardFormData) {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let cvFilePath: string | undefined;
      let finalCvText = cvText;

      // Upload PDF if provided
      if (cvMode === "upload" && cvFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error("You must be signed in to upload a CV.");
          setIsSubmitting(false);
          return;
        }

        const fileExt = "pdf";
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("cv-uploads")
          .upload(fileName, cvFile);

        if (uploadError) {
          toast.error("Failed to upload CV. Please try pasting instead.");
          setIsSubmitting(false);
          return;
        }

        cvFilePath = fileName;
        finalCvText = "(PDF uploaded - see file)";
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: finalCvText,
          cvFilePath,
          questionnaire: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Something went wrong");
        setIsSubmitting(false);
        setCurrentStep(0);
        return;
      }

      router.push(`/analysis/${result.analysisId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      setCurrentStep(0);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-9 sm:mb-14">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">
          <span>Your path</span>
          <span>
            Step {currentStep + 1} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="relative flex items-center justify-between px-1">
          <span className="absolute left-2 right-2 top-1/2 h-px bg-border" />
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`relative z-10 size-3 rounded-full border ${i < currentStep ? "border-primary bg-primary" : i === currentStep ? "border-primary bg-[#faf7f2] [animation:pulse-star_1.8s_ease-in-out_infinite]" : "border-border bg-[#faf7f2]"}`}
            >
              {i < currentStep && (
                <Check className="absolute -left-0.5 -top-0.5 size-4 text-primary" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {currentStep === 0 && (
              <StepCV
                cvMode={cvMode}
                setCvMode={setCvMode}
                cvFile={cvFile}
                setCvFile={setCvFile}
                cvText={cvText}
                setCvText={setCvText}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                onFileDrop={handleFileDrop}
                onFileSelect={handleFileSelect}
              />
            )}

            {currentStep >= 1 && currentStep <= QUESTIONS.length && (
              <StepQuestion
                question={QUESTIONS[currentStep - 1]}
                control={control}
                errors={errors}
              />
            )}

            {currentStep === TOTAL_STEPS - 1 && (
              <StepReview
                cvMode={cvMode}
                cvFile={cvFile}
                cvText={cvText}
                formValues={formValues}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mobile-safe-bottom sticky bottom-20 z-20 -mx-4 mt-8 flex items-center justify-between border-t bg-background/95 px-4 pt-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="min-h-11 gap-2 px-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="min-h-11 gap-2 rounded-xl px-5"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 gap-2 rounded-xl px-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate my career path"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ---------- Step Components ---------- */

function StepCV({
  cvMode,
  setCvMode,
  cvFile,
  setCvFile,
  cvText,
  setCvText,
  isDragOver,
  setIsDragOver,
  onFileDrop,
  onFileSelect,
}: {
  cvMode: "upload" | "paste";
  setCvMode: (m: "upload" | "paste") => void;
  cvFile: File | null;
  setCvFile: (f: File | null) => void;
  cvText: string;
  setCvText: (t: string) => void;
  isDragOver: boolean;
  setIsDragOver: (b: boolean) => void;
  onFileDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="py-4 md:px-10">
      <h2 className="font-display text-3xl md:text-4xl leading-tight mb-2">
        Upload your CV
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        We&apos;ll analyze your experience to find patterns and strengths.
      </p>
      <p className="text-xs text-muted-foreground/80 mb-6">
        Your CV is processed by OpenAI to generate this analysis. We don&apos;t
        sell your data.{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacy Policy
        </Link>
      </p>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCvMode("upload")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
            cvMode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setCvMode("paste")}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
            cvMode === "paste"
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Type className="w-4 h-4" />
          Paste text
        </button>
      </div>

      {cvMode === "upload" ? (
        <div>
          {cvFile ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <FileText className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {cvFile.name}
                </p>
                <p className="text-xs text-primary/70">
                  {(cvFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCvFile(null)}
                className="p-1 rounded-md hover:bg-green-100 transition-colors"
              >
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onFileDrop}
              className={`flex flex-col items-center justify-center px-4 py-10 sm:p-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <Upload className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium mb-1">
                Drop your CV here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={onFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <div>
          <Textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV content here. Include your experience, education, skills, and any relevant details..."
            className="min-h-[240px] resize-none rounded-xl"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {cvText.length} characters
            {cvText.length > 0 && cvText.length < 50 ? " (minimum 50)" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function StepQuestion({
  question,
  control,
  errors,
}: {
  question: (typeof QUESTIONS)[number];
  control: ReturnType<typeof useForm<WizardFormData>>["control"];
  errors: ReturnType<typeof useForm<WizardFormData>>["formState"]["errors"];
}) {
  const fieldName = question.fieldName as keyof WizardFormData;
  const error = errors[fieldName];

  return (
    <div className="min-h-[360px] py-4 md:px-10">
      <h2 className="font-display text-3xl md:text-4xl leading-tight mb-3">
        {question.label}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {question.description}
      </p>

      {question.type === "multi-select" && question.options ? (
        <Controller
          name={fieldName as "preferred_work_style" | "career_priorities"}
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {question.options!.map((option) => {
                const selected = (field.value as string[]).includes(option);
                const atMax =
                  question.maxSelections &&
                  (field.value as string[]).length >= question.maxSelections &&
                  !selected;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!!atMax}
                    onClick={() => {
                      const current = field.value as string[];
                      if (selected) {
                        field.onChange(current.filter((v) => v !== option));
                      } else {
                        field.onChange([...current, option]);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : atMax
                          ? "bg-accent/50 text-muted-foreground/50 border-border/30 cursor-not-allowed"
                          : "bg-[#faf7f2] text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        />
      ) : question.type === "single-select" && question.options ? (
        <Controller
          name={fieldName as "education_status"}
          control={control}
          render={({ field }) => (
            <>
              <div className="flex flex-wrap gap-2">
                {question.options!.map((option) => {
                  const selected = field.value === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => field.onChange(option)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-[#faf7f2] text-foreground border-border hover:border-primary"
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {option}
                    </button>
                  );
                })}
              </div>

              {fieldName === "education_status" && field.value === "Other" && (
                <div className="mt-4">
                  <Controller
                    name="education_status_other"
                    control={control}
                    render={({ field: otherField }) => (
                      <Input
                        {...otherField}
                        value={(otherField.value as string) || ""}
                        placeholder={question.placeholder}
                        className="rounded-xl"
                      />
                    )}
                  />
                  {errors.education_status_other && (
                    <p className="text-xs text-destructive mt-2">
                      {errors.education_status_other.message as string}
                    </p>
                  )}
                </div>
              )}

              {fieldName === "education_status" &&
                field.value === "Currently pursuing a degree (in progress)" && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Field of study
                      </p>
                      <Controller
                        name="field_of_study"
                        control={control}
                        render={({ field: fosField }) => (
                          <Input
                            {...fosField}
                            value={(fosField.value as string) || ""}
                            placeholder="e.g., Computer Science"
                            className="rounded-xl"
                          />
                        )}
                      />
                      {errors.field_of_study && (
                        <p className="text-xs text-destructive mt-2">
                          {errors.field_of_study.message as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Expected graduation
                      </p>
                      <Controller
                        name="expected_graduation"
                        control={control}
                        render={({ field: gradField }) => (
                          <Input
                            {...gradField}
                            value={(gradField.value as string) || ""}
                            placeholder="e.g., Spring 2027"
                            className="rounded-xl"
                          />
                        )}
                      />
                      {errors.expected_graduation && (
                        <p className="text-xs text-destructive mt-2">
                          {errors.expected_graduation.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </>
          )}
        />
      ) : (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              value={(field.value as string) || ""}
              placeholder={question.placeholder}
              className="min-h-[120px] resize-none rounded-xl"
            />
          )}
        />
      )}

      {error && (
        <p className="text-xs text-destructive mt-2">
          {error.message as string}
        </p>
      )}

      {!question.required && (
        <p className="text-xs text-muted-foreground mt-2">Optional</p>
      )}
    </div>
  );
}

function StepReview({
  cvMode,
  cvFile,
  cvText,
  formValues,
  isSubmitting,
}: {
  cvMode: "upload" | "paste";
  cvFile: File | null;
  cvText: string;
  formValues: WizardFormData;
  isSubmitting: boolean;
}) {
  return (
    <div className="py-4 md:px-10">
      <h2 className="font-display text-3xl md:text-4xl leading-tight mb-2">
        Review & submit
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Everything looks good? Hit submit to generate your personalized career
        analysis.
      </p>

      <div className="space-y-4">
        {/* CV summary */}
        <div className="p-4 rounded-xl bg-accent/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            CV
          </p>
          <p className="text-sm">
            {cvMode === "upload" && cvFile
              ? `PDF uploaded: ${cvFile.name}`
              : `${cvText.length} characters pasted`}
          </p>
        </div>

        {/* Questionnaire summary */}
        {QUESTIONS.map((q) => {
          const value = formValues[q.fieldName as keyof WizardFormData];
          let display = Array.isArray(value)
            ? value.join(", ")
            : (value as string);
          if (!display) return null;

          if (q.fieldName === "education_status") {
            if (display === "Other" && formValues.education_status_other) {
              display = `Other: ${formValues.education_status_other}`;
            } else if (display === "Currently pursuing a degree (in progress)") {
              const details = [
                formValues.field_of_study &&
                  `Field of study: ${formValues.field_of_study}`,
                formValues.expected_graduation &&
                  `Expected graduation: ${formValues.expected_graduation}`,
              ]
                .filter(Boolean)
                .join(" · ");
              if (details) display = `${display} (${details})`;
            }
          }

          return (
            <div key={q.id} className="p-4 rounded-xl bg-accent/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {q.label}
              </p>
              <p className="text-sm line-clamp-2">{display}</p>
            </div>
          );
        })}
      </div>

      {isSubmitting && (
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium">Generating your analysis...</p>
          <p className="text-xs text-muted-foreground mt-1">
            This usually takes 30-60 seconds
          </p>
        </div>
      )}
    </div>
  );
}
