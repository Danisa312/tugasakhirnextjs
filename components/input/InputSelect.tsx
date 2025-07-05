// components/InputSelect.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input, Text, useTheme } from "@nextui-org/react";
import { useTheme as useNextTheme } from "next-themes";
import debounce from "lodash.debounce";

interface Option {
  id: string | number;
  label: string;
}

type InputSelectProps = {
  options?: Option[];
  onSearch?: (query: string) => Promise<Option[]>;
  selectedId: string | number | null;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  label?: string;
};

const InputSelect: React.FC<InputSelectProps> = ({
  options = [],
  onSearch,
  selectedId,
  onChange,
  placeholder = "Pilih...",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // NextUI theme hooks
  const { theme } = useTheme();
  const { theme: nextTheme } = useNextTheme();

  // Refs untuk menangani click outside
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cari opsi berdasarkan input
  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!onSearch) return;

      setIsLoading(true);
      try {
        const results = await onSearch(query);
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching:", err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [onSearch]
  );

  // Update input dan trigger pencarian
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!isOpen) {
      setIsOpen(true);
    }

    if (onSearch) {
      handleSearch(value);
    }
  };

  // Handle focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Handle blur dengan delay untuk menghindari race condition
  const handleInputBlur = (e: React.FocusEvent) => {
    // Cek apakah focus pindah ke dalam dropdown
    setTimeout(() => {
      if (
        containerRef.current &&
        !containerRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false);
      }
    }, 150);
  };

  // Pilih opsi
  const handleOptionClick = (option: Option) => {
    setInputValue(option.label);
    onChange(option);
    setIsOpen(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Tampilkan label dari ID terpilih
  useEffect(() => {
    if (selectedId !== null) {
      const allOptions = onSearch ? [...searchResults, ...options] : options;
      const selected = allOptions.find((opt) => opt.id === selectedId);
      if (selected) {
        setInputValue(selected.label);
      }
    } else {
      if (!isOpen) {
        // Jangan clear saat sedang typing
        setInputValue("");
      }
    }
  }, [selectedId, options]);

  // Initialize search results with static options
  useEffect(() => {
    if (onSearch && options.length > 0) {
      setSearchResults(options);
    }
  }, [options, onSearch]);

  useEffect(() => {
    if(onSearch) onSearch("")
  }, [])

  const displayOptions = onSearch ? searchResults : options;

  // Dynamic theme colors
  const isDark = nextTheme === "dark";
  const dropdownStyles = {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: "200px",
    overflowY: "auto" as const,
    zIndex: 1000,
    marginTop: "4px",
    backgroundColor: isDark
      ? theme?.colors?.backgroundContrast?.value || "#18181b"
      : theme?.colors?.background?.value || "#ffffff",
    border: `1px solid ${
      isDark
        ? theme?.colors?.border?.value || "#27272a"
        : theme?.colors?.border?.value || "#e4e4e7"
    }`,
    borderRadius: theme?.radii?.lg?.value || "8px",
    boxShadow: isDark
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const optionBaseStyle = {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s ease",
    color: isDark
      ? theme?.colors?.text?.value || "#fafafa"
      : theme?.colors?.text?.value || "#09090b",
    borderBottom: `1px solid ${
      isDark
        ? theme?.colors?.border?.value || "#27272a"
        : theme?.colors?.border?.value || "#f4f4f5"
    }`,
  };

  const getOptionStyle = (isSelected: boolean, isHovered: boolean = false) => ({
    ...optionBaseStyle,
    backgroundColor: isSelected
      ? (isDark
          ? theme?.colors?.primary?.value || "#006fee"
          : theme?.colors?.primary?.value || "#006fee") + "20"
      : isHovered
      ? isDark
        ? theme?.colors?.backgroundContrast?.value || "#27272a"
        : theme?.colors?.gray100?.value || "#f4f4f5"
      : "transparent",
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <label htmlFor="input-select-field" style={{ display: 'block', marginBottom: 4 }}>
          <Text size="$sm" css={{ mb: "$4" }}>
            {label}
          </Text>
        </label>
      )}

      <Input
        id="input-select-field"
        bordered
        fullWidth
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange as any}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        aria-label={label ? undefined : placeholder}
        aria-labelledby={label ? 'input-select-field-label' : undefined}
        contentRight={
          isLoading ? (
            <Text size="$sm" color="default">
              Loading...
            </Text>
          ) : (
            <div
              style={{
                cursor: "pointer",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                color: isDark
                  ? theme?.colors?.text?.value || "#a1a1aa"
                  : theme?.colors?.text?.value || "#71717a",
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          )
        }
      />

      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyles}>
          {displayOptions.length === 0 ? (
            <div
              style={{
                padding: "12px 16px",
                color: isDark
                  ? theme?.colors?.accents6?.value || "#71717a"
                  : theme?.colors?.accents6?.value || "#71717a",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {isLoading ? "Mencari..." : "Tidak ada hasil"}
            </div>
          ) : (
            displayOptions.map((option) => (
              <DropdownOption
                key={option.id}
                option={option}
                isSelected={selectedId === option.id}
                onClick={handleOptionClick}
                theme={theme}
                isDark={isDark}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Separate component untuk dropdown option
const DropdownOption: React.FC<{
  option: Option;
  isSelected: boolean;
  onClick: (option: Option) => void;
  theme: any;
  isDark: boolean;
}> = ({ option, isSelected, onClick, theme, isDark }) => {
  const [isHovered, setIsHovered] = useState(false);

  const optionBaseStyle = {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s ease",
    color: isDark
      ? theme?.colors?.text?.value || "#fafafa"
      : theme?.colors?.text?.value || "#09090b",
    borderBottom: `1px solid ${
      isDark
        ? theme?.colors?.border?.value || "#27272a"
        : theme?.colors?.border?.value || "#f4f4f5"
    }`,
  };

  const getOptionStyle = (isSelected: boolean, isHovered: boolean = false) => ({
    ...optionBaseStyle,
    backgroundColor: isSelected
      ? (isDark
          ? theme?.colors?.primary?.value || "#006fee"
          : theme?.colors?.primary?.value || "#006fee") + "20"
      : isHovered
      ? isDark
        ? theme?.colors?.backgroundContrast?.value || "#27272a"
        : theme?.colors?.gray100?.value || "#f4f4f5"
      : "transparent",
  });

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent blur event
        onClick(option);
      }}
      style={getOptionStyle(isSelected, isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {option.label}
    </div>
  );
};

export default InputSelect;