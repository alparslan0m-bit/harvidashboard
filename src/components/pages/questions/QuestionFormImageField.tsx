import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";
import type { QuestionFormValues } from "@/schemas/questionFormSchema";

interface QuestionFormImageFieldProps {
  register: UseFormRegister<QuestionFormValues>;
  errors: FieldErrors<QuestionFormValues>;
  watchImageUrl?: string;
  hidePreview?: boolean;
  hideLabel?: boolean;
}

export function QuestionFormImageField({
  register,
  errors,
  watchImageUrl,
  hidePreview,
  hideLabel,
}: QuestionFormImageFieldProps) {
  const isFormValid = watchImageUrl && watchImageUrl.startsWith("http");

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {!hideLabel && (
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Image URL (Optional)</span>
          </label>
        )}
        <input
          type="text"
          {...register("image_url")}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          placeholder="https://example.com/murmur.png"
        />
        {errors.image_url && (
          <p className="text-xs text-red-500">{errors.image_url.message}</p>
        )}
      </div>

      {isFormValid && !hidePreview && (
        <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/10 p-3 text-center transition-colors hover:bg-muted/20">
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <ImageIcon className="h-3 w-3" />
            Live Preview
          </p>
          <img
            src={watchImageUrl}
            alt="Question diagram"
            className="max-h-40 mx-auto rounded-lg shadow-sm object-contain border bg-background"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
