"use client";

import { useState, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

const TOTAL_STEPS = QUESTIONS.length + 2; // CV + 10 questions + review

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
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const isCvValid = useCallback(() => {
    if (cvMode === "upload") return cvFile !== null;
    return cvText.trim().length >= 50;
  }, [cvMode, cvFile, cvText]);

  const isQuestionValid = useCallback(
    (questionIndex: number) => {
      const question = QUESTIONS[questionIndex];
      const value = formValues[question.fieldName as keyof WizardFormData];

      if (!question.required) return true;

      if (question.type === "multi-select") {
        return Array.isArray(value) && value.length > 0;
      }
      return typeof value === "string" && value.trim().length >= 2;
    },
    [formValues]
  );

  async function handleNext() {
    if (currentStep === 0) {
      if (!isCvValid()) {
        toast.error(
          cvMode === "upload"
            ? "Please upload your CV"
            : "Please paste at least 50 characters of your CV"
        );
        return;
      }
    } else if (currentStep >= 1 && currentStep <= QUESTIONS.length) {
      const question = QUESTIONS[currentStep - 1];
      const fieldName = question.fieldName as keyof WizardFormData;
      const valid = await trigger(fieldName);
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
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
      setCvFile(file);
    } else {
      toast.error("Please upload a PDF file under 5MB");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
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
        const fileExt = "pdf";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("cv-uploads")
          .upload(fileName, cvFile);

        if (uploadError) {
          toast.error("Failed to upload CV. Please try pasting instead.");
          setIsSubmitting(false);
          return;
        }

        cvFilePath = fileName;
        finalCvText = "(PDF uploaded — see file)";
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
        return;
      }

      router.push(`/analysis/${result.analysisId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Steps */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
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
                formValues={formValues}
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
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="gap-2 rounded-xl"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 rounded-xl"
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
    <div className="bg-white rounded-2xl border border-border/50 p-8">
      <h2 className="text-xl font-semibold tracking-tight mb-1">
        Upload your CV
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        We&apos;ll analyze your experience to find patterns and strengths.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCvMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <FileText className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {cvFile.name}
                </p>
                <p className="text-xs text-green-600">
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
              className={`flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <Upload className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium mb-1">
                Drop your CV here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PDF only, max 5MB
              </p>
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
            {cvText.length > 0 && cvText.length < 50
              ? " (minimum 50)"
              : ""}
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
  formValues,
}: {
  question: (typeof QUESTIONS)[number];
  control: ReturnType<typeof useForm<WizardFormData>>["control"];
  errors: ReturnType<typeof useForm<WizardFormData>>["formState"]["errors"];
  formValues: WizardFormData;
}) {
  const fieldName = question.fieldName as keyof WizardFormData;
  const error = errors[fieldName];

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-8">
      <h2 className="text-xl font-semibold tracking-tight mb-1">
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
                          : "bg-white text-foreground border-border/50 hover:border-border"
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
    <div className="bg-white rounded-2xl border border-border/50 p-8">
      <h2 className="text-xl font-semibold tracking-tight mb-1">
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
          const display = Array.isArray(value)
            ? value.join(", ")
            : (value as string);
          if (!display) return null;

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
