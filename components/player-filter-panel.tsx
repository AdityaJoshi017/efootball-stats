"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, X } from "lucide-react"

interface FilterValue {
  position?: string
  team?: string
  cardType?: string
  archetype?: string
  minAge?: number
  maxAge?: number
  minGoals?: number
  maxGoals?: number
  minAssists?: number
  maxAssists?: number
}

interface PlayerFilterPanelProps {
  filters: FilterValue
  onFilterChange: (filters: FilterValue) => void
  positions: string[]
  teams: string[]
  cardTypes: string[]
  archetypes: string[]
}

export function PlayerFilterPanel({
  filters,
  onFilterChange,
  positions,
  teams,
  cardTypes,
  archetypes,
}: PlayerFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    position: true,
    team: true,
    cardType: false,
    archetype: false,
    stats: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFilterChange = (key: keyof FilterValue, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    })
  }

  const handleRangeChange = (key: keyof FilterValue, value: number | null) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const clearAllFilters = () => {
    onFilterChange({})
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== null && v !== "").length

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {activeFilterCount} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Position Filter */}
      <FilterSection
        title="Position"
        isOpen={expandedSections.position}
        onToggle={() => toggleSection("position")}
        isActive={!!filters.position}
      >
        <select
          value={filters.position || ""}
          onChange={(e) => handleFilterChange("position", e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Team Filter */}
      <FilterSection
        title="Team"
        isOpen={expandedSections.team}
        onToggle={() => toggleSection("team")}
        isActive={!!filters.team}
      >
        <select
          value={filters.team || ""}
          onChange={(e) => handleFilterChange("team", e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Card Type Filter */}
      <FilterSection
        title="Card Type"
        isOpen={expandedSections.cardType}
        onToggle={() => toggleSection("cardType")}
        isActive={!!filters.cardType}
      >
        <select
          value={filters.cardType || ""}
          onChange={(e) => handleFilterChange("cardType", e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Card Types</option>
          {cardTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Archetype Filter */}
      <FilterSection
        title="Archetype"
        isOpen={expandedSections.archetype}
        onToggle={() => toggleSection("archetype")}
        isActive={!!filters.archetype}
      >
        <select
          value={filters.archetype || ""}
          onChange={(e) => handleFilterChange("archetype", e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Archetypes</option>
          {archetypes.map((arch) => (
            <option key={arch} value={arch}>
              {arch}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Stats Ranges */}
      <FilterSection
        title="Stats"
        isOpen={expandedSections.stats}
        onToggle={() => toggleSection("stats")}
        isActive={
          filters.minAge !== undefined ||
          filters.maxAge !== undefined ||
          filters.minGoals !== undefined ||
          filters.maxGoals !== undefined ||
          filters.minAssists !== undefined ||
          filters.maxAssists !== undefined
        }
      >
        <div className="space-y-4">
          <RangeFilter
            label="Age"
            minValue={filters.minAge}
            maxValue={filters.maxAge}
            onMinChange={(v) => handleRangeChange("minAge", v)}
            onMaxChange={(v) => handleRangeChange("maxAge", v)}
            minBound={16}
            maxBound={45}
          />
          <RangeFilter
            label="Goals"
            minValue={filters.minGoals}
            maxValue={filters.maxGoals}
            onMinChange={(v) => handleRangeChange("minGoals", v)}
            onMaxChange={(v) => handleRangeChange("maxGoals", v)}
            minBound={0}
            maxBound={500}
            step={10}
          />
          <RangeFilter
            label="Assists"
            minValue={filters.minAssists}
            maxValue={filters.maxAssists}
            onMinChange={(v) => handleRangeChange("minAssists", v)}
            onMaxChange={(v) => handleRangeChange("maxAssists", v)}
            minBound={0}
            maxBound={300}
            step={10}
          />
        </div>
      </FilterSection>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.position && (
              <FilterChip
                label={`Position: ${filters.position}`}
                onRemove={() => handleFilterChange("position", "")}
              />
            )}
            {filters.team && (
              <FilterChip
                label={`Team: ${filters.team}`}
                onRemove={() => handleFilterChange("team", "")}
              />
            )}
            {filters.cardType && (
              <FilterChip
                label={`Card: ${filters.cardType}`}
                onRemove={() => handleFilterChange("cardType", "")}
              />
            )}
            {filters.archetype && (
              <FilterChip
                label={`Archetype: ${filters.archetype}`}
                onRemove={() => handleFilterChange("archetype", "")}
              />
            )}
            {filters.minAge !== undefined && (
              <FilterChip
                label={`Min Age: ${filters.minAge}`}
                onRemove={() => handleRangeChange("minAge", null)}
              />
            )}
            {filters.maxAge !== undefined && (
              <FilterChip
                label={`Max Age: ${filters.maxAge}`}
                onRemove={() => handleRangeChange("maxAge", null)}
              />
            )}
            {filters.minGoals !== undefined && (
              <FilterChip
                label={`Min Goals: ${filters.minGoals}`}
                onRemove={() => handleRangeChange("minGoals", null)}
              />
            )}
            {filters.maxGoals !== undefined && (
              <FilterChip
                label={`Max Goals: ${filters.maxGoals}`}
                onRemove={() => handleRangeChange("maxGoals", null)}
              />
            )}
            {filters.minAssists !== undefined && (
              <FilterChip
                label={`Min Assists: ${filters.minAssists}`}
                onRemove={() => handleRangeChange("minAssists", null)}
              />
            )}
            {filters.maxAssists !== undefined && (
              <FilterChip
                label={`Max Assists: ${filters.maxAssists}`}
                onRemove={() => handleRangeChange("maxAssists", null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  isActive,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 hover:bg-muted/50 rounded px-1 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {isActive && <span className="w-2 h-2 bg-primary rounded-full"></span>}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pb-3 px-1">{children}</div>}
    </div>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  )
}

function RangeFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minBound,
  maxBound,
  step = 1,
}: {
  label: string
  minValue?: number
  maxValue?: number
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  minBound: number
  maxBound: number
  step?: number
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={`Min (${minBound})`}
          value={minValue ?? ""}
          onChange={(e) => onMinChange(e.target.value ? parseInt(e.target.value) : null)}
          className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          min={minBound}
          max={maxBound}
          step={step}
        />
        <input
          type="number"
          placeholder={`Max (${maxBound})`}
          value={maxValue ?? ""}
          onChange={(e) => onMaxChange(e.target.value ? parseInt(e.target.value) : null)}
          className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          min={minBound}
          max={maxBound}
          step={step}
        />
      </div>
    </div>
  )
}
