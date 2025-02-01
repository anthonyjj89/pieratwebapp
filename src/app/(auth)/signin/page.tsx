import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center">
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
      <div className="relative z-30 ml-[33%] -translate-x-1/2 w-full max-w-sm p-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-6">Sign in to PieRat</h1>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
