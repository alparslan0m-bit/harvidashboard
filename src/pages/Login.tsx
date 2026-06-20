import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";

const loginSchema = zod.object({
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setSubmitting(true);
    const result = await signIn(data.email, data.password);
    setSubmitting(false);

    if (result.success) {
      toast.success("Welcome, Super Admin");
      navigate("/");
    } else {
      toast.error(result.error || "Authentication failed.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Vercel Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 bg-vercel-mesh opacity-60 mix-blend-multiply dark:mix-blend-screen" />

      <div className="relative z-10 w-full max-w-md rounded-[12px] border border-border/10 bg-primary p-8 shadow-elevated">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-primary-foreground">Harvi Admin Gate</h1>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Authorized admin credentials required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 outline-none transition focus:border-primary-foreground focus:ring-1 focus:ring-primary-foreground"
              placeholder="admin@harvi.com"
              aria-label="Email Address"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full rounded-md border border-primary-foreground/20 bg-primary-foreground/5 pl-3 pr-10 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 outline-none transition focus:border-primary-foreground focus:ring-1 focus:ring-primary-foreground"
                placeholder="••••••••"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 hover:text-primary-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-full bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
