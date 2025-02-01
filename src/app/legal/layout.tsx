export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
