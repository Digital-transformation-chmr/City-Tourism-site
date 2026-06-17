"use client";

import { useEffect, useState } from "react";

type Weather = {
  temperature: number;
  weathercode: number;
};

function getWeatherText(code: number) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫";
  if (code >= 51 && code <= 67) return "🌧";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦";
  if (code >= 95) return "⛈";

  return "❓ Невідомо";
}

export default function WeatherCherkasy() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=49.4444&longitude=32.0598&current_weather=true"
      );

      const data = await res.json();

      setWeather(data.current_weather);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-white/60">Завантаження...</div>;
  }

  if (!weather) {
    return <div className="text-red-400">Помилка</div>;
  }

  return (
    <div className="justify-center flex items-center gap-5 backdrop-blur-md bg-white/10 border
     border-white/10 rounded-xl py-2 px-5 text-white">
        <div className="text-lg text-white/60">
            Черкаси
        </div>

        <div className="text-2xl font-bold">
            {weather.temperature}°C
        </div>    
        
        <div className="text-3xl">
        {getWeatherText(weather.weathercode)}
        </div>

    </div>
  );
}