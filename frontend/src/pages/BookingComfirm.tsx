import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Reservation {
  reservationId: string;
  seatNumbers: number[];
  expiresAt: string;
}

interface Event {
  _id: string;
  name: string;
  dateTime: string;
  venue: string;
}

interface LocationState {
  reservation: Reservation;
  event: Event;
}

export const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  // guard — if someone navigates here directly without state
  if (!state?.reservation || !state?.event) {
    navigate("/");
    return null;
  }

  const { reservation, event } = state;

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/bookings", {
        reservationId: reservation.reservationId,
      });
      console.log("booking res:", res.data);
      setBookingId(res.data.bookingId.toString());
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 410) {
        setError("Your reservation expired. Please go back and reserve again.");
      } else if (status === 409) {
        setError("Some seats could not be confirmed. Please re-reserve.");
      } else {
        setError(err.response?.data?.message || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (bookingId) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-indigo-900 mb-1">Booking Confirmed</h1>
          <p className="text-sm text-gray-500 mb-6">Your seats are locked in</p>

          <div className="bg-purple-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-indigo-900">Event</span> - {event.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-indigo-900">Venue</span> - {event.venue}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-indigo-900">Date</span> -{" "}
              {new Date(event.dateTime).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-indigo-900">Seats</span> -{" "}
              <span className="text-purple-600 font-semibold">
                {reservation.seatNumbers.sort((a, b) => a - b).join(", ")}
              </span>
            </p>
            <p className="text-xs text-gray-400 pt-1 border-t border-purple-100">
              Booking ID: {bookingId}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // ── Confirm state ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-indigo-900 mb-1">Confirm Booking</h1>
        <p className="text-sm text-gray-500 mb-6">Review your selection before confirming</p>

        {/* summary */}
        <div className="bg-purple-50 rounded-xl p-4 space-y-2 mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-900">Event</span> — {event.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-900">Venue</span> — {event.venue}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-900">Date</span> —{" "}
            {new Date(event.dateTime).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-900">Seats</span> —{" "}
            <span className="text-purple-600 font-semibold">
              {reservation.seatNumbers.sort((a, b) => a - b).join(", ")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-900">Total Seats</span> —{" "}
            <span className="font-semibold">{reservation.seatNumbers.length}</span>
          </p>
        </div>

        {/* error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
            {(error.includes("expired") || error.includes("re-reserve")) && (
              <button
                onClick={() => navigate(`/events/${event._id}`)}
                className="text-sm text-purple-600 font-medium hover:underline mt-1"
              >
                Go back and reserve again →
              </button>
            )}
          </div>
        )}

        {/* actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/events/${event._id}`)}
            className="flex-1 border border-purple-200 text-purple-700 font-semibold py-2.5 rounded-lg hover:bg-purple-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !!error}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};
