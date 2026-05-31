import { notFound } from "next/navigation";
import RegistratieForm from "./registratie-form";
import { validateToken } from "./actions";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function RegistrerenPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-lg">
        <p className="text-2xl mb-2">🔒</p>
        <h2 className="font-semibold text-lg mb-1">Uitnodiging vereist</h2>
        <p className="text-sm text-muted-foreground">
          Je hebt een uitnodigingslink nodig om een account aan te maken.
          Neem contact op met de beheerder.
        </p>
      </div>
    );
  }

  const invitation = await validateToken(token);

  if (!invitation) {
    return (
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-lg">
        <p className="text-2xl mb-2">⚠️</p>
        <h2 className="font-semibold text-lg mb-1">Uitnodiging verlopen</h2>
        <p className="text-sm text-muted-foreground">
          Deze uitnodigingslink is verlopen of al gebruikt.
          Vraag de beheerder om een nieuwe uitnodiging.
        </p>
      </div>
    );
  }

  return <RegistratieForm email={invitation.email} token={token} />;
}
