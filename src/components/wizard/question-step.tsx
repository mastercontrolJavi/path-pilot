"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import type { QuestionDefinition } from "@/lib/constants";
import { RadioGroup, RadioGroupRow } from "@/components/ui/radio-group";
import { CheckboxRow } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KeyHint } from "@/components/pp/key-hint";
import { ERROR_ID, HELP_ID, StepError, StepHeading, TITLE_ID } from "./step-chrome";

export const AUTO_ADVANCE_MS = 220;

type Value = string | string[];

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

/**
 * One question. Single choice: rows with number shortcuts that confirm, then
 * advance after a beat. Multi-select: rows + Continue. Text: autofocus, Enter
 * continues (Shift+Enter for a new line).
 */
export function QuestionStep({
  question,
  value,
  onChange,
  onChoose,
  onContinue,
  error,
}: {
  question: QuestionDefinition;
  value: Value;
  onChange: (value: Value) => void;
  /** Single choice picked by click, tap, Enter, Space or number key: confirm, then advance. */
  onChoose: (value: string) => void;
  onContinue: () => void;
  error: string | null;
}) {
  const rowsRef = useRef<HTMLDivElement>(null);
  const describedBy = [HELP_ID, error ? ERROR_ID : null].filter(Boolean).join(" ");
  // Arrow keys move between radio rows (and select, per the radio pattern) without advancing.
  const lastKeyWasArrow = useRef(false);

  // Focus the selected row, or the first, when a choice step opens.
  useEffect(() => {
    if (question.type === "text") return;
    const rows = rowsRef.current?.querySelectorAll<HTMLElement>("[data-slot=radio-group-row],[data-slot=checkbox-row]");
    const selected = rowsRef.current?.querySelector<HTMLElement>("[data-checked]");
    (selected ?? rows?.[0])?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Number keys pick options while not typing.
  useEffect(() => {
    if (question.type === "text") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      if (question.type === "single-select" && question.choices?.[n - 1]) {
        e.preventDefault();
        onChoose(question.choices[n - 1].value);
      }
      if (question.type === "multi-select" && question.options?.[n - 1]) {
        e.preventDefault();
        toggle(question.options[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selected = Array.isArray(value) ? value : [];
  const atMax = !!question.maxSelections && selected.length >= question.maxSelections;

  function toggle(option: string) {
    const isOn = selected.includes(option);
    if (!isOn && atMax) return;
    onChange(isOn ? selected.filter((v) => v !== option) : [...selected, option]);
  }

  function onTextKey(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    if (e.currentTarget.tagName === "TEXTAREA" && e.shiftKey) return; // new line
    e.preventDefault();
    onContinue();
  }

  return (
    <div>
      <StepHeading title={question.label} help={question.description} />

      <div className="mt-8" ref={rowsRef}>
        {question.type === "single-select" && question.choices && (
          <RadioGroup
            value={typeof value === "string" ? value : ""}
            aria-labelledby={TITLE_ID}
            aria-describedby={describedBy}
            onKeyDownCapture={(e) => {
              lastKeyWasArrow.current = e.key.startsWith("Arrow");
            }}
            onPointerDownCapture={() => {
              lastKeyWasArrow.current = false;
            }}
            onValueChange={(v) => {
              if (lastKeyWasArrow.current) onChange(String(v));
              else onChoose(String(v));
            }}
          >
            {question.choices.map((choice, i) => (
              <RadioGroupRow
                key={choice.value}
                value={choice.value}
                hint={<KeyHint>{i + 1}</KeyHint>}
                // Re-picking the current answer doesn't change the value, so confirm it here.
                onClick={() => value === choice.value && onChoose(choice.value)}
                onKeyDown={(e) => {
                  // Enter confirms the focused row (Space already selects it).
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onChoose(choice.value);
                  }
                }}
              >
                {value === choice.value ? (
                  <motion.span layoutId={`answer-${question.id}`} className="inline-block">
                    {choice.label}
                  </motion.span>
                ) : (
                  choice.label
                )}
              </RadioGroupRow>
            ))}
          </RadioGroup>
        )}

        {question.type === "multi-select" && question.options && (
          <div role="group" aria-labelledby={TITLE_ID} aria-describedby={describedBy} className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option, i) => {
              const isOn = selected.includes(option);
              return (
                <CheckboxRow
                  key={option}
                  checked={isOn}
                  // Not `disabled`: a disabled row would drop keyboard focus. toggle() ignores it instead.
                  aria-disabled={!isOn && atMax ? true : undefined}
                  className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:border-contour aria-disabled:hover:bg-sheet"
                  onCheckedChange={() => toggle(option)}
                  hint={i < 9 ? <KeyHint>{i + 1}</KeyHint> : undefined}
                  onKeyDown={(e) => {
                    // Enter continues; Space toggles.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onContinue();
                    }
                  }}
                >
                  {option}
                </CheckboxRow>
              );
            })}
          </div>
        )}
        {question.type === "multi-select" && question.maxSelections && (
          <p aria-live="polite" className="mt-3 text-sm text-ink-muted">
            <span className="font-mono text-ink">{selected.length}</span> of {question.maxSelections} chosen
            {atMax && ". Unselect one to swap it."}
          </p>
        )}

        {question.type === "text" &&
          (question.multiline ? (
            <Textarea
              autoFocus
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onTextKey}
              placeholder={question.placeholder}
              aria-labelledby={TITLE_ID}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              className="min-h-36"
            />
          ) : (
            <Input
              autoFocus
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onTextKey}
              placeholder={question.placeholder}
              aria-labelledby={TITLE_ID}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
            />
          ))}
        {question.type === "text" && question.multiline && (
          <p className="mt-2 hidden text-sm text-ink-muted md:block">
            <KeyHint>Shift ↵</KeyHint> for a new line
          </p>
        )}
      </div>

      <StepError message={error} />
    </div>
  );
}
