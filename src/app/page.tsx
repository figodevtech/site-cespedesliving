import {
  CalendarDays,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getFlats } from "@/services/flats";
import { FlatCard } from "@/components/flat-card";
import { ButtonLink, Photo } from "@/components/ui";
import { SearchForm } from "@/components/search-form";
import { isMock } from "@/services/adapter";
// Keep default travel dates current on every request.
export const dynamic = "force-dynamic";
export default async function Home() {
  const flats = await getFlats();
  return (
    <>
      <section className="hero">
        <Photo
          src="/images/hero.webp"
          alt="Sala sofisticada com materiais naturais e vista urbana costeira — imagem ilustrativa"
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="container">
          <div className="hero-copy">
            <p className="eyebrow gold-text">HOSPITALIDADE EM JOÃO PESSOA</p>
            <h1>
              Seu lugar para
              <br />
              viver <em>bons momentos.</em>
            </h1>
            <p>
              O conforto de se sentir em casa.
              <br />O cuidado de uma estadia especial.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/flats">Encontre seu flat</ButtonLink>
              <ButtonLink href="/proprietarios" variant="ghost">
                Sou proprietário
              </ButtonLink>
            </div>
            <span className="hero-caption">
              Conforto e cuidado para sua próxima estadia
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="container">
            <SearchForm />
          </div>
        </div>
      </section>
      <div className="feature-strip">
        <div className="container feature-grid">
          {[
            [CalendarDays, "Reservas com praticidade"],
            [HeartHandshake, "Atendimento acolhedor"],
            [Sparkles, "Cuidado em cada detalhe"],
            [ShieldCheck, "Gestão profissional"],
          ].map(([Icon, text], i) => {
            const Component = Icon as typeof CalendarDays;
            return (
              <div className="feature" key={i}>
                <Component size={25} aria-hidden="true" />
                <span>{text as string}</span>
              </div>
            );
          })}
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="heading-row">
            <div>
              <p className="eyebrow gold-text">ESCOLHAS PARA SUA VIAGEM</p>
              <h2>
                Encontre seu lugar
                <br />
                em João Pessoa.
              </h2>
              <p className="section-lead">
                Flats selecionados para desacelerar, descobrir
                <br className="desktop-break" /> e aproveitar a cidade no seu
                ritmo.
              </p>
            </div>
            <ButtonLink href="/flats" variant="outline">
              Ver todos os flats
            </ButtonLink>
          </div>
          {!flats.length && <p className="notice">Nenhum imóvel publicado neste momento. Fale com a equipe para consultar novas oportunidades.</p>}
          <div className="card-grid">
            {flats.slice(0, 3).map((f) => (
              <FlatCard flat={f} key={f.id} showPrices={!isMock()} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container split">
          <div className="split-image photo-frame">
            <Photo
              src="/images/lobby.webp"
              alt="Recepção de edifício com madeira e pedra natural — imagem ilustrativa"
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <span className="image-label">Imagem ilustrativa</span>
            <div className="floating-note">
              <strong>Bem-vindo.</strong>
              <span>
                O cuidado começa
                <br />
                antes da sua chegada.
              </span>
            </div>
          </div>
          <div>
            <p className="eyebrow gold-text">O JEITO CESPEDES DE RECEBER</p>
            <h2>
              Conforto, cuidado
              <br />e tranquilidade.
            </h2>
            <span className="line-title" />
            <p className="section-lead">
              Acreditamos que uma boa hospedagem está nos detalhes. Em um espaço
              acolhedor, no atendimento próximo e na liberdade de se sentir em
              casa.
            </p>
            <ul className="checks">
              {[
                "Ambientes pensados para sua rotina",
                "Apoio durante toda a hospedagem",
                "Localizações para aproveitar a cidade",
              ].map((t) => (
                <li key={t}>
                  <Check size={19} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href="/sobre" variant="dark">
              Conheça nossa proposta
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="owner-band">
        <Photo
          src="/images/altiplano/living.webp"
          alt="Flat ilustrativo com sala e cozinha integradas"
          sizes="100vw"
        />
        <div className="owner-shade" />
        <div className="container">
          <p className="eyebrow gold-text">PARA PROPRIETÁRIOS</p>
          <h2>
            Seu imóvel.
            <br />
            Novas possibilidades.
          </h2>
          <p>
            Da primeira reserva ao cuidado diário: uma gestão próxima,
            profissional e transparente para o seu flat.
          </p>
          <ButtonLink href="/proprietarios">Quero conhecer a gestão</ButtonLink>
        </div>
      </section>
      <section className="section">
        <div className="container location-editorial">
          <div>
            <p className="eyebrow gold-text">ENTRE O MAR E A CIDADE</p>
            <h2>
              João Pessoa
              <br />
              espera por você.
            </h2>
            <p className="section-lead">
              Manhãs na orla, sabores locais e tempo para viver com mais leveza.
              Encontre uma base acolhedora para sua próxima viagem.
            </p>
            <ButtonLink
              href="/flats?neighborhood=Cabo+Branco"
              variant="outline"
            >
              Explore o litoral
            </ButtonLink>
          </div>
          <div className="photo-frame city-photo">
            <Photo
              src="/images/coast.webp"
              alt="Litoral urbano paraibano — interpretação ilustrativa"
              sizes="(max-width: 700px) 100vw, 55vw"
            />
            <span className="image-label">Paisagem ilustrativa</span>
          </div>
        </div>
      </section>
    </>
  );
}
