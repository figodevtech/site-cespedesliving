"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type Props = {
  id?: string;
  /** Nome no formulário: o valor segue num campo oculto, como no select nativo. */
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Texto quando nada está escolhido (o valor fica vazio). */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * Select do site, no lugar do nativo (padrão "select-only combobox" do WAI-ARIA): o botão
 * mostra a opção escolhida e abre a lista; setas, Home/End, Enter, Esc e digitar a letra
 * funcionam como no nativo.
 */
export function Select({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  required,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? (placeholder ? "" : (options[0]?.value ?? "")));
  const raw = controlled ? value : internal;
  // Como no nativo: valor que não está nas opções vale a primeira (sem placeholder).
  const selected = options.find((option) => option.value === raw) ?? (placeholder === undefined ? options[0] : undefined);
  const current = selected?.value ?? raw;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();

  const show = () => {
    if (disabled || !options.length) return;
    setActive(Math.max(0, options.findIndex((option) => option.value === current)));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    if (!controlled) setInternal(option.value);
    if (option.value !== current) onChange?.(option.value);
    close();
  };

  // Lista logo abaixo do botão (ou acima, sem espaço), da largura dele.
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const wanted = Math.min(300, options.length * 44 + 12);
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const up = below < Math.min(wanted, 180) && above > below;
      const maxHeight = Math.max(120, Math.min(wanted, up ? above : below));
      const width = Math.max(rect.width, 200);
      setPlace({
        top: up ? rect.top - maxHeight - 6 : rect.bottom + 6,
        left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
        width,
        maxHeight,
      });
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!list.current?.contains(target) && !trigger.current?.contains(target)) close(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  /** Digitar letras pula para a opção que começa com elas (como no nativo). */
  const typeAhead = (key: string) => {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + key.toLocaleLowerCase("pt-BR"), at: now };
    const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
    const index = options.findIndex((option) => normalize(option.label).startsWith(normalize(typed.current.text)));
    if (index >= 0) {
      setActive(index);
      if (!open && !controlled) setInternal(options[index].value);
      if (!open && options[index].value !== current) onChange?.(options[index].value);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const keys: Record<string, () => void> = open
      ? {
          ArrowDown: () => setActive((i) => Math.min(last, i + 1)),
          ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
          Home: () => setActive(0),
          End: () => setActive(last),
          PageDown: () => setActive((i) => Math.min(last, i + 8)),
          PageUp: () => setActive((i) => Math.max(0, i - 8)),
          Enter: () => choose(active),
          " ": () => choose(active),
          Escape: () => close(),
          Tab: () => close(false),
        }
      : { ArrowDown: show, ArrowUp: show, Enter: show, " ": show };
    if (keys[event.key]) {
      if (event.key !== "Tab") event.preventDefault();
      keys[event.key]();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeAhead(event.key);
    }
  };

  return (
    <div className="select">
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        data-value={current}
        disabled={disabled}
        className={`select-trigger ${selected ? "" : "is-empty"}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onKeyDown}
      >
        <span>{selected?.label ?? placeholder ?? ""}</span>
        <ChevronDown size={16} aria-hidden className="select-chevron" />
      </button>
      {/* Valor real do formulário e da validação (required), com o nome do select antigo. */}
      <input
        className="select-value"
        name={name}
        value={current}
        required={required}
        tabIndex={-1}
        aria-hidden
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault();
          show();
          trigger.current?.focus();
        }}
      />
      {open
        ? createPortal(
            <ul
              ref={list}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              className="select-list"
              style={place ? { top: place.top, left: place.left, width: place.width, maxHeight: place.maxHeight } : undefined}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={option.value === current}
                  className={`select-option ${index === active ? "is-active" : ""} ${option.value === current ? "is-selected" : ""}`}
                  onPointerMove={() => setActive(index)}
                  // pointerdown + preventDefault: o foco fica no botão e a escolha não depende do blur.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => choose(index)}
                >
                  <span>{option.label}</span>
                  {option.value === current ? <Check size={15} aria-hidden /> : null}
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
