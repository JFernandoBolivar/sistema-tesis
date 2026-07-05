export default function PageLayout({
  children,
  title,
  description,
}: Readonly<{
  children: React.ReactNode;
  title?: string;
  description?: string;
}>) {
  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      {(title || description) && (
        <div className="mb-2">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
