"use client";

export default function GoogleLoginButton() {
  const handleLogin = () => {
    // Use full browser navigation for OAuth to avoid RSC payload fetch issues
    window.location.href = "/api/auth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full mt-3 py-2 rounded-lg bg-white text-black font-semibold shadow flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]"
    >
      <img src="/google.jpg" className="w-10 h-10" alt="Google" />
      Continue with Google
    </button>
  );
}