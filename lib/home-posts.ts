/** 把 Tiptap 產生的 HTML 過濾掉，只留下純文字當作摘要 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, "");
}

export type HomePostPreview = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  coverImage: string | null;
};

type PostRowForHome = {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  createdAt: Date;
};

export function formatPostsForHome(posts: PostRowForHome[]): HomePostPreview[] {
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: stripHtml(post.content).substring(0, 80) + "...",
    createdAt: new Date(post.createdAt).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    coverImage: post.coverImage,
  }));
}
