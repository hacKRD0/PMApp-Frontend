// SearchableDropdown.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

type SearchableDropdownProps<T> = {
  options: T[];
  value: any; // The type depends on the use case
  onChange: (value: any) => void;
  placeholder?: string;
  labelExtractor: (option: T) => string;
  valueExtractor: (option: T) => any;
  ariaLabel?: string;
  className?: string; // Optional prop for custom styling
};

const SearchableDropdown = <T extends unknown>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  labelExtractor,
  valueExtractor,
  ariaLabel,
  className = 'w-48', // Default width (Tailwind CSS class)
}: SearchableDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option: T) => {
    const extractedValue = valueExtractor(option);
    onChange(extractedValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    },
    [dropdownRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus the input when dropdown opens
      inputRef.current?.focus();
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const filteredOptions = options.filter((option) =>
    labelExtractor(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (
      highlightedIndex >= 0 &&
      highlightedIndex < filteredOptions.length &&
      listRef.current
    ) {
      const listItem = listRef.current.children[
        highlightedIndex
      ] as HTMLLIElement;
      listItem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, filteredOptions]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300 flex justify-between items-center bg-white"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || 'Toggle dropdown'}
        onKeyDown={handleKeyDown}
      >
        <span>
          {value
            ? options.find((opt) => valueExtractor(opt) === value)
              ? labelExtractor(
                  options.find((opt) => valueExtractor(opt) === value)!
                )
              : value
            : placeholder}
        </span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(-1);
            }}
            placeholder="Search..."
            className="w-full px-2 py-1 border-b focus:outline-none"
            aria-label="Search options"
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <ul
            className="max-h-60 overflow-y-auto"
            role="listbox"
            aria-label="Dropdown options"
            ref={listRef}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.slice(0, 100).map((option, index) => (
                <li
                  key={valueExtractor(option)}
                  onClick={() => handleOptionClick(option)}
                  className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${
                    valueExtractor(option) === value ? 'bg-blue-200' : ''
                  } ${index === highlightedIndex ? 'bg-blue-100' : ''}`}
                  role="option"
                  aria-selected={valueExtractor(option) === value}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {labelExtractor(option)}
                </li>
              ))
            ) : (
              <li className="px-2 py-1 text-gray-500">No options found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
