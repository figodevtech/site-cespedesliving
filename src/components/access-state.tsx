import { ButtonLink } from "./ui";
export function AccessState({ owner = false }: { owner?: boolean }) {
  return (
    <div className="container section-sm">
      <div className="empty-state">
        <h2>
          {owner ? "Sua gestão, em um só lugar." : "Seu espaço de viagem."}
        </h2>
        <p className="muted">
          {owner
            ? "O acesso à área do proprietário será disponibilizado por nossa equipe."
            : "O acesso à conta ainda não está disponível. Para informações sobre uma hospedagem, fale com nossa equipe."}
        </p>
        <ButtonLink href="/contato">Fale com a gente</ButtonLink>
      </div>
    </div>
  );
}
