import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Newspaper, Tag } from "lucide-react";
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { MarkdownContent } from "@/lib/markdown";

function blogSlugFromLocation(location: string) {
  const parts = location.split("?")[0].split("/").filter(Boolean);
  if ((parts[0] === "blogs" || parts[0] === "blog") && parts[1]) return parts[1];
  return "";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function useBlogSeo(slug: string) {
  useEffect(() => {
    const post = slug ? getBlogPost(slug) : null;
    const title = post ? `${post.title} | XMem Blog` : "XMem Blog | Memory Layer Updates";
    const description =
      post?.description ||
      "Architecture notes, product updates, connector deep dives, and field reports from building XMem.";

    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "article", true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
  }, [slug]);
}

function BlogIndex() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 lg:pt-36">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="border-b border-white/10 pb-10"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/62">
          <Newspaper className="h-3.5 w-3.5" />
          XMem Blog
        </div>
        <h1 className="font-display max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
          Notes from the memory layer.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/58">
          Architecture notes, product updates, connector deep dives, and field reports from building XMem.
        </p>
      </motion.header>

      {featured && (
        <section className="grid gap-8 border-b border-white/10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Link href={`/blogs/${featured.slug}`} className="group overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
            {featured.heroImage && (
              <img
                src={featured.heroImage}
                alt=""
                className="aspect-[16/9] w-full bg-black object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            )}
          </Link>
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap gap-2">
              {featured.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
            <Link href={`/blogs/${featured.slug}`}>
              <h2 className="font-display text-3xl font-semibold leading-tight text-white md:text-4xl">{featured.title}</h2>
            </Link>
            <p className="mt-4 text-base leading-8 text-white/58">{featured.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/42">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(featured.date)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {featured.readingTime}
              </span>
            </div>
            <Link
              href={`/blogs/${featured.slug}`}
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#b8ff65]"
            >
              Read post
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-5 py-10 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link key={post.slug} href={`/blogs/${post.slug}`} className="group rounded-md border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.055]">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-white/45">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-display text-xl font-semibold leading-snug text-white">{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/52">{post.description}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-white/38">
              <span>{formatDate(post.date)}</span>
              <span>{post.readingTime}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

function BlogPostPage({ slug }: { slug: string }) {
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
        <Link href="/blogs" className="mb-8 inline-flex items-center gap-2 text-sm text-white/52 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <h1 className="font-display text-4xl font-bold text-white">Post not found</h1>
        <p className="mt-4 text-white/55">This post does not exist yet.</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-28 sm:px-8 lg:pt-32">
      <Link href="/blogs" className="mb-8 inline-flex items-center gap-2 text-sm text-white/52 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <article>
        <header className="border-b border-white/10 pb-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/52">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-white/58">{post.description}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/42">
            <span>{post.author}</span>
            <span>{formatDate(post.date)}</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        {post.heroImage && (
          <figure className="my-8 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
            <img src={post.heroImage} alt="" className="w-full bg-black object-cover" />
          </figure>
        )}

        <MarkdownContent markdown={post.body} />
      </article>
    </main>
  );
}

export default function BlogsPage() {
  const [location] = useLocation();
  const slug = blogSlugFromLocation(location);
  useBlogSeo(slug);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="fixed inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed left-1/2 top-0 h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-[#b8ff65]/5 blur-[120px] pointer-events-none" />
      {slug ? <BlogPostPage slug={slug} /> : <BlogIndex />}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
