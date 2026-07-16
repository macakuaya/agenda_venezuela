import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronDownIcon, LocationIcon } from './Icons'

interface Props {
  cities: string[]
  value: string
  allValue: string
  resultLabel: string
  onChange: (city: string) => void
}

export default function CityFilter({
  cities,
  value,
  allValue,
  resultLabel,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()

  const options = useMemo(
    () => [
      { value: allValue, label: 'Todas las ciudades' },
      ...cities.map((city) => ({ value: city, label: city })),
    ],
    [allValue, cities],
  )

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const selectedLabel = options[selectedIndex]?.label ?? 'Todas las ciudades'

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!open) return
    setActiveIndex(selectedIndex)
    requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus())
  }, [open, selectedIndex])

  const close = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const choose = (city: string) => {
    onChange(city)
    close()
  }

  const focusOption = (index: number) => {
    const nextIndex = (index + options.length) % options.length
    setActiveIndex(nextIndex)
    optionRefs.current[nextIndex]?.focus()
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(selectedIndex)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOption(activeIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(activeIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusOption(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(options[activeIndex]?.value ?? allValue)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="city-filter">
      <span className="city-filter__label">
        <span className="city-filter__icon" aria-hidden="true">
          <LocationIcon />
        </span>
        Ciudad
      </span>

      <div className="city-filter__dropdown" ref={rootRef}>
        <button
          ref={triggerRef}
          type="button"
          className="city-filter__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={`Filtrar por ciudad: ${selectedLabel}`}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={onTriggerKeyDown}
        >
          <span>{selectedLabel}</span>
          <ChevronDownIcon className="city-filter__chevron" />
        </button>

        {open && (
          <div
            id={listboxId}
            className="city-filter__menu"
            role="listbox"
            aria-label="Ciudades"
            onKeyDown={onListKeyDown}
          >
            {options.map((option, index) => {
              const selected = option.value === value
              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  type="button"
                  className={`city-filter__option${
                    activeIndex === index ? ' city-filter__option--active' : ''
                  }`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <span className="city-filter__count" aria-live="polite">
        {resultLabel}
      </span>
    </div>
  )
}
