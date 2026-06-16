import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactNode } from "react";

type ResourceActionPanelProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export default function ResourceActionPanel({
  children,
  description,
  footer,
  onClose,
  open,
  title,
}: ResourceActionPanelProps) {
  if (!open) return null;

  return (
    <section className="mb-6 border border-[#1d70b8] bg-white p-4 shadow-sm dark:bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-[#b1b4b6] pb-3">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[#505a5f] dark:text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Button
          aria-label="Close action panel"
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div>}
    </section>
  );
}
