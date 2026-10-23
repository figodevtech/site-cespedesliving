import type { Metadata } from "next";
import {
  ChartNoAxesCombined,
  ShieldCheck,
  HeartHandshake,
  KeyRound,
} from "lucide-react";
import { ButtonLink, Photo, Notice } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
export const metadata: Metadata = {
  title: "Para proprietários",
  description:
    "Conheça a proposta de gestão de flats da Cespedes Living: operação, atendimento e acompanhamento de resultados.",
};
export default function Page() {
  return (
    <>
      <section className="owner-hero">
        <Photo
          src="/images/altiplano/living.webp"
          alt="Flat executivo ilustrativo"
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="container">
          <p className="eyebrow gold-text">PARA PROPRIETÁRIOS</p>
          <h1>
            Seu imóvel
            <br />
            trabalhando
            <br />
            <em>por você.</em>
          </h1>
          <p>
            Mais cuidado com seu patrimônio.
            <br />
            Mais tranquilidade para sua rotina.
          </p>
          <ButtonLink href="#parceria">Conheça as possibilidades</ButtonLink>
          <span className="hero-caption">Imagem ilustrativa</span>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="heading-row">
            <div>
              <p className="eyebrow gold-text">GESTÃO COM PRESENÇA</p>
              <h2>
                Cuidamos dos detalhes.
                <br />
                Você acompanha os resultados.
              </h2>
            </div>
          </div>
          <div className="info-grid owner-benefits">
            {[
              [
                KeyRound,
                "Operação completa",
                "Coordenação de anúncios, reservas, limpeza e manutenção, conforme o escopo contratado.",
              ],
              [
                HeartHandshake,
                "Hospitalidade próxima",
                "Apoio ao hóspede e atenção aos detalhes que fazem diferença na experiência.",
              ],
              [
                ChartNoAxesCombined,
                "Resultados visíveis",
                "Uma proposta de acompanhamento de receitas, despesas e repasses com clareza.",
              ],
              [
                ShieldCheck,
                "Cuidado com seu patrimônio",
                "Rotinas de vistoria e conservação para uma operação bem acompanhada.",
              ],
            ].map(([Icon, title, text], i) => {
              const Component = Icon as typeof KeyRound;
              return (
                <article className="info-card" key={i}>
                  <Component size={28} />
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <p className="eyebrow gold-text">DO PRIMEIRO CONTATO À GESTÃO</p>
          <h2>Uma parceria, passo a passo.</h2>
          <div className="number-grid">
            {[
              [
                "Você apresenta seu imóvel",
                "Conte sobre a localização, a estrutura e seus objetivos.",
              ],
              [
                "Conhecemos as possibilidades",
                "Avaliamos juntos o perfil do imóvel e o escopo de gestão.",
              ],
              [
                "Preparamos a operação",
                "Organizamos a apresentação e as rotinas de hospitalidade.",
              ],
              [
                "Você acompanha",
                "Tenha visibilidade da operação e dos resultados do seu imóvel.",
              ],
            ].map(([t, p], i) => (
              <article className="number-step" key={t}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
          <div className="owner-dashboard-cta">
            <h3>Uma visão clara do seu patrimônio.</h3>
            <p>Explore a proposta visual do futuro portal do proprietário.</p>
            <ButtonLink href="/painel-proprietario" variant="outline">
              Área do proprietário
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="section" id="parceria">
        <div className="container split align-start">
          <div>
            <p className="eyebrow gold-text">VAMOS CONSTRUIR ESSA PARCERIA</p>
            <h2>
              Um novo capítulo
              <br />
              para seu flat.
            </h2>
            <p className="section-lead">
              Uma conversa é o primeiro passo para conhecer a gestão Cespedes
              Living e entender o que faz sentido para o seu imóvel.
            </p>
            <Notice>
              Esta fase apresenta a proposta comercial. Escopo, condições e
              resultados dependem de avaliação e contrato; não há promessa de
              rentabilidade.
            </Notice>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
