"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ComboboxPlayer {
  id: number
  name: string
  team: string
  position?: string
}

interface PlayerComboboxProps {
  players: ComboboxPlayer[]
  value: string // "all" or player id as string
  onChange: (value: string) => void
  className?: string
}

export function PlayerCombobox({ players, value, onChange, className }: PlayerComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedPlayer = value !== "all" ? players.find((p) => p.id.toString() === value) : null

  const label =
    value === "all"
      ? "All Players"
      : selectedPlayer
        ? `${selectedPlayer.name} — ${selectedPlayer.team}`
        : "Select player"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search players..." />
          <CommandList>
            <CommandEmpty>No player found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all players"
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                All Players
              </CommandItem>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.name} ${player.team} ${player.position}`}
                  onSelect={() => {
                    onChange(player.id.toString())
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{player.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {player.team} • {player.position}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
