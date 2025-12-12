import { useState, useRef, useEffect } from 'react';
import '../App.css';

export interface CuteSelectOption {
  label: string;
  value: string;
}

interface CuteSelectProps {
  value: string;
  options: (string | CuteSelectOption)[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CuteSelect({ value, options, onChange, disabled = false }: CuteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to objects
  const normalizedOptions: CuteSelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || 'Select...';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div 
      className={`cute-select-container ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`} 
      ref={containerRef}
    >
      <button
        type="button"
        className="cute-select-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="current-value">{displayLabel}</span>
        <span className="arrow">▼</span>
      </button>

      {isOpen && (
        <div className="cute-select-menu">
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`cute-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}