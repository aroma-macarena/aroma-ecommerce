"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/** Wait after the last keystroke before filtering. */
const DEBOUNCE_MS = 300;

/**
 * Filters the product list while typing. The query lives in the address
 * (`?q=`), so the status filters, «back» and shared links keep it; the page
 * filters on the server. Enter filters at once; the X clears it.
 */
function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The last query asked of the router, which may still be on its way: a
  // new one is compared with it, not with the address, so clearing while a
  // search loads replaces that search instead of being ignored.
  const requested = useRef(urlQuery);

  // When the address changes from elsewhere (a «Ver todos» link, back),
  // the box follows it, unless the person is typing.
  useEffect(() => {
    requested.current = urlQuery;
    if (document.activeElement !== inputRef.current) {
      setValue(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(next: string) {
    clearTimeout(timer.current);
    const params = new URLSearchParams(searchParams.toString());
    const query = next.trim();
    if (query) params.set("q", query);
    else params.delete("q");
    if (query === requested.current) return;
    requested.current = query;
    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(next), DEBOUNCE_MS);
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
      className="relative xl:w-80"
    >
      <label htmlFor="buscar-producto" className="sr-only">
        Buscar por producto, asociación o categoría
      </label>
      {isPending ? (
        <LoaderCircle
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 animate-spin"
        />
      ) : (
        <Search
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
        />
      )}
      <input
        ref={inputRef}
        id="buscar-producto"
        type="search"
        name="q"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            setValue("");
            apply("");
          }
        }}
        placeholder="Buscar producto o asociación"
        autoComplete="off"
        className="border-input bg-card focus-visible:outline-ring min-h-11 w-full rounded-md border pr-11 pl-10 text-base focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            apply("");
            inputRef.current?.focus();
          }}
          aria-label="Borrar la búsqueda"
          className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md transition-colors duration-150"
        >
          <X aria-hidden className="size-4" />
        </button>
      ) : null}
    </form>
  );
}

export { ProductSearch };
