import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Wrench,
  ChartNoAxesCombined,
  Eye,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { contentPages, faq, type ContentPage } from "@/data/content";
import { PageHero, ButtonLink, Photo, Notice } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { contactLink, contactPhoneLabel } from "@/lib/contact";
export function generateStaticParams() {
  return Object.keys(contentPages).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const data = contentPages[(await params).page as ContentPage];
  return {
    title: data?.eyebrow ?? "Página não encontrada",
    description: data?.description,
  };
}
export default async function ContentRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const page = (await params).page as ContentPage;
  const data = contentPages[page];
  if (!data) notFound();
  return (
    <>
      <PageHero {...data} />
      {page === "sobre" ? (
        <>
          <section className="section">
            <div className="container split">
              <div className="photo-frame about-photo">
                <Photo
                  src="/images/hospitality-v2.webp"
                  alt="Detalhe de cama preparada e café — imagem ilustrativa"
                  priority
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <span className="image-label">Imagem ilustrativa</span>
              </div>
              <div>
                <p className="eyebrow gold-text">O JEITO CESPEDES DE RECEBER</p>
                <h2>
                  Estar bem.
                  <br />
                  Sentir-se em casa.
                </h2>
                <p className="section-lead">
                  A Cespedes Living Hospedagens nasce da proposta de unir
                  conforto para quem viaja e tranquilidade para quem confia a
                  gestão de seu flat.
                </p>
                <p className="muted">
                  Em João Pessoa e região, nosso conceito é aproximar
                  hospitalidade e cuidado com o patrimônio: espaços acolhedores,
                  atendimento próximo e uma operação acompanhada nos detalhes.
                </p>
                <ButtonLink href="/flats">
                  Encontre seu próximo lugar
                </ButtonLink>
              </div>
            </div>
          </section>
          <section className="section section-muted">
            <div className="container">
              <p className="eyebrow gold-text">NOSSA PROPOSTA</p>
              <h2>O que orienta cada escolha.</h2>
              <div className="info-grid">
                {[
                  [
                    HeartHandshake,
                    "Proximidade",
                    "Uma relação de cuidado com hóspedes e proprietários.",
                  ],
                  [
                    ShieldCheck,
                    "Confiança",
                    "Clareza nas informações e nos combinados de cada relação.",
                  ],
                  [
                    Eye,
                    "Atenção aos detalhes",
                    "Cuidado contínuo com a experiência e com o imóvel.",
                  ],
                ].map(([Icon, title, text], i) => {
                  const Component = Icon as typeof Eye;
                  return (
                    <article className="info-card" key={i}>
                      <Component />
                      <h3>{title as string}</h3>
                      <p>{text as string}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : page === "servicos" ? (
        <>
          <section className="section">
            <div className="container">
              <div className="info-grid">
                {[
                  [
                    CalendarDays,
                    "Reservas e apresentação",
                    "Organização dos anúncios e acompanhamento das solicitações, conforme os canais e condições contratados.",
                  ],
                  [
                    HeartHandshake,
                    "Atendimento ao hóspede",
                    "Orientações sobre chegada e estadia, com uma proposta de suporte próximo.",
                  ],
                  [
                    Sparkles,
                    "Limpeza e enxoval",
                    "Coordenação da preparação do flat entre estadias e acompanhamento do padrão de apresentação.",
                  ],
                  [
                    Wrench,
                    "Manutenção e conservação",
                    "Acompanhamento das necessidades do imóvel e coordenação dos serviços autorizados.",
                  ],
                  [
                    ChartNoAxesCombined,
                    "Acompanhamento financeiro",
                    "Visibilidade de receitas, despesas e repasses na futura área do proprietário.",
                  ],
                  [
                    Eye,
                    "Cuidado com o imóvel",
                    "Rotinas de acompanhamento para uma operação organizada e transparente.",
                  ],
                ].map(([Icon, title, text], i) => {
                  const Component = Icon as typeof Eye;
                  return (
                    <article className="info-card" key={i}>
                      <Component />
                      <h2 className="service-title">{title as string}</h2>
                      <p>{text as string}</p>
                    </article>
                  );
                })}
                <article className="service-cta">
                  <h2>
                    Cada imóvel,
                    <br />
                    uma possibilidade.
                  </h2>
                  <p>Conheça o escopo que faz sentido para seu flat.</p>
                  <ButtonLink href="/proprietarios">
                    Quero conhecer a gestão
                  </ButtonLink>
                </article>
              </div>
              <Notice>
                Serviços apresentados como proposta comercial. Disponibilidade,
                escopo e condições dependem de avaliação e contrato.
              </Notice>
            </div>
          </section>
        </>
      ) : page === "contato" ? (
        <section className="section">
          <div className="container split align-start">
            <div>
              <p className="eyebrow gold-text">POR ONDE COMEÇAMOS?</p>
              <h2>
                Uma estadia especial.
                <br />
                Uma parceria de confiança.
              </h2>
              <p className="section-lead">
                Escolha o caminho que combina com o seu momento.
              </p>
              <div className="contact-paths">
                <Link href="/flats">
                  Quero encontrar um flat <ArrowRight size={18} />
                </Link>
                <Link href="/proprietarios">
                  Quero conhecer a gestão <ArrowRight size={18} />
                </Link>
                <Link href="/perguntas-frequentes">
                  Tenho uma dúvida <ArrowRight size={18} />
                </Link>
              </div>
              <p className="contact-location">
                <MapPin size={19} />
                João Pessoa e região · Paraíba
              </p>
              <a
                className="button"
                href={
                  contactLink("Olá! Gostaria de falar com a Cespedes Living.")
                    ?.href
                }
              >
                WhatsApp · {contactPhoneLabel}
                <ArrowRight size={17} />
              </a>
            </div>
            <LeadForm contact />
          </div>
        </section>
      ) : page === "perguntas-frequentes" ? (
        <section className="section-sm">
          <div className="container faq-container">
            {faq.map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
            <div className="faq-cta">
              <h2>Vamos conversar?</h2>
              <p>Fale com nossa equipe pelo WhatsApp.</p>
              <ButtonLink href="/contato">Ir para contato</ButtonLink>
            </div>
          </div>
        </section>
      ) : (
        <section className="section-sm">
          <article className="container legal-copy">
            <Notice>
              Informações sobre o funcionamento do site. Os documentos jurídicos
              completos e as condições comerciais devem ser validados pela
              empresa.
            </Notice>
            {page === "politica-de-privacidade" ? (
              <>
                <h2>1. Preferências neste navegador</h2>
                <p>
                  Os flats que você marca como favoritos ficam guardados no
                  armazenamento local deste navegador. Senhas e tokens de
                  autenticação não são salvos nesse armazenamento.
                </p>
                <h2>2. Como os formulários funcionam</h2>
                <p>
                  Nome, CPF, e-mail e telefone são usados no cadastro e nas
                  reservas. A autenticação é processada pelo Supabase e a sessão
                  usa cookies. Reservas, interesses comerciais e solicitações de
                  visita são registrados no sistema de gestão. Formulários de
                  contato também podem preparar uma mensagem para o WhatsApp;
                  nesse canal você decide quando enviá-la.
                </p>
                <h2>3. Seu controle</h2>
                <p>
                  Você pode apagar os dados salvos em{" "}
                  <Link href="/favoritos">Favoritos</Link> ou nas configurações
                  do navegador. Para consultar ou corrigir dados cadastrais,
                  acesse Minha conta ou fale com a equipe.
                </p>
                <h2>4. Canais de atendimento</h2>
                <p>
                  Ao continuar no WhatsApp, você utiliza também um serviço
                  externo, sujeito às próprias condições de privacidade. Para
                  informações sobre seus dados, fale com a equipe pelo canal
                  informado em Contato.
                </p>
              </>
            ) : (
              <>
                <h2>1. Informações do site</h2>
                <p>
                  O site apresenta a Cespedes Living Hospedagens e sua proposta
                  de hospedagem e gestão de imóveis. Confirme as
                  características, tarifas e disponibilidade da acomodação com o
                  atendimento.
                </p>
                <h2>2. Consulta e confirmação</h2>
                <p>
                  A reserva de temporada é confirmada ao concluir o formulário
                  autenticado, após a validação de disponibilidade e preço no
                  sistema. O código e o status ficam em Minha conta. Preparar uma
                  mensagem, registrar interesse ou solicitar visita não confirma
                  uma contratação. Pagamento e cancelamento são tratados pelo
                  atendimento.
                </p>
                <h2>3. Imagens e informações</h2>
                <p>
                  As imagens de ambientação são geradas por IA e não substituem
                  fotos verificadas do imóvel. Solicite imagens atualizadas e
                  confirme os detalhes antes de reservar.
                </p>
                <h2>4. Condições da hospedagem</h2>
                <p>
                  Horários, regras de estadia, cancelamento, pagamentos e
                  condições de gestão são informados no atendimento e nos
                  documentos aplicáveis a cada contratação.
                </p>
              </>
            )}
            <p>
              Cespedes Living Hospedagens ·{" "}
              <Link href="/contato">Informações de contato</Link>
            </p>
          </article>
        </section>
      )}
    </>
  );
}
