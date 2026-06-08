import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";
import type { QuestionFormValues } from "@/schemas/questionFormSchema";

interface QuestionFormImageFieldProps {
  register: UseFormRegister<QuestionFormValues>;
  errors: FieldErrors<QuestionFormValues>;
  watchImageUrl?: string;
}

export function QuestionFormImageField({
  register,
  errors,
  watchImageUrl,
}: QuestionFormImageFieldProps) {
  const isFormValid = watchImageUrl && watchImageUrl.startsWith("http");

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Image URL (Optional)</span>
        </label>
        <input
          type="text"
          {...register("image_url")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
          placeholder="https://example.com/murmur.png"
        />
        {errors.image_url && (
          <p className="text-[10px] text-red-500">{errors.image_url.message}</p>
        )}
      </div>

      {isFormValid && (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-2">Live Image Preview</p>
          <img
            src={watchImageUrl}
            alt="Question diagram"
            className="max-h-36 mx-auto rounded object-contain border bg-background"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
