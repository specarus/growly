import { requireUserId } from "./habit-actions";

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export type ShouldDoPayload = {
  title: string;
  description: string | null;
  iconKey: string | null;
  iconColor: string | null;
};

export type ShouldDoUpdatePayload = {
  title?: string;
  description?: string | null;
  iconKey?: string | null;
  iconColor?: string | null;
};

export const parseShouldDoPayload = async (
  payload: Record<string, unknown>
): Promise<ShouldDoPayload> => {
  // Ensure the user is authenticated before parsing to simplify downstream logic.
  await requireUserId();

  const rawTitle = typeof payload.title === "string" ? payload.title.trim() : "";
  if (!rawTitle) {
    throw new Error("Title is required.");
  }

  return {
    title: rawTitle,
    description: toOptionalString(payload.description),
    iconKey: toOptionalString(payload.iconKey),
    iconColor: toOptionalString(payload.iconColor),
  };
};

export const parseShouldDoUpdate = async (
  payload: Record<string, unknown>
): Promise<ShouldDoUpdatePayload> => {
  // Parsing update payloads shares the same rules, but allow passing either field.
  await requireUserId();

  const titleValue =
    typeof payload.title === "string" ? payload.title.trim() : undefined;
  const descriptionValue = toOptionalString(payload.description);
  const iconKeyValue = toOptionalString(payload.iconKey);
  const iconColorValue = toOptionalString(payload.iconColor);

  if (
    titleValue === undefined &&
    payload.description === undefined &&
    descriptionValue === null &&
    payload.iconKey === undefined &&
    payload.iconColor === undefined
  ) {
    throw new Error("Nothing to update.");
  }

  const update: ShouldDoUpdatePayload = {};
  if (titleValue !== undefined) {
    if (!titleValue) {
      throw new Error("Title is required.");
    }
    update.title = titleValue;
  }
  if (payload.description !== undefined) {
    update.description = descriptionValue;
  }
  if (payload.iconKey !== undefined) {
    update.iconKey = iconKeyValue;
  }
  if (payload.iconColor !== undefined) {
    update.iconColor = iconColorValue;
  }

  return update;
};
