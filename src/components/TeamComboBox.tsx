import { useEffect, useMemo, useRef, useState } from "react";

import type { ChangeEvent, FocusEvent } from "react";

import type { OpponentOption } from "../api/opponentComparisonService";

type Props = {
  items: OpponentOption[];
  value: OpponentOption | null;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: OpponentOption | null) => void;
};

export default function TeamComboBox({
  items,
  value,
  placeholder = "Введите территорию или команду",
  disabled = false,
  onChange,
}: Props) {
  const [inputValue, setInputValue] = useState(value?.label ?? "");

  const [open, setOpen] = useState(false);

  const firstOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setInputValue(value?.label ?? "");
  }, [value]);

const filteredItems = useMemo(() => {
  const filter = inputValue.trim().toLocaleLowerCase("ru-RU");

  const result = !filter
    ? items
    : items.filter(item =>
        item.label.toLocaleLowerCase("ru-RU").includes(filter)
      );

  return result;
}, [items, inputValue]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setOpen(true);

    if (value !== null) {
      onChange(null);
    }
  };

  const handleSelect = (item: OpponentOption) => {
    setInputValue(item.label);
    onChange(item);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null);
    setOpen(true);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    const nextElement = event.relatedTarget as Node | null;
    const comboBox = event.currentTarget.closest(".team-combobox");

    if (nextElement !== null && comboBox?.contains(nextElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="team-combobox">
      <div className="team-combobox__input-wrapper">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleInputBlur}
          onKeyDown={(event) => {
            if (
              (event.key === "ArrowDown" || event.key === "Tab") &&
              open &&
              filteredItems.length > 0
            ) {
              event.preventDefault();
              firstOptionRef.current?.focus();
              return;
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />

        {inputValue && !disabled && (
          <button
            type="button"
            className="team-combobox__clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            aria-label="Очистить"
          >
            ×
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="team-combobox__dropdown">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                ref={index === 0 ? firstOptionRef : undefined}
                key={`${item.type}-${item.id}-${index}`}
                type="button"
                className={
                  item.type === "territory"
                    ? "team-combobox__option team-combobox__option--city"
                    : "team-combobox__option team-combobox__option--team"
                }
                onClick={() => handleSelect(item)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();

                    const nextButton = event.currentTarget
                      .nextElementSibling as HTMLButtonElement | null;

                    nextButton?.focus();
                    return;
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();

                    const previousButton = event.currentTarget
                      .previousElementSibling as HTMLButtonElement | null;

                    previousButton?.focus();
                    return;
                  }

                  if (event.key === "Escape") {
                    setOpen(false);
                  }
                }}
              >
                {item.label}
              </button>
            ))
          ) : (
            <div className="team-combobox__empty">Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}
