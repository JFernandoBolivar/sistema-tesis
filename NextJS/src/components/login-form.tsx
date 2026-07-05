"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/lib/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { loginAction } from "#/actions/auth-actions";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Fingerprint, IdentificationCard } from "@phosphor-icons/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identification: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(values);
      if (response?.error) {
        setError(response.error);
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-4", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="identification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cedula de Identidad</FormLabel>
              <FormControl>
                <div className="relative">
                  <IdentificationCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    weight="duotone"
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="00000000"
                    className="pl-10 h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contrasena</FormLabel>
              <FormControl>
                <div className="relative">
                  <Fingerprint
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    weight="duotone"
                  />
                  <Input
                    type="password"
                    placeholder="Tu contrasena"
                    className="pl-10 h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full mt-1"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4 text-primary-foreground" />
              Verificando...
            </span>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>
    </Form>
  );
}
