export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("/images/background.png")' }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-black/70 via-black/80 to-black/90 z-10" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] z-20" />

      {/* Content */}
      <div className="relative z-30 text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-white tracking-tight">
          PieRat
        </h1>
        <p className="text-xl text-gray-300">
          Star Citizen Piracy Management
        </p>
        <button
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
