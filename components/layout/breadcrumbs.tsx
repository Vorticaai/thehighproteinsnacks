import BreadcrumbComponent, {
  type BreadcrumbItem,
} from "@/components/nav/Breadcrumbs";

export type Crumb = {
  label?: string;
  name?: string;
  href?: string;
};

interface LegacyBreadcrumbProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: LegacyBreadcrumbProps) {
  const normalized: BreadcrumbItem[] = items.map((item) => ({
    name: item.name ?? item.label ?? "",
    href: item.href,
  }));

  return <BreadcrumbComponent items={normalized} />;
}