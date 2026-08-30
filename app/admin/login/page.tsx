import LoginForm from "./LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-xl font-semibold text-neutral-900">
        Вход в админ-панель PRST Events
      </h1>
      <LoginForm redirectTo={from && from.startsWith("/admin") ? from : "/admin"} />
    </main>
  );
}
