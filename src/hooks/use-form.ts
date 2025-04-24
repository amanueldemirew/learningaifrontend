import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm as useReactHookForm,
  FieldValues,
  UseFormProps,
  UseFormReturn,
  SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

interface UseFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema?: z.ZodType<T>;
  onSubmitSuccess?: (data: T) => void;
  onSubmitError?: (error: Error) => void;
  showToast?: boolean;
}

export function useForm<T extends FieldValues>(
  {
    schema,
    onSubmitSuccess,
    onSubmitError,
    showToast = true,
    ...options
  }: UseFormOptions<T> = {} as UseFormOptions<T>
): UseFormReturn<T> & { isSubmitting: boolean } {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useReactHookForm<T>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const handleSubmit = useCallback(
    (onSubmit: SubmitHandler<T>) => {
      return form.handleSubmit(async (data: T) => {
        try {
          setIsSubmitting(true);
          await onSubmit(data);

          if (onSubmitSuccess) {
            onSubmitSuccess(data);
          }

          if (showToast) {
            toast.success("Form submitted successfully");
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          if (onSubmitError) {
            onSubmitError(err);
          }

          if (showToast) {
            toast.error(err.message || "Form submission failed");
          }
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [form, onSubmitSuccess, onSubmitError, showToast]
  );

  return {
    ...form,
    handleSubmit,
    isSubmitting,
  };
}

// Helper function to create a form schema
export function createFormSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

// Helper function to create a form field
export function createFormField<T extends z.ZodTypeAny>(
  schema: T,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
  } = {}
): T {
  // Handle string validation
  if (schema instanceof z.ZodString) {
    const stringSchema = z.string();
    const validations: Array<{
      validate: (val: string) => boolean;
      message: string;
    }> = [];

    if (options.minLength !== undefined) {
      validations.push({
        validate: (val: string) => val.length >= options.minLength!,
        message: `Must be at least ${options.minLength} characters`,
      });
    }
    if (options.maxLength !== undefined) {
      validations.push({
        validate: (val: string) => val.length <= options.maxLength!,
        message: `Must be at most ${options.maxLength} characters`,
      });
    }
    if (options.pattern) {
      validations.push({
        validate: (val: string) => options.pattern!.test(val),
        message: "Invalid format",
      });
    }
    if (options.email) {
      validations.push({
        validate: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        message: "Invalid email address",
      });
    }
    if (options.url) {
      validations.push({
        validate: (val: string) => /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(val),
        message: "Invalid URL",
      });
    }
    if (options.required) {
      validations.push({
        validate: (val: string) => val.length > 0,
        message: "This field is required",
      });
    }

    // Use superRefine to apply all validations at once
    return stringSchema.superRefine((val, ctx) => {
      for (const validation of validations) {
        if (!validation.validate(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: validation.message,
          });
          break; // Stop after first error
        }
      }
    }) as unknown as T;
  }

  // Handle number validation
  if (schema instanceof z.ZodNumber) {
    const numberSchema = z.number();
    const validations: Array<{
      validate: (val: number) => boolean;
      message: string;
    }> = [];

    if (options.min !== undefined) {
      validations.push({
        validate: (val: number) => val >= options.min!,
        message: `Must be at least ${options.min}`,
      });
    }
    if (options.max !== undefined) {
      validations.push({
        validate: (val: number) => val <= options.max!,
        message: `Must be at most ${options.max}`,
      });
    }
    if (options.required) {
      validations.push({
        validate: (val: number) => val !== undefined && val !== null,
        message: "This field is required",
      });
    }

    // Use superRefine to apply all validations at once
    return numberSchema.superRefine((val, ctx) => {
      for (const validation of validations) {
        if (!validation.validate(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: validation.message,
          });
          break; // Stop after first error
        }
      }
    }) as unknown as T;
  }

  // For other types, just handle required validation
  if (options.required) {
    return schema.superRefine((val, ctx) => {
      if (val === undefined || val === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This field is required",
        });
      }
    }) as unknown as T;
  }

  return schema;
}
