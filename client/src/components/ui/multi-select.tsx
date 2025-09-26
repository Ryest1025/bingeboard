"use client"

import * as React from "react"
import { ChevronDown, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface MultiSelectProps {
  /** Available options to select from */
  options: string[]
  /** Currently selected values */
  value?: string[]
  /** Callback when selection changes */
  onValueChange?: (value: string[]) => void
  /** Placeholder text when nothing is selected */
  placeholder?: string
  /** Label for accessibility */
  label?: string
  /** Disabled state */
  disabled?: boolean
  /** Maximum height of dropdown */
  maxHeight?: string
  /** Custom className for the trigger */
  className?: string
  /** Show clear all button */
  showClearAll?: boolean
  /** Enable search/filter functionality */
  searchable?: boolean
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(({
  options = [],
  value = [],
  onValueChange,
  placeholder = "Select options...",
  label,
  disabled = false,
  maxHeight = "300px",
  className,
  showClearAll = true,
  searchable = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  
  // Combine refs
  React.useImperativeHandle(ref, () => triggerRef.current!)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm, searchable])

  // Handle selection toggle
  const toggleOption = React.useCallback((option: string) => {
    if (disabled) return
    
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option]
    
    onValueChange?.(newValue)
  }, [value, onValueChange, disabled])

  // Clear all selections
  const clearAll = React.useCallback(() => {
    if (disabled) return
    onValueChange?.([])
  }, [onValueChange, disabled])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          toggleOption(filteredOptions[focusedIndex])
        }
        break
      
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        triggerRef.current?.focus()
        break
        
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
        }
        break
        
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
        }
        break
        
      case 'Tab':
        if (isOpen) {
          setIsOpen(false)
          setFocusedIndex(-1)
        }
        break
    }
  }, [isOpen, focusedIndex, filteredOptions, toggleOption, disabled])

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setFocusedIndex(-1)
    }
  }, [isOpen])

  // Display value for trigger
  const displayValue = React.useMemo(() => {
    if (value.length === 0) return placeholder
    if (value.length === 1) return value[0]
    return `${value.length} selected`
  }, [value, placeholder])

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors",
          className
        )}
        {...props}
      >
        <span className={cn(
          "truncate text-left",
          value.length === 0 && "text-muted-foreground text-slate-400"
        )}>
          {displayValue}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md",
            "bg-slate-800 border-slate-700 text-white animate-in fade-in-0 zoom-in-95"
          )}
          style={{ maxHeight }}
          role="listbox"
          aria-label={label}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-slate-700">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          {/* Clear All Button */}
          {showClearAll && value.length > 0 && (
            <div className="p-2 border-b border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="h-3 w-3 mr-2" />
                Clear all ({value.length})
              </Button>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-slate-400">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option)
                const isFocused = index === focusedIndex
                
                return (
                  <div
                    key={option}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm transition-colors",
                      "hover:bg-slate-700 hover:text-white",
                      isFocused && "bg-slate-700 text-white",
                      isSelected && "text-blue-400"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 border border-slate-500 rounded-sm",
                      isSelected && "bg-blue-500 border-blue-500"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="truncate">{option}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
})

MultiSelect.displayName = "MultiSelect"