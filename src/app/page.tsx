export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">PieRat</h1>
      <p className="mt-4 text-gray-300">Star Citizen Piracy Management</p>
      <a 
        href="/signin" 
        className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
      >
        Sign In with Discord
      </a>
    </main>
  );
}
