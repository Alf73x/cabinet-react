import { useEffect, useRef, useState } from "react";

import "./MultiSelectDropdown.css";

export type MultiSelectItem = {
  id: number;
  name: string;
};

type Props = {
  items: MultiSelectItem[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  allText?: string;
  disabled?: boolean;
};

export default function MultiSelectDropdown({
  items,
  selectedIds,
  onChange,
  allText = "Всего",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll(): void {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(items.map((item) => item.id));
    }
  }

  function toggleItem(id: number): void {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function getButtonText(): string {
    if (selectedIds.length === 0 || allSelected) {
      return allText;
    }

    return items
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => item.name)
      .join(", ");
  }
  
  return (
    <div className="multi-select" ref={rootRef}>
      <button
        type="button"
        className="multi-select-button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{getButtonText()}</span>
        <span className="multi-select-arrow">▾</span>
      </button>

      {open && !disabled && (
        <div className="multi-select-menu">
          <label className="multi-select-item multi-select-all">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />

            <span>{allText}</span>
          </label>

          <div className="multi-select-separator" />

          {items.map((item) => (
            <label key={item.id} className="multi-select-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleItem(item.id)}
              />

              <span>{item.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
