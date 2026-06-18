export default function GoogleLoginButton(){

    const handleLogin=()=>{
        window.location.href=process.env.NEXT_PUBLIC_CLIENT_ENV=="production"?"https://devtinder-1-pqv8.onrender.com/api/auth/google": "http://localhost:3001/api/auth/google";
    }

    return(
    <button
      onClick={handleLogin}
      className="w-full mt-3 py-2 rounded-lg bg-white text-black font-semibold shadow flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50  
              transform hover:scale-[1.02]"
    >
      <img src={"/google.jpg"} className="w-10 h-10" />
      Continue with Google
    </button>
    )
}