"use client";
import * as React from "react";
import { Check, ChevronsUpDown, Search, Layers } from "lucide-react";
import { Command } from "cmdk"; // Motor del buscador
import * as Popover from "@radix-ui/react-popover";
import { getCategories } from "@/lib/actions/inventory-actions";

export default function NeuralSelect({
  value,
  onChange,
  placeholder = "Select category...",
  label = "Category",
  icon = Layers,
  options: providedOptions
}) {
  const [open, setOpen] = React.useState(false);
  const [internalOptions, setInternalOptions] = React.useState([]);

  // Icon handling: can be a component or a Lucide icon string/object
  const IconComponent = icon;

  React.useEffect(() => {
    // If options are provided from props, do not fetch
    if (providedOptions) {
      setInternalOptions(providedOptions);
      return;
    }

    // Fallback: Fetch categories (Backward Compatibility)
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (mounted && res && res.success) {
          setInternalOptions(res.data.map(cat => ({
            value: cat.id,
            label: cat.name
          })));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, [providedOptions]);

  // Use provided options or internally fetched ones
  const finalOptions = internalOptions;

  // Encontrar la etiqueta de la opción seleccionada
  const selectedLabel = finalOptions.find((opt) => opt.value === value)?.label;

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
        <IconComponent size={14} /> {label}
      </label>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:border-brand/50 transition-all outline-none"
          >
            <span className={selectedLabel ? "text-[var(--foreground)] font-medium" : "text-zinc-500"}>
              {selectedLabel || placeholder}
            </span>
            <ChevronsUpDown size={14} className="text-zinc-500" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-[110] w-[var(--radix-popover-trigger-width)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <Command className="flex flex-col bg-transparent">
              <div className="flex items-center border-b border-[var(--border)] px-3 py-2 bg-zinc-500/5">
                <Search size={14} className="mr-2 text-zinc-500" />
                <Command.Input
                  placeholder={`Search ${label}...`}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500 py-1 text-[var(--foreground)]"
                />
              </div>

              <Command.List className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                <Command.Empty className="py-4 text-center text-[10px] text-zinc-500 font-mono uppercase">
                  {finalOptions.length === 0 ? "No results" : "No matches found"}
                </Command.Empty>

                {finalOptions.map((option) => (
                  <Command.Item
                    key={option.value}
                    value={option.label} // Command.Item uses text for filtering usually
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors 
                               text-[var(--foreground)]
                               hover:bg-brand/10 hover:text-brand 
                               aria-selected:bg-brand aria-selected:text-white"
                  >
                    <span className="uppercase font-bold tracking-tight">{option.label}</span>
                    {value === option.value && <Check size={14} className="animate-in zoom-in duration-200" />}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}