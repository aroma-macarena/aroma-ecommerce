import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { PendingTask } from "@/lib/admin/dashboard";

/** Rows shown before «Ver N más»: a phone screen's worth. */
const VISIBLE_TASKS = 5;

function TaskRow({ task }: { task: PendingTask }) {
  return (
    <li>
      <Link
        href={task.href}
        className="group hover:bg-accent/50 focus-visible:outline-ring grid min-h-16 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 pr-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        {/* The correction mark, sitting in the notebook's margin. */}
        <span
          aria-hidden
          className="border-correction mx-auto size-5 rounded-full border-2"
        />
        <span className="min-w-0 pl-1">
          <span className="block leading-snug font-bold">{task.subject}</span>
          <span className="text-muted-foreground block text-sm leading-snug">
            {task.missing}
          </span>
        </span>
        <span className="text-primary inline-flex items-center gap-0.5 text-[0.9375rem] font-bold">
          {task.action}
          <ChevronRight
            aria-hidden
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </li>
  );
}

/**
 * «Te falta»: a notebook page whose red margin line holds a correction mark
 * for each thing missing, every row a link to the exact task. With nothing
 * missing, it says so in blue.
 */
function PendingTaskList({ tasks }: { tasks: PendingTask[] }) {
  const visible = tasks.slice(0, VISIBLE_TASKS);
  const rest = tasks.slice(VISIBLE_TASKS);

  return (
    <section
      aria-labelledby="pendientes"
      className="bg-card relative overflow-hidden rounded-md border"
    >
      {/* The notebook's margin line. */}
      <span
        aria-hidden
        className="bg-correction/70 absolute inset-y-0 left-11 w-px"
      />
      <h2
        id="pendientes"
        className={
          tasks.length > 0
            ? "text-correction py-3.5 pr-4 pl-14 font-bold"
            : "text-primary py-3.5 pr-4 pl-14 font-bold"
        }
      >
        {tasks.length > 0 ? (
          <>
            Te falta{" "}
            <span className="text-muted-foreground font-normal">
              · {tasks.length}
            </span>
          </>
        ) : (
          "Todo al día"
        )}
      </h2>
      {tasks.length > 0 ? (
        <>
          <ul className="divide-y border-t">
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
          {rest.length > 0 ? (
            <details className="group/more border-t">
              <summary className="text-primary hover:bg-accent/50 flex min-h-12 cursor-pointer list-none items-center pr-4 pl-14 font-bold [&::-webkit-details-marker]:hidden">
                <span className="group-open/more:hidden">
                  Ver {rest.length} más
                </span>
                <span className="hidden group-open/more:inline">Ver menos</span>
              </summary>
              <ul className="divide-y border-t">
                {rest.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : (
        <p className="flex items-center gap-2 border-t py-4 pr-4 pl-14">
          <Check aria-hidden className="text-primary size-5" />
          No hay nada pendiente. Todo lo publicado se ve completo.
        </p>
      )}
    </section>
  );
}

export { PendingTaskList };
