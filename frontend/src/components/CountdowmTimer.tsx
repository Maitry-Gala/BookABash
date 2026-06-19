import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

const CountdownTimer = ({ expiresAt, onExpire }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setSecondsLeft(calc());

    const interval = setInterval(() => {
      const remaining = calc();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isUrgent ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-700"}`}>
      <span>⏱</span>
      <span>
        {secondsLeft === 0
          ? "Reservation expired"
          : `Reserved for ${minutes}:${String(seconds).padStart(2, "0")}`}
      </span>
    </div>
  );
};

export default CountdownTimer;