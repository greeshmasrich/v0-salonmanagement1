"use client"

import * as React from "react"
import { X, ChevronsUpDown, Check } from "lucide-react"
import { Button } from "./button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, value, onChange, placeholder = "Select...", className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.filter((o) => value.includes(o.value))

  const toggle = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val))
    else onChange([...value, val])
  }

  const clear = () => onChange([])

  const grouped = React.useMemo(() => {
    const map = new Map<string, MultiSelectOption[]>()
    for (const o of options) {
      const k = o.group || "Options"
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(o)
    }
    return Array.from(map.entries())
  }, [options])

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {selected.map((s) => (
          <Badge key={s.value} variant="secondary" className="px-2 py-1">
            {s.label}
            <button className="ml-1" onClick={() => toggle(s.value)} aria-label={`Remove ${s.label}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selected.length === 0 && <span className="text-sm text-muted-foreground">{placeholder}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-transparent"
            >
              Manage selection
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[320px]">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                {grouped.map(([group, opts]) => (
                  <CommandGroup key={group} heading={group}>
                    {opts.map((o) => {
                      const active = value.includes(o.value)
                      return (
                        <CommandItem
                          key={o.value}
                          onSelect={() => toggle(o.value)}
                          className={active ? "bg-accent/40" : undefined}
                        >
                          <Check className={cn("mr-2 h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                          {o.label}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  )
}
