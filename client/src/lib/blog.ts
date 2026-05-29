export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  heroImage?: string;
  body: string;
};

const modules = import.meta.glob<string>("/src/content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }

  return { data, body: match[2].trim() };
}

function slugFromPath(path: string) {
  return path.split("/").pop()?.replace(/\.md$/, "") || "post";
}

function readTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export const blogPosts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const tags = data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

    return {
      slug: data.slug || slugFromPath(path),
      title: data.title || "Untitled",
      description: data.description || "",
      date: data.date || "2026-05-29",
      author: data.author || "XMem Team",
      tags,
      readingTime: data.readingTime || readTime(body),
      heroImage: data.heroImage,
      body,
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
