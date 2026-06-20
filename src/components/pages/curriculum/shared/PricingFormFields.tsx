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
  <div className="space-y-4">
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
      <input
        type="text"
        value={form.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
        placeholder={namePlaceholder}
        aria-label="Name"
        autoFocus
      />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Pricing & Access</label>
      <div className="flex items-center gap-4 bg-muted/30 p-2.5 rounded-lg border border-border/40">
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground select-none">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => onChange({ isFree: e.target.checked })}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Free access
        </label>
        {!form.isFree && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-muted-foreground font-semibold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.priceDollars}
              onChange={(e) => onChange({ priceDollars: e.target.value })}
              className="w-24 rounded-md border border-border bg-background px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              aria-label="Price in dollars"
            />
          </div>
        )}
      </div>
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
  <div className="absolute inset-0 z-20 bg-background/98 backdrop-blur-md p-6 flex flex-col justify-center items-center">
    <div className="w-full max-w-sm bg-card border border-border/80 rounded-xl p-5 shadow-elevated space-y-4">
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Configure item information and access pricing.</p>
      </div>
      
      <div className="border-t border-border/60 pt-3">
        <PricingFormFields form={form} onChange={onChange} namePlaceholder={namePlaceholder} />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/95 transition duration-200 cursor-pointer shadow-sm"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-accent text-foreground transition duration-200 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export const emptyPricingForm = (): PricingFormState => ({ name: "", isFree: true, priceDollars: "0" });
