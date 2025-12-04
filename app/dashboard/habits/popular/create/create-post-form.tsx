"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";

import Button from "@/app/components/ui/button";
import PageGradient from "@/app/components/ui/page-gradient";
import PageHeading from "@/app/components/page-heading";
import { useUnsavedChangesGuard } from "@/app/hooks/use-unsaved-changes-guard";

import {
  Category,
  Commitment,
  TimeWindow,
  categories,
  commitmentCopy,
} from "../types";

interface HabitOption {
  id: string;
  name: string;
  description: string | null;
  cadence: string;
}

interface CreatePopularPostFormProps {
  habits: HabitOption[];
}

const dropdownSelectWrapperClassName =
  "relative overflow-visible rounded-2xl border border-gray-100 bg-gradient-to-br from-white/95 to-white/70 shadow-inner transition-colors hover:border-primary/50 focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-0";

const fieldButtonClassName =
  "w-full flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 xl:text-xs 2xl:text-sm font-medium text-foreground shadow-inner transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0";

const inputControlClassName =
  "w-full border-none bg-transparent px-4 py-3 xl:text-xs 2xl:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none text-left";

const textareaControlClassName = `${inputControlClassName} resize-none leading-relaxed`;

const sanitizeDropdownValue = (value: string) =>
  value.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();

const updateDropdownDirection = (
  toggleRef: React.RefObject<HTMLButtonElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
  setDirection: React.Dispatch<React.SetStateAction<"down" | "up">>
) => {
  if (typeof window === "undefined") {
    return;
  }
  const toggleRect = toggleRef.current?.getBoundingClientRect();
  if (!toggleRect) {
    return;
  }
  const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 0;
  const spacing = 8;
  const spaceBelow = window.innerHeight - toggleRect.bottom;
  const spaceAbove = toggleRect.top;
  if (spaceBelow >= panelHeight + spacing) {
    setDirection("down");
  } else if (spaceAbove >= panelHeight + spacing) {
    setDirection("up");
  } else {
    setDirection("down");
  }
};

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label: string;
  displayValue?: string;
  helper?: string;
  value: string;
  options: DropdownOption[];
  optionsId: string;
  onSelect: (value: string) => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  displayValue,
  helper,
  value,
  options,
  optionsId,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        panelRef.current?.contains(target) ||
        toggleRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    const update = () =>
      updateDropdownDirection(toggleRef, panelRef, setDirection);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  const optionLabel =
    displayValue ??
    options.find((option) => option.value === value)?.label ??
    "Select an option";

  const activeOptionId = value
    ? `${optionsId}-option-${sanitizeDropdownValue(value)}`
    : undefined;

  return (
    <div className="space-y-2">
      <label className="xl:text-sm font-semibold">{label}</label>
      <div className={dropdownSelectWrapperClassName}>
        <button
          type="button"
          ref={toggleRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={optionsId}
          onClick={() => setOpen((prev) => !prev)}
          className={fieldButtonClassName}
        >
          <span className="truncate">{optionLabel}</span>
          <ChevronDown
            className={`xl:h-3 xl:w-3 2xl:h-4 2xl:w-4 transition-transform ${
              open ? "rotate-180 text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
        {open && (
          <div
            ref={panelRef}
            id={optionsId}
            role="listbox"
            aria-activedescendant={activeOptionId}
            className={`absolute left-0 z-20 max-h-56 min-w-full w-max overflow-y-scroll rounded-2xl border border-gray-100 bg-white shadow-lg flex flex-col ${
              direction === "down" ? "top-full mt-2" : "bottom-full mb-2"
            }`}
          >
            {options.map((option) => {
              const optionId = `${optionsId}-option-${sanitizeDropdownValue(
                option.value
              )}`;
              const isSelected = option.value === value;
              return (
                <button
                  key={optionId}
                  id={optionId}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                  className={`w-full block rounded-none border-b border-gray-100 px-4 py-3 text-left xl:text-xs 2xl:text-sm transition last:border-b-0 last:rounded-b-2xl ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-primary/5"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
};

const habitDropdownOptionsId = "popular-post-habit-dropdown-options";
const categoryDropdownOptionsId = "popular-post-category-dropdown-options";
const timeWindowDropdownOptionsId = "popular-post-time-window-dropdown-options";
const commitmentDropdownOptionsId = "popular-post-commitment-dropdown-options";

const commitmentOptions: Commitment[] = ["Quick", "Standard", "Deep"];
const timeWindowOptions: { value: TimeWindow; label: string }[] = [
  { value: "Anytime", label: "Anytime" },
  { value: "Morning", label: "Morning" },
  { value: "Workday", label: "Workday" },
  { value: "Evening", label: "Evening" },
];

type ListField = "benefits" | "steps" | "guardrails";

const buildFormState = (habits: HabitOption[]) => ({
  habitId: habits[0]?.id ?? "",
  title: "",
  summary: "",
  highlight: "",
  anchor: "",
  duration: "",
  cadence: habits[0]?.cadence ?? "Daily",
  category: categories[0],
  timeWindow: timeWindowOptions[0]?.value ?? "Anytime",
  commitment: "Standard" as Commitment,
  benefits: [] as string[],
  steps: [] as string[],
  guardrails: [] as string[],
});

const CreatePopularPostForm: React.FC<CreatePopularPostFormProps> = ({
  habits,
}) => {
  const [form, setForm] = useState(buildFormState(habits));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const selectedHabit = habits.find((habit) => habit.id === form.habitId);
  const [benefitInput, setBenefitInput] = useState("");
  const [stepInput, setStepInput] = useState("");
  const [guardrailInput, setGuardrailInput] = useState("");

  const addListEntry = (field: ListField, rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return;
    }
    setForm((current) => {
      const existing = current[field];
      const isDuplicate = existing.some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        return current;
      }
      markDirty();
      return {
        ...current,
        [field]: [...existing, trimmed],
      };
    });
  };

  const handleListInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    field: ListField
  ) => {
    const rawValue = event.target.value;
    markDirty();
    if (!rawValue.includes(",")) {
      setInput(rawValue);
      return;
    }
    const parts = rawValue.split(",");
    const remainder = parts.pop() ?? "";
    parts.forEach((part) => addListEntry(field, part));
    setInput(remainder.trimStart());
  };

  const handleListInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    field: ListField
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addListEntry(field, value);
      setInput("");
    }
  };

  const handleRemoveListEntry = (field: ListField, value: string) => {
    markDirty();
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((item) => item !== value),
    }));
  };

  useEffect(() => {
    if (!selectedHabit) {
      return;
    }
    setForm((current) => ({
      ...current,
      cadence: selectedHabit.cadence ?? current.cadence,
    }));
  }, [selectedHabit?.cadence, selectedHabit?.id]);

  const handleChange =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      markDirty();
    };

  const submitPost = useCallback(
    async ({ skipRedirect = false } = {}) => {
      if (!form.habitId) {
        setServerError("Choose a habit to anchor this post.");
        return false;
      }
      setServerError(null);
      try {
        const payload = {
          ...form,
          benefits: form.benefits.join("\n"),
          steps: form.steps.join("\n"),
          guardrails: form.guardrails.join("\n"),
        };
        const response = await fetch("/api/habits/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to create post.");
        }
        setIsDirty(false);
        if (!skipRedirect) {
          router.push("/dashboard/habits/popular");
        }
        return true;
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Unable to create post."
        );
        return false;
      }
    },
    [form, router]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(() => {
      void submitPost();
    });
  };

  const handleGuardSave = useCallback(
    () => submitPost({ skipRedirect: true }),
    [submitPost]
  );
  const handleGuardDiscard = useCallback(() => {
    setIsDirty(false);
  }, []);
  const { guardDialog } = useUnsavedChangesGuard({
    isDirty,
    onSave: handleGuardSave,
    onDiscard: handleGuardDiscard,
  });

  return (
    <>
      {guardDialog}
      <main className="relative overflow-hidden w-full min-h-screen xl:pt-24 2xl:pt-28 text-foreground xl:pb-12 2xl:pb-16 bg-linear-to-tr from-white/90 via-light-yellow/55 to-green-soft/15">
        <PageGradient />
        <div className="relative z-10 xl:px-8 2xl:px-28 space-y-8">
          <PageHeading
            badgeLabel="Create a post"
            title="Share a habit you love"
            titleClassName="xl:text-xl 2xl:text-2xl md:text-3xl"
            description="Pick one of your habits, fill in the missing storytelling bits, and share the playbook with the crew."
            actions={
              <Link
                href="/dashboard/habits/popular"
                className="xl:text-xs 2xl:text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Back to popular habits
              </Link>
            }
          />

          <div className="xl:max-w-5xl 2xl:max-w-6xl">
            {habits.length === 0 ? (
              <div className="rounded-3xl border border-gray-100 bg-white shadow-inner px-6 py-8 space-y-3 text-sm text-muted-foreground">
                <p>
                  You'll need to create a habit before you can publish a post.
                </p>
                <Link
                  href="/dashboard/habits/create"
                  className="font-semibold text-primary hover:underline"
                >
                  Create a habit first
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-3xl border border-gray-100 bg-white shadow-inner px-6 py-6 space-y-6">
                  <DropdownField
                    label="Habit to share"
                    options={habits.map((habit) => ({
                      value: habit.id,
                      label: habit.name,
                    }))}
                    displayValue={
                      selectedHabit?.name ?? habits[0]?.name ?? "Choose a habit"
                    }
                    value={form.habitId}
                    optionsId={habitDropdownOptionsId}
                    onSelect={(value) => {
                      markDirty();
                      setForm((current) => ({ ...current, habitId: value }));
                    }}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Description</label>
                    {selectedHabit?.description ? (
                      <p className="text-xs text-muted-foreground">
                        {selectedHabit.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Post title</label>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={form.title}
                        onChange={handleChange("title")}
                        placeholder="e.g. Sunrise energy loop"
                        className={inputControlClassName}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Why it matters
                    </label>
                    <div className={dropdownSelectWrapperClassName}>
                      <textarea
                        value={form.summary}
                        onChange={handleChange("summary")}
                        rows={3}
                        placeholder="Share what keeps you showing up."
                        className={textareaControlClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Highlight</label>
                      <div className={dropdownSelectWrapperClassName}>
                        <input
                          value={form.highlight}
                          onChange={handleChange("highlight")}
                          placeholder="What gets your teammates curious?"
                          className={inputControlClassName}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Anchor</label>
                      <div className={dropdownSelectWrapperClassName}>
                        <input
                          value={form.anchor}
                          onChange={handleChange("anchor")}
                          placeholder="Pair it with a trigger, e.g. after lunch"
                          className={inputControlClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Duration</label>
                      <div className={dropdownSelectWrapperClassName}>
                        <input
                          value={form.duration}
                          onChange={handleChange("duration")}
                          placeholder="e.g. 12 minutes"
                          className={inputControlClassName}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Cadence</label>
                      <div className={dropdownSelectWrapperClassName}>
                        <input
                          value={form.cadence}
                          placeholder="Daily / Weekly"
                          className={`${inputControlClassName} cursor-not-allowed`}
                          readOnly
                          aria-readonly="true"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pulled from the selected habit and locked in for this
                        post.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <DropdownField
                      label="Category"
                      options={categories.map((category) => ({
                        value: category,
                        label: category,
                      }))}
                      value={form.category}
                      optionsId={categoryDropdownOptionsId}
                      onSelect={(value) => {
                        markDirty();
                        setForm((current) => ({
                          ...current,
                          category: value as Category,
                        }));
                      }}
                    />
                    <DropdownField
                      label="Time window"
                      options={timeWindowOptions}
                      value={form.timeWindow}
                      optionsId={timeWindowDropdownOptionsId}
                      onSelect={(value) => {
                        markDirty();
                        setForm((current) => ({
                          ...current,
                          timeWindow: value as TimeWindow,
                        }));
                      }}
                    />
                    <DropdownField
                      label="Commitment"
                      helper={commitmentCopy[form.commitment]}
                      options={commitmentOptions.map((option) => ({
                        value: option,
                        label: option,
                      }))}
                      displayValue={form.commitment}
                      value={form.commitment}
                      optionsId={commitmentDropdownOptionsId}
                      onSelect={(value) => {
                        markDirty();
                        setForm((current) => ({
                          ...current,
                          commitment: value as Commitment,
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Why it works
                    </label>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={benefitInput}
                        onChange={(event) =>
                          handleListInputChange(
                            event,
                            setBenefitInput,
                            "benefits"
                          )
                        }
                        onKeyDown={(event) =>
                          handleListInputKeyDown(
                            event,
                            benefitInput,
                            setBenefitInput,
                            "benefits"
                          )
                        }
                        placeholder="Type a benefit and press Enter"
                        className={inputControlClassName}
                      />
                      {form.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2 m-2">
                          {form.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {benefit}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveListEntry("benefits", benefit)
                                }
                                className="ml-1.5 focus:outline-none hover:text-red-500 transition-colors"
                                aria-label={`Remove benefit ${benefit}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      List each reason on its own line.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Steps</label>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={stepInput}
                        onChange={(event) =>
                          handleListInputChange(event, setStepInput, "steps")
                        }
                        onKeyDown={(event) =>
                          handleListInputKeyDown(
                            event,
                            stepInput,
                            setStepInput,
                            "steps"
                          )
                        }
                        placeholder="Type a step and press Enter"
                        className={inputControlClassName}
                      />
                      {form.steps.length > 0 && (
                        <div className="flex flex-wrap gap-2 m-2">
                          {form.steps.map((step) => (
                            <span
                              key={step}
                              className="flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {step}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveListEntry("steps", step)
                                }
                                className="ml-1.5 focus:outline-none hover:text-red-500 transition-colors"
                                aria-label={`Remove step ${step}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Short, actionable steps keep it repeatable.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Guardrails</label>
                    <div className={dropdownSelectWrapperClassName}>
                      <input
                        value={guardrailInput}
                        onChange={(event) =>
                          handleListInputChange(
                            event,
                            setGuardrailInput,
                            "guardrails"
                          )
                        }
                        onKeyDown={(event) =>
                          handleListInputKeyDown(
                            event,
                            guardrailInput,
                            setGuardrailInput,
                            "guardrails"
                          )
                        }
                        placeholder="Type a guardrail and press Enter"
                        className={inputControlClassName}
                      />
                      {form.guardrails.length > 0 && (
                        <div className="flex flex-wrap gap-2 m-2">
                          {form.guardrails.map((guardrail) => (
                            <span
                              key={guardrail}
                              className="flex items-center text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {guardrail}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveListEntry("guardrails", guardrail)
                                }
                                className="ml-1.5 focus:outline-none hover:text-red-500 transition-colors"
                                aria-label={`Remove guardrail ${guardrail}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share hard boundaries or conditions that protect the
                      habit.
                    </p>
                  </div>

                  {serverError ? (
                    <div className="rounded-2xl border border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                      {serverError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.habitId}
                      className="xl:h-10 2xl:h-12 xl:px-5 2xl:px-7 xl:text-sm 2xl:text-base bg-primary text-white shadow-sm hover:brightness-105 transition disabled:cursor-not-allowed disabled:brightness-90"
                    >
                      {isSubmitting ? "Sharing post..." : "Share this habit"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CreatePopularPostForm;
