import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface PricingFormState {
  name: string;
  isFree: boolean;
  priceDollars: string;
}

interface PricingFormFieldsProps {
  form: PricingFormState;
  onChange: (patch: Partial<PricingFormState>) => void;
  namePlaceholder?: string;
}

export const PricingFormFields: React.FC<PricingFormFieldsProps> = ({
  form,
  onChange,
  namePlaceholder = "Module name",
}) => (
  <div className="space-y-3">
    <input
      type="text"
      value={form.name}
      onChange={(e) => onChange({ name: e.target.value })}
      className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
      placeholder={namePlaceholder}
      aria-label="Name"
      autoFocus
    />
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
        <input
          type="checkbox"
          checked={form.isFree}
          onChange={(e) => onChange({ isFree: e.target.checked })}
          className="rounded border-border"
        />
        Free access
      </label>
      {!form.isFree && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceDollars}
            onChange={(e) => onChange({ priceDollars: e.target.value })}
            className="w-24 rounded-md border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
            aria-label="Price in dollars"
          />
        </div>
      )}
    </div>
  </div>
);

export function pricingFormToPayload(form: PricingFormState) {
  return {
    name: form.name.trim(),
    is_free: form.isFree,
    price_cents: Math.round(parseFloat(form.priceDollars || "0") * 100),
  };
}

export function moduleToPricingForm(mod: { name: string; is_free: boolean; price_cents: number }): PricingFormState {
  return {
    name: mod.name,
    isFree: mod.is_free,
    priceDollars: String(mod.price_cents / 100),
  };
}

interface ModuleRowMetaProps {
  isFree: boolean;
  priceCents: number;
  subjectsCount: number;
}

export const ModuleRowMeta: React.FC<ModuleRowMetaProps> = ({ isFree, priceCents, subjectsCount }) => (
  <span className="text-[11px] text-muted-foreground font-medium block mt-0.5">
    {subjectsCount} {subjectsCount === 1 ? "subject" : "subjects"}
    {!isFree && ` · ${formatCurrency(priceCents)}`}
    {isFree && " · Free"}
  </span>
);

export const PricingFormOverlay: React.FC<{
  title: string;
  form: PricingFormState;
  onChange: (patch: Partial<PricingFormState>) => void;
  onSave: () => void;
  onCancel: () => void;
  namePlaceholder?: string;
}> = ({ title, form, onChange, onSave, onCancel, namePlaceholder }) => (
  <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm p-4 flex flex-col border-b">
    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">{title}</h4>
    <PricingFormFields form={form} onChange={onChange} namePlaceholder={namePlaceholder} />
    <div className="flex gap-2 mt-4">
      <button
        onClick={onSave}
        className="flex-1 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/95"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-1.5 rounded-md border text-xs font-semibold hover:bg-accent"
      >
        Cancel
      </button>
    </div>
  </div>
);

export const emptyPricingForm = (): PricingFormState => ({ name: "", isFree: true, priceDollars: "0" });
