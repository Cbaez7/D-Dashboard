import Button from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import { Label } from "@/components/_ui/label";
import { signIn } from "./actions";
import Logo from "@/public/assets/images/_common/logo.svg";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="bg-card border-line-strong w-full max-w-sm rounded-2xl border p-8 shadow-overlay">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo aria-hidden className="size-10 overflow-visible" />
          <h1 className="text-[20px] font-semibold">BNG Desk</h1>
          <p className="caption-style text-subtle">
            Sign in to the dispatch console
          </p>
        </div>
        <LoginForm searchParams={searchParams} />
      </div>
    </main>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <form action={signIn} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p className="caption-style text-danger" role="alert">
          {error}
        </p>
      )}
      <Button variant="primary" size="md" type="submit" className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
