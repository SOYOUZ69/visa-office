import { useState, useRef, useEffect } from "react";

export const MultiSelect = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select services...",
}: {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedTagsRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className="multi-select-container">
      <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-content">
          {selectedValues.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <div className="selected-tags" ref={selectedTagsRef}>
              {selectedValues.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <span key={value} className="selected-tag">
                    {option?.label}
                    <button
                      type="button"
                      onClick={(e) => removeOption(value, e)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <span className="dropdown-arrow">▾</span>
        </div>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
          <div className="options-list">
            {filteredOptions.length === 0 ? (
              <div className="no-options">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <label key={option.value} className="option-item">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="checkmark"></span>
                  {option.label}
                </label>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .multi-select-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .multi-select-header {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          max-height: 100px;
          overflow-y: auto;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          min-height: 20px;
          gap: 8px;
        }

        .placeholder {
          color: #9ca3af;
          padding: 4px 0;
        }

        .selected-tags {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .selected-tag {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          background-color: #e5e7eb;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          width: calc(100% - 16px);
        }

        .remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #6b7280;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          padding: 0;
        }

        .remove-btn:hover {
          background-color: #d1d5db;
        }

        .dropdown-arrow {
          color: #6b7280;
          align-self: flex-end;
          margin-top: 4px;
        }

        .multi-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 10;
          max-height: 250px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .search-input {
          padding: 8px 12px;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          outline: none;
        }

        .options-list {
          overflow-y: auto;
          max-height: 200px;
        }

        .option-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
          position: relative;
        }

        .option-item:hover {
          background-color: #f3f4f6;
        }

        .option-item input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          position: relative;
          height: 18px;
          width: 18px;
          background-color: #fff;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .option-item input:checked ~ .checkmark {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .option-item input:checked ~ .checkmark:after {
          display: block;
          left: 6px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .no-options {
          padding: 12px;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};
