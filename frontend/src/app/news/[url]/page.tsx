import ArticleClient from './articleClient';

export default async function Page({ params }: { params: Promise<{ url: string }> }) {
  const { url } = await params;
  console.log("URL param:", url);

  return <ArticleClient url={url} />;
}
