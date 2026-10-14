export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="card mt-6 text-center"><p className="font-medium">Coming soon</p><p className="mt-1 text-sm text-muted">{text}</p></div>
    </div>
  );
}
