export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  return (
    <html lang="en">
      <body>
        {/* We can inject standard creator UI Shell components here later */}
        {children}
      </body>
    </html>
  );
}
