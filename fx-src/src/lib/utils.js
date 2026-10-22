// Stand-in for the shadcn `cn` helper that Motion Primitives imports from
// '@/lib/utils': joins class names (no Tailwind merging needed here).
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
