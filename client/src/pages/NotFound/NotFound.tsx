import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mb-6 mt-3 text-2xl font-bold">没有找到这个页面</h1>
      <Link to="/" className="bg-primary px-5 py-3 text-sm text-primary-foreground">返回总览看板</Link>
    </main>
  );
}
