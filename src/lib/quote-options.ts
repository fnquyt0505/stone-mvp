import type { CategoryOptionGroup } from "@/components/site/quote-form";

type MenuGroup = { id: string; name: string; children: { id: string; name: string }[] };

/** "Loại sản phẩm" options: one optgroup per category group, group itself first. */
export function toQuoteCategoryOptions(menu: MenuGroup[]): CategoryOptionGroup[] {
  return menu.map((g) => ({
    name: g.name,
    options: [{ id: g.id, name: `${g.name} (chưa chọn mẫu)` }, ...g.children],
  }));
}
