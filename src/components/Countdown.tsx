import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface CountdownProps {
  targetDate: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-4 sm:gap-6 justify-center">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-4">
          <div className="text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <div className="text-emerald-200 text-xs mt-2 font-medium uppercase tracking-wider">{label}</div>
          </div>
          {i < 3 && (
            <div className="text-white/40 text-2xl font-bold pb-4">:</div>
          )}
        </div>
      ))}
    </div>
  );
}
