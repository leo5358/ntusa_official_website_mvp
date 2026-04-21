import HomeClient from "../components/HomeClient";
import { getCachedHomePostPreviews } from "../lib/get-cached-home-posts";

export default async function Home() {
  const formattedPosts = await getCachedHomePostPreviews();
  return <HomeClient posts={formattedPosts} />;
}
