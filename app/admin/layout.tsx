
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

        <div style={{ display: "flex" }}>
          {/* sidebar можна додати тут */}
          <main style={{ width: "100%" }}>
            {children}
          </main>
        </div>
  );
}