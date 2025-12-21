"use client";
import * as React from "react";
import { Check, ChevronsUpDown, Search, Layers } from "lucide-react";
import { Command } from "cmdk"; // Motor del buscador
import * as Popover from "@radix-ui/react-popover";
import { getCategories } from "@/lib/actions/inventory-actions";

export default function NeuralSelect({ value, onChange, placeholder = "Select category..." }) {
    const [open, setOpen] = React.useState(false);
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        let mounted = true;
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (mounted && res && res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
        return () => { mounted = false; };
    }, []);

    // Prepara las opciones internamente
    const options = categories.map(cat => ({
        value: cat.id,
        label: cat.name
    }));

    // Encontrar la etiqueta de la opción seleccionada
    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    return (
        <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
        <Layers size={14} /> Category
      </label>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button 
            type="button" 
            className="w-full flex items-center justify-between bg-zinc-500/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm hover:border-brand/50 transition-all outline-none"
          >
            {/* Cambiamos text-zinc-200 por var(--foreground) para que cambie en modo claro */}
            <span className={selectedLabel ? "text-[var(--foreground)] font-medium" : "text-zinc-500"}>
              {selectedLabel || placeholder}
            </span>
            <ChevronsUpDown size={14} className="text-zinc-500" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            /* Cambiamos bg-[#0c0c0e] por var(--card) y ajustamos sombras */
            className="z-[110] w-[var(--radix-popover-trigger-width)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <Command className="flex flex-col bg-transparent">
              <div className="flex items-center border-b border-[var(--border)] px-3 py-2 bg-zinc-500/5">
                <Search size={14} className="mr-2 text-zinc-500" />
                <Command.Input
                  placeholder="Search categories..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500 py-1 text-[var(--foreground)]"
                />
              </div>

              <Command.List className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                <Command.Empty className="py-4 text-center text-[10px] text-zinc-500 font-mono uppercase">
                  {categories.length === 0 ? "Initializing..." : "No_Results_Found"}
                </Command.Empty>

                {options.map((option) => (
                  <Command.Item
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    /* Los estados aria-selected ahora usan el color brand */
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