import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Crumb = {
  label: string;
  path?: string;
};

type ConsoleLayoutProps = {
  breadcrumbs: Crumb[];
  actions?: ReactNode;
  isEdited?: boolean;
  readOnly?: boolean;
  children: ReactNode;
};

function confirmBreadcrumbNavigation() {
  return window.confirm("You have unsaved work. If you leave this page, your changes may be lost.");
}

export function Breadcrumbs({
  hasPendingChanges,
  items,
}: {
  hasPendingChanges: boolean;
  items: Crumb[];
}) {
  const navigate = useNavigate();

  function go(path: string) {
    if (!hasPendingChanges || confirmBreadcrumbNavigation()) {
      navigate(path);
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => (
        <span key={`${item.label}-${item.path ?? "current"}`} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="size-4 text-[#505a5f]" />}
          {item.path ? (
            <button
              className="font-bold text-[#1d70b8] hover:underline"
              type="button"
              onClick={() => go(item.path ?? "/")}
            >
              {item.label}
            </button>
          ) : (
            <span className="font-bold text-[#0b0c0c] dark:text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ConsoleLayout({
  breadcrumbs,
  actions,
  isEdited,
  readOnly = false,
  children,
}: ConsoleLayoutProps) {
  const location = useLocation();
  const isControlled = isEdited !== undefined;
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const hasEdits = readOnly ? false : isEdited ?? hasPendingChanges;

  useEffect(() => {
    if (!isControlled) {
      setHasPendingChanges(false);
    }
  }, [isControlled, location.pathname]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f8f8f8] text-[#0b0c0c] dark:bg-background dark:text-foreground">
      <div className="border-b border-[#b1b4b6] bg-white dark:bg-card">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
          <Breadcrumbs hasPendingChanges={hasEdits} items={breadcrumbs} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px]">
        <main className="min-w-0 p-4 sm:p-6">
          {actions && (
            <div className="mb-4 flex flex-wrap justify-end gap-2">
              {actions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[#b1b4b6] pb-4 md:flex-row md:items-center md:justify-between">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{title}</h2>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: "blue" | "green" | "red" | "yellow" }>;
}) {
  const toneMap = {
    blue: "border-[#1d70b8]",
    green: "border-[#00703c]",
    red: "border-[#d4351c]",
    yellow: "border-[#ffdd00]",
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "border-l-4 bg-white px-4 py-3 shadow-sm dark:bg-card",
            toneMap[item.tone ?? "blue"],
          )}
        >
          <p className="text-sm font-bold text-[#505a5f] dark:text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
