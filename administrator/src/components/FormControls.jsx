import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { inputClass } from "./UI";

function optionList(children) {
  const options = [];

  function visit(nodes) {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;

      if (node.type === Fragment) {
        visit(node.props.children);
        return;
      }

      if (node.type === "option") {
        options.push({
          value: String(node.props.value ?? node.props.children ?? ""),
          label: node.props.children,
          disabled: Boolean(node.props.disabled),
        });
        return;
      }

      visit(node.props.children);
    });
  }

  visit(children);
  return options;
}

export function Select({
  children,
  className = inputClass,
  value,
  onChange,
  disabled = false,
  name,
  "aria-label": ariaLabel,
  required = false,
}) {
  const options = optionList(children);
  const currentValue = String(value ?? "");
  const selected = options.find((option) => option.value === currentValue);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const rootRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    const closeWhenClickingOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    return () =>
      document.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, []);

  function openMenu() {
    const selectedIndex = options.findIndex(
      (option) => option.value === currentValue,
    );
    setHighlightedIndex(Math.max(0, selectedIndex));
    setOpen(true);
  }

  function choose(option) {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value, name } });
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }

      const direction = event.key === "ArrowDown" ? 1 : -1;
      let next = highlightedIndex;
      do {
        next = (next + direction + options.length) % options.length;
      } while (options[next]?.disabled && next !== highlightedIndex);
      setHighlightedIndex(next);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) openMenu();
      else if (options[highlightedIndex]) choose(options[highlightedIndex]);
    }

    if (event.key === "Escape") setOpen(false);
  }

  const rootClassName = className.includes("lg:ml-auto")
    ? "relative lg:ml-auto"
    : "relative";

  return (
    <div ref={rootRef} className={rootClassName}>
      <button
        type="button"
        name={name}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-required={required}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`${className} relative cursor-pointer appearance-none pr-10 text-left disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={selected?.value ? "text-ink" : "text-muted"}>
          {selected?.label ?? "Select an option"}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={17}
          strokeWidth={1.8}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform duration-200 ${open ? "rotate-180 text-primary" : "rotate-0"}`}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-[80] max-h-64 min-w-max overflow-y-auto rounded-sm border border-line bg-white p-1.5 shadow-xl shadow-slate-900/10"
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              role="option"
              aria-selected={option.value === currentValue}
              disabled={option.disabled}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => choose(option)}
              className={`flex w-full items-center justify-between gap-4 rounded-sm px-3 py-2 text-left text-sm transition disabled:opacity-40 ${index === highlightedIndex ? "bg-blue-50 text-primary" : "text-ink hover:bg-slate-50"}`}
            >
              <span className="whitespace-nowrap">{option.label}</span>
              {option.value === currentValue && (
                <Check size={15} strokeWidth={2} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CalendarInput({ className = inputClass, ...props }) {
  const inputRef = useRef(null);

  function openCalendar() {
    inputRef.current?.focus();
    inputRef.current?.showPicker?.();
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={`${className} themed-calendar-input pr-10`}
        {...props}
      />
      <button
        type="button"
        onClick={openCalendar}
        aria-label="Open calendar"
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-muted transition hover:bg-blue-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <CalendarDays size={17} strokeWidth={1.8} />
      </button>
    </div>
  );
}
