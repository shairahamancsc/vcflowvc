
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onCreateNew?: (value: string) => void;
};

export function Combobox({ 
  options, 
  placeholder, 
  searchPlaceholder, 
  noResultsText, 
  name,
  value,
  onValueChange,
  onCreateNew
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onValueChange(newValue);
    setSearch("");
    setOpen(false);
  }

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const isPhoneNumber = /^[0-9\s+()-]+$/.test(search) && search.length >= 10;
  const showCreateNew = onCreateNew && search && filteredOptions.length === 0 && isPhoneNumber;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
             {filteredOptions.length === 0 && !showCreateNew && (
                <CommandEmpty>{noResultsText}</CommandEmpty>
             )}
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
               {showCreateNew && (
                <CommandItem
                  onSelect={() => {
                    onCreateNew(search);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="text-primary hover:!bg-primary/10 cursor-pointer"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create new client with phone "{search}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

    