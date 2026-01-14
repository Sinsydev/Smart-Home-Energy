import  { useEffect, useState } from "react";
export default function Hero() {
  const videos = [
    "/media/herobg.mp4",
    "/media/herobg3.mp4", 
  ];

  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 8000); // ⏱ change every 8 seconds
    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <header className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      {videos.map((video, index) => (
        <video
          key={index}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === currentVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Smart Homes Energy Power
        </h1>
        <p className="mt-4 max-w-2xl text-sm md:text-lg">
          Control your home energy with intelligence and ease.
          Monitor usage, reduce waste, and stay powered—anytime, anywhere.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="/register"
            className="rounded bg-white px-6 py-2 text-black font-medium hover:bg-gray-500 transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

 