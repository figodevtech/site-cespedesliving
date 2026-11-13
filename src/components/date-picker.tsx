"use client";
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { addDays, today } from "@/domain/dates";

export type DatePickerHandle = { open: () => void };

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;
const monthOf = (value: string) => ({
  year: Number(value.slice(0, 4)),
  month: Number(value.slice(5, 7)) - 1,
});
const asDate = (value: string) => new Date(`${value}T12:00:00`);

/** "sex, 3 jan" (com o ano quando não é o atual). */
export function shortDateLabel(value: string) {
  const date = asDate(value);
  return date
    .toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(date.getFullYear() !== new Date().getFullYear()
        ? { year: "numeric" }
        : {}),
    })
    .replace(/\./g, "")
    .replace(/ de /g, " ")
    // Só a primeira letra maiúscula ("Qui, 5 nov"): mês e dia da semana seguem minúsculos.
    .replace(/^./, (first) => first.toLocaleUpperCase("pt-BR"));
}
const fullLabel = (value: string) =>
  asDate(value).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

type Props = {
  id: string;
  /** Nome no formulário: o valor segue em AAAA-MM-DD, como no campo nativo. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Dias que não podem ser escolhidos além de min/max (ex.: noites sem vaga). */
  isDateDisabled?: (value: string) => boolean;
  /** Período destacado no calendário (entrada → saída). */
  rangeStart?: string;
  rangeEnd?: string;
  /** No seletor de saída: o período acompanha o mouse até o dia apontado. */
  previewRange?: boolean;
  /** Marca um dia com ponto dourado; o texto vai para o leitor de tela e a dica. */
  markOf?: (value: string) => string | null;
  legend?: ReactNode;
  /** Abre o calendário por fora (ex.: a saída abre sozinha depois da entrada). */
  handleRef?: Ref<DatePickerHandle>;
  /** Depois de escolher um dia. */
  onPicked?: (value: string) => void;
};

/**
 * Seletor de data do site, no lugar do nativo: mesmo visual em todos os aparelhos, período
 * de estadia destacado e dias indisponíveis desativados. No celular vira um painel inferior.
 */
export function DatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  required,
  disabled,
  placeholder = "Selecionar data",
  isDateDisabled,
  rangeStart,
  rangeEnd,
  previewRange,
  markOf,
  legend,
  handleRef,
  onPicked,
}: Props) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = (controlled ? value : internal) || "";
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() =>
    monthOf(current || min || today()),
  );
  const [focused, setFocused] = useState(current || min || today());
  const [hover, setHover] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    sheet: boolean;
  } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popover = useRef<HTMLDivElement>(null);

  const blocked = (day: string) =>
    Boolean(
      (min && day < min) || (max && day > max) || isDateDisabled?.(day),
    );

  const show = () => {
    if (disabled) return;
    const start = current || (min && min > today() ? min : today());
    setView(monthOf(start));
    setFocused(start);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    setHover(null);
    if (refocus) trigger.current?.focus();
  };
  useImperativeHandle(handleRef, () => ({ open: show }));

  const pick = (day: string) => {
    if (blocked(day)) return;
    if (!controlled) setInternal(day);
    onChange?.(day);
    // O calendário fica aberto para conferir a data; fecha em "Concluir", Esc ou clique fora.
    onPicked?.(day);
  };

  // Posição: abaixo do campo (ou acima, sem espaço); em tela estreita, painel inferior.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      if (window.innerWidth < 560)
        return setPosition({ top: 0, left: 0, sheet: true });
      const width = 320,
        height = popover.current?.offsetHeight ?? 380;
      const below = rect.bottom + 8;
      const preferredTop =
        below + height > window.innerHeight && rect.top - height - 8 > 8
          ? rect.top - height - 8
          : below;
      const top = Math.max(8, Math.min(preferredTop, window.innerHeight - height - 8));
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8,
      );
      setPosition({ top, left, sheet: false });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Fecha ao clicar fora; o foco vai para o dia em destaque ao abrir e ao navegar.
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !popover.current?.contains(target) &&
        !trigger.current?.contains(target)
      )
        close(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    popover.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)
      ?.focus({ preventScroll: true });
  }, [open, focused, view]);

  const moveFocus = (days: number) => {
    const next = addDays(focused, days);
    setFocused(next);
    const target = monthOf(next);
    if (target.year !== view.year || target.month !== view.month)
      setView(target);
  };
  const shiftMonth = (step: number) => {
    const date = new Date(view.year, view.month + step, 1);
    setView({ year: date.getFullYear(), month: date.getMonth() });
  };

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const monthTitle = first
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    // "Novembro de 2026": maiúscula só no mês.
    .replace(/^./, (c) => c.toLocaleUpperCase("pt-BR"));
  const viewKey = `${view.year}-${pad(view.month + 1)}`;
  const prevDisabled = Boolean(min && viewKey <= min.slice(0, 7));
  const nextDisabled = Boolean(max && viewKey >= max.slice(0, 7));
  const end =
    previewRange && rangeStart && hover && hover > rangeStart
      ? hover
      : (rangeEnd ?? null);
  const todayValue = today();

  const calendar = (
    <div
      ref={popover}
      role="dialog"
      aria-modal={position?.sheet || undefined}
      aria-label="Escolher data"
      className={`date-popover ${position?.sheet ? "is-sheet" : ""}`}
      style={
        position && !position.sheet
          ? { top: position.top, left: position.left }
          : undefined
      }
      onKeyDown={(event) => {
        const keys: Record<string, () => void> = {
          ArrowLeft: () => moveFocus(-1),
          ArrowRight: () => moveFocus(1),
          ArrowUp: () => moveFocus(-7),
          ArrowDown: () => moveFocus(7),
          PageUp: () => moveFocus(-30),
          PageDown: () => moveFocus(30),
          Escape: () => close(),
        };
        if (event.key === "Enter" || event.key === " ") {
          const day = (event.target as HTMLElement).dataset.day;
          if (day) {
            event.preventDefault();
            pick(day);
          }
          return;
        }
        if (!keys[event.key]) return;
        event.preventDefault();
        keys[event.key]();
      }}
    >
      <div className="date-popover-head">
        <button
          type="button"
          className="date-nav"
          aria-label="Mês anterior"
          disabled={prevDisabled}
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <strong data-month={viewKey}>{monthTitle}</strong>
        <button
          type="button"
          className="date-nav"
          aria-label="Próximo mês"
          disabled={nextDisabled}
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight size={18} />
        </button>
        {position?.sheet ? (
          <button
            type="button"
            className="date-nav date-close"
            aria-label="Fechar"
            onClick={() => close()}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>
      <div className="date-grid" role="grid" aria-label={monthTitle}>
        {WEEKDAYS.map((day) => (
          <span key={day} className="date-weekday" aria-hidden>
            {day.slice(0, 1)}
          </span>
        ))}
        {Array.from({ length: first.getDay() }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = isoOf(view.year, view.month, i + 1);
          const off = blocked(day);
          const mark = markOf?.(day) ?? null;
          const inRange = Boolean(
            rangeStart && end && day > rangeStart && day < end,
          );
          const isEdge =
            day === current || (rangeStart && day === rangeStart) || day === end;
          return (
            <button
              key={day}
              type="button"
              data-day={day}
              tabIndex={day === focused ? 0 : -1}
              // aria-disabled (e não disabled): o dia continua focável e as setas passam por ele.
              aria-disabled={off || undefined}
              aria-pressed={day === current}
              aria-label={`${fullLabel(day)}${off ? ", indisponível" : ""}${mark ? `, ${mark}` : ""}`}
              title={mark ?? undefined}
              className={[
                "date-day",
                off && "is-off",
                inRange && "in-range",
                isEdge && "is-edge",
                day === current && "is-selected",
                day === todayValue && "is-today",
                mark && "has-mark",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => pick(day)}
              onMouseEnter={() => !off && setHover(day)}
              onFocus={() => setFocused(day)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="date-popover-foot">
        {legend ? <div className="date-legend">{legend}</div> : <span />}
        <div className="date-popover-actions">
          {!required && current ? (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                if (!controlled) setInternal("");
                onChange?.("");
              }}
            >
              Limpar
            </button>
          ) : null}
          <button type="button" className="button button-dark button-sm" onClick={() => close()}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="date-picker">
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`date-control date-trigger ${current ? "" : "is-empty"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-value={current}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            show();
          }
        }}
      >
        <CalendarDays size={17} aria-hidden />
        <span>{current ? shortDateLabel(current) : placeholder}</span>
      </button>
      {/* Valor real do formulário e da validação nativa (required): mesmo nome e formato do campo antigo. */}
      <input
        className="date-picker-value"
        name={name}
        value={current}
        required={required}
        tabIndex={-1}
        aria-hidden
        onChange={() => {}}
        // Enviar o formulário com a data obrigatória vazia abre o calendário.
        onInvalid={(event) => {
          event.preventDefault();
          show();
        }}
      />
      {open
        ? createPortal(
            <>
              {position?.sheet ? (
                <div className="date-backdrop" onClick={() => close()} />
              ) : null}
              {calendar}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

/* ───────────── Período (entrada → saída) num campo só ───────────── */

export type DateRange = { start: string; end: string };

type RangeProps = {
  id: string;
  /** Nomes no formulário: seguem dois valores AAAA-MM-DD, como os campos antigos. */
  startName?: string;
  endName?: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** "noites" (estadia: saída depois da entrada) ou "dias" (filtro: pode ser o mesmo dia). */
  unit?: "noites" | "dias";
  /** Dia que não pode ser o primeiro (ex.: noite sem vaga). */
  isStartDisabled?: (day: string) => boolean;
  /** Fim que não serve para este início (ex.: atravessaria um período ocupado). */
  isEndDisabled?: (start: string, day: string) => boolean;
  markOf?: (day: string) => string | null;
  legend?: ReactNode;
};

const shortNoWeekday = (value: string) => {
  const date = asDate(value);
  return date
    .toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      ...(date.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
    })
    .replace(/\./g, "")
    .replace(/ de /g, " ");
};
const countLabel = (start: string, end: string, unit: "noites" | "dias") => {
  const days = Math.round((asDate(end).getTime() - asDate(start).getTime()) / 86_400_000) + (unit === "dias" ? 1 : 0);
  return unit === "dias" ? `${days} ${days === 1 ? "dia" : "dias"}` : `${days} ${days === 1 ? "noite" : "noites"}`;
};

/**
 * Entrada e saída no mesmo campo: o 1º clique marca a entrada, o 2º a saída, com o período
 * acompanhando o mouse. Dois meses lado a lado no computador; um mês no celular (painel inferior).
 * Fechar com só a entrada escolhida desfaz a escolha incompleta.
 */
export function DateRangePicker({
  id,
  startName,
  endName,
  value,
  defaultValue,
  onChange,
  min,
  required,
  disabled,
  placeholder = "Escolha as datas",
  unit = "noites",
  isStartDisabled,
  isEndDisabled,
  markOf,
  legend,
}: RangeProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState<DateRange>(defaultValue ?? { start: "", end: "" });
  const current = controlled ? value : internal;
  const [open, setOpen] = useState(false);
  /** Entrada já clicada, esperando a saída (a escolha só vale quando as duas existem). */
  const [draft, setDraft] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState(() => monthOf(current.start || min || today()));
  const [focused, setFocused] = useState(current.start || min || today());
  const [layout, setLayout] = useState<{ top: number; left: number; mode: "double" | "single" | "sheet" } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popover = useRef<HTMLDivElement>(null);
  const sameDay = unit === "dias";

  const beforeMin = (day: string) => Boolean(min && day < min);
  const startBlocked = (day: string) => beforeMin(day) || Boolean(isStartDisabled?.(day));
  /** Saída que fecha o período com a entrada já clicada. */
  const endOk = (day: string) =>
    draft !== null &&
    (day > draft || (sameDay && day === draft)) &&
    !isEndDisabled?.(draft, day);
  /**
   * Na fase da saída, o dia que serve de fim fecha o período; os demais valem como nova entrada.
   * Ex.: entrada 13 e ocupado de 17 a 20: 20 não fecha o período, mas pode começar outro.
   */
  const blocked = (day: string) => !endOk(day) && startBlocked(day);

  const show = () => {
    if (disabled) return;
    const start = current.start || (min && min > today() ? min : today());
    setView(monthOf(start));
    setFocused(start);
    setDraft(null);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    setDraft(null);
    setHover(null);
    if (refocus) trigger.current?.focus();
  };
  const commit = (range: DateRange) => {
    if (!controlled) setInternal(range);
    onChange?.(range);
  };
  const pick = (day: string) => {
    if (blocked(day)) return;
    if (!draft || !endOk(day)) {
      setDraft(day);
      return;
    }
    // O calendário fica aberto para conferir o período; fecha em "Concluir", Esc ou clique fora.
    commit({ start: draft, end: day });
    setDraft(null);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      if (window.innerWidth < 560) return setLayout({ top: 0, left: 0, mode: "sheet" });
      const mode = window.innerWidth >= 720 ? "double" : "single";
      const width = mode === "double" ? 640 : 320;
      const height = popover.current?.offsetHeight ?? 420;
      const below = rect.bottom + 8;
      const preferredTop = below + height > window.innerHeight && rect.top - height - 8 > 8 ? rect.top - height - 8 : below;
      const top = Math.max(8, Math.min(preferredTop, window.innerHeight - height - 8));
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
      setLayout({ top, left, mode });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!popover.current?.contains(target) && !trigger.current?.contains(target)) close(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    popover.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus({ preventScroll: true });
  }, [open, focused, view]);

  const months = layout?.mode === "double" ? 2 : 1;
  const moveFocus = (days: number) => {
    const next = addDays(focused, days);
    setFocused(next);
    const target = monthOf(next);
    const offset = (target.year - view.year) * 12 + (target.month - view.month);
    // Saiu da vista: o mês do dia em foco entra pela esquerda (voltando) ou pela direita (avançando).
    if (offset < 0) setView(target);
    else if (offset >= months) {
      const left = new Date(target.year, target.month - (months - 1), 1);
      setView({ year: left.getFullYear(), month: left.getMonth() });
    }
  };
  const shiftMonth = (step: number) => {
    const date = new Date(view.year, view.month + step, 1);
    setView({ year: date.getFullYear(), month: date.getMonth() });
  };

  // Período mostrado: a escolha em andamento (com a prévia do mouse) ou o já confirmado.
  const shownStart = draft ?? current.start;
  // Dia que só reinicia o período não ganha prévia de saída.
  const shownEnd = draft ? (hover && endOk(hover) ? hover : null) : current.end;
  const todayValue = today();
  const viewKey = `${view.year}-${pad(view.month + 1)}`;
  const prevDisabled = Boolean(min && viewKey <= min.slice(0, 7));

  const renderMonth = (offset: number) => {
    const first = new Date(view.year, view.month + offset, 1);
    const year = first.getFullYear(),
      month = first.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const title = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toLocaleUpperCase("pt-BR"));
    return (
      <div className="date-month" key={`${year}-${month}`}>
        <strong className="date-month-title" data-month={`${year}-${pad(month + 1)}`}>
          {title}
        </strong>
        <div className="date-grid" role="grid" aria-label={title}>
          {WEEKDAYS.map((day) => (
            <span key={day} className="date-weekday" aria-hidden>
              {day.slice(0, 1)}
            </span>
          ))}
          {Array.from({ length: first.getDay() }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = isoOf(year, month, i + 1);
            const off = blocked(day);
            const mark = markOf?.(day) ?? null;
            const isStart = day === shownStart;
            const isEnd = Boolean(shownEnd && day === shownEnd);
            const inRange = Boolean(shownStart && shownEnd && day > shownStart && day < shownEnd);
            return (
              <button
                key={day}
                type="button"
                data-day={day}
                tabIndex={day === focused ? 0 : -1}
                aria-disabled={off || undefined}
                aria-pressed={isStart || isEnd}
                aria-label={`${fullLabel(day)}${isStart ? ", entrada" : ""}${isEnd ? ", saída" : ""}${off ? ", indisponível" : ""}${mark ? `, ${mark}` : ""}`}
                title={mark ?? undefined}
                className={[
                  "date-day",
                  off && "is-off",
                  inRange && "in-range",
                  (isStart || isEnd) && "is-edge",
                  isStart && shownEnd && "range-start",
                  isEnd && shownStart && shownStart !== shownEnd && "range-end",
                  day === todayValue && "is-today",
                  mark && "has-mark",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => pick(day)}
                onMouseEnter={() => setHover(day)}
                onFocus={() => setFocused(day)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const status = draft
    ? sameDay
      ? "Agora escolha o último dia."
      : "Agora escolha a data de saída."
    : current.start && current.end
      ? `${countLabel(current.start, current.end, unit)} · ${shortNoWeekday(current.start)} a ${shortNoWeekday(current.end)}`
      : sameDay
        ? "Escolha o primeiro dia."
        : "Escolha a data de entrada.";

  const calendar = (
    <div
      ref={popover}
      role="dialog"
      aria-modal={layout?.mode === "sheet" || undefined}
      aria-label="Escolher período"
      className={`date-popover is-range ${layout?.mode === "sheet" ? "is-sheet" : ""} ${months === 2 ? "is-double" : ""}`}
      style={layout && layout.mode !== "sheet" ? { top: layout.top, left: layout.left } : undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          const day = (event.target as HTMLElement).dataset.day;
          if (day) {
            event.preventDefault();
            pick(day);
          }
          return;
        }
        const keys: Record<string, () => void> = {
          ArrowLeft: () => moveFocus(-1),
          ArrowRight: () => moveFocus(1),
          ArrowUp: () => moveFocus(-7),
          ArrowDown: () => moveFocus(7),
          PageUp: () => moveFocus(-30),
          PageDown: () => moveFocus(30),
          Escape: () => close(),
        };
        if (!keys[event.key]) return;
        event.preventDefault();
        keys[event.key]();
      }}
    >
      <div className="date-range-nav">
        <button type="button" className="date-nav" aria-label="Mês anterior" disabled={prevDisabled} onClick={() => shiftMonth(-1)}>
          <ChevronLeft size={18} />
        </button>
        <p className="date-range-status" aria-live="polite">
          {status}
        </p>
        <button type="button" className="date-nav" aria-label="Próximo mês" onClick={() => shiftMonth(1)}>
          <ChevronRight size={18} />
        </button>
        {layout?.mode === "sheet" ? (
          <button type="button" className="date-nav date-close" aria-label="Fechar" onClick={() => close()}>
            <X size={18} />
          </button>
        ) : null}
      </div>
      <div className="date-months" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: months }, (_, i) => renderMonth(i))}
      </div>
      <div className="date-popover-foot">
        {legend ? <div className="date-legend">{legend}</div> : <span />}
        <div className="date-popover-actions">
          {!required && (current.start || current.end) ? (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setDraft(null);
                commit({ start: "", end: "" });
              }}
            >
              Limpar
            </button>
          ) : null}
          {/* Com a entrada clicada e sem saída, fechar descartaria a escolha: falta a saída. */}
          <button type="button" className="button button-dark button-sm" disabled={Boolean(draft)} onClick={() => close()}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="date-picker">
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`date-control date-trigger date-range-trigger ${current.start ? "" : "is-empty"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-start={current.start}
        data-end={current.end}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            show();
          }
        }}
      >
        <CalendarDays size={17} aria-hidden />
        {current.start ? (
          <span className="date-range-text">
            <span>{shortDateLabel(current.start)}</span>
            <ChevronRight size={14} aria-hidden className="date-range-arrow" />
            <span className={current.end ? "" : "date-range-missing"}>
              {current.end ? shortDateLabel(current.end) : sameDay ? "fim?" : "saída?"}
            </span>
            {current.end ? <em className="date-range-count">{countLabel(current.start, current.end, unit)}</em> : null}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
      </button>
      {/* Valores reais do formulário e da validação (required), com os nomes de antes. */}
      {[
        { name: startName, value: current.start },
        { name: endName, value: current.end },
      ].map((field, index) => (
        <input
          key={index}
          className="date-picker-value"
          name={field.name}
          value={field.value}
          required={required}
          tabIndex={-1}
          aria-hidden
          onChange={() => {}}
          onInvalid={(event) => {
            event.preventDefault();
            if (!open) show();
          }}
        />
      ))}
      {open
        ? createPortal(
            <>
              {layout?.mode === "sheet" ? <div className="date-backdrop" onClick={() => close()} /> : null}
              {calendar}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
