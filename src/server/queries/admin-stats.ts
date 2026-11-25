import "server-only";
import { vnDaysAgo } from "@/lib/vn-time";
import { db } from "@/server/db";

/** Dashboard numbers. Not cached: staff expect live figures. */
export async function getDashboardStats() {
  const today = vnDaysAgo(0);
  const weekStart = vnDaysAgo(6); // today + previous 6 days

  const [leadsToday, leadsWeek, leadsNew, categories, projects, posts, testimonials, recentLeads] =
    await Promise.all([
      db.lead.count({ where: { createdAt: { gte: today } } }),
      db.lead.count({ where: { createdAt: { gte: weekStart } } }),
      db.lead.count({ where: { status: "NEW" } }),
      db.category.count({ where: { isPublished: true } }),
      db.project.count({ where: { isPublished: true } }),
      db.post.count({ where: { publishedAt: { lte: new Date() } } }),
      db.testimonial.count({ where: { isPublished: true } }),
      db.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          province: true,
          status: true,
          createdAt: true,
          category: { select: { name: true } },
        },
      }),
    ]);

  return {
    leads: { today: leadsToday, week: leadsWeek, new: leadsNew },
    content: { categories, projects, posts, testimonials },
    recentLeads,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
