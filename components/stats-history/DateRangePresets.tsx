"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DateRange {
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
}

interface DateRangePresetsProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10)

const PRESETS: { label: string; days?: number }[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All Time" },
]

export function DateRangePresets({ value, onChange }: DateRangePresetsProps) {
  const isCustom = value.from !== undefined || value.to !== undefined
  const activePreset = PRESETS.find((p) => {
    if (p.days === undefined) return !isCustom
    if (!value.from) return false
    const expected = toISODate(new Date(Date.now() - p.days * 86400000))
    return value.from === expected && !value.to
  })

  const applyPreset = (days?: number) => {
    if (days === undefined) {
      onChange({})
    } else {
      onChange({ from: toISODate(new Date(Date.now() - days * 86400000)) })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          variant={activePreset?.label === preset.label ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(preset.days)}
        >
          {preset.label}
        </Button>
      ))}
      <div className={cn("flex items-center gap-1", isCustom && "rounded-md border px-2 py-1")}>
        <input
          type="date"
          value={value.from ?? ""}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          title="From date"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <input
          type="date"
          value={value.to ?? ""}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          title="To date"
        />
      </div>
    </div>
  )
}
