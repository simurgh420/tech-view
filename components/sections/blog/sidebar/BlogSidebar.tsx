// src/components/sections/blog/sidebar/BlogSidebar.tsx

import { getRecentPosts, getSidebarTags } from '@/services/blog/db/queries';
import { SidebarRecentPosts } from './SidebarRecentPosts';
import { SidebarCategories } from './SidebarCategories';
import { SidebarTags } from './SidebarTags';
import { SidebarNewsletter } from './SidebarNewsletter';
import { blogCategories } from './bogcategories';

export async function BlogSidebar() {
  const [recentPosts, tags] = await Promise.all([getRecentPosts(), getSidebarTags()]);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:w-[340px]">
      <SidebarCategories categories={blogCategories} />
      <SidebarRecentPosts posts={recentPosts} />
      <SidebarTags tags={tags} />
      <SidebarNewsletter />
    </aside>
  );
}
