import { getUser } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown;
};

type ActionResult<T> = Promise<T>;

type ActionWithFormData<T> = (
  prevState: unknown,
  formData: FormData
) => ActionResult<T>;

type ActionWithData<T, D> = (data: D, formData: FormData) => ActionResult<T>;

type ActionWithUserFunction<T, D> = (
  data: D,
  formData: FormData,
  user: User
) => ActionResult<T>;

export function validatedAction<T, D>(
  schema: z.ZodType<D>,
  action: ActionWithData<T, D>
): ActionWithFormData<T> {
  return async (prevState: unknown, formData: FormData) => {
    if (!formData || typeof formData.entries !== "function") {
      return { error: "Invalid form data" } as T;
    }

    const obj = Object.fromEntries(formData.entries());
    const result = schema.safeParse(obj);

    if (!result.success) {
      const error = result.error.errors[0]?.message ?? "Invalid data";
      return { error } as T;
    }

    return action(result.data, formData);
  };
}

export function validatedActionWithUser<T, D>(
  schema: z.ZodType<D>,
  action: ActionWithUserFunction<T, D>
): ActionWithFormData<T> {
  return async (prevState: unknown, formData: FormData) => {
    if (!formData || typeof formData.entries !== "function") {
      return { error: "Invalid form data" } as T;
    }

    const user = await getUser();
    if (!user) {
      redirect("/sign-in");
    }

    const obj = Object.fromEntries(formData.entries());
    const result = schema.safeParse(obj);

    if (!result.success) {
      const error = result.error.errors[0]?.message ?? "Invalid data";
      return { error } as T;
    }

    return action(result.data, formData, user);
  };
}
