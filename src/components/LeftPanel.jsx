const LeftPanel = () => {
  return (
    <div className="w-full md:w-1/2 bg-[#0A0F1E] p-6 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[40vh] md:min-h-full">
      {/* Logo */}
      <div className="relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Organic Mind</h1>
      </div>

      {/* Abstract Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-amber-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-orange-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 md:w-96 h-48 md:h-96">
          <div className="absolute w-16 md:w-32 h-16 md:h-32 bg-amber-400 rounded-full top-0 left-0 animate-bounce"></div>
          <div className="absolute w-12 md:w-24 h-12 md:h-24 bg-orange-400 rounded-full bottom-0 right-0 animate-pulse"></div>
          <div className="absolute w-8 md:w-16 h-8 md:h-16 bg-white/10 rounded-full top-1/2 left-1/2 animate-ping"></div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="relative z-10">
        <p className="text-white/60 text-xs md:text-sm">© 2024 Organic Mind</p>
      </div>
    </div>
  )
}

export default LeftPanel