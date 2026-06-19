import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SeatGrid from "../components/SeatGrid";
import CountdownTimer from "../components/CountdowmTimer";

interface Seat {
  _id: string;
  seatNumber: number;
  status: "available" | "reserved" | "booked";
}

interface Event {
  _id: string;
  name: string;
  dateTime: string;
  venue: string;
  totalSeats: number;
}

interface Reservation {
  reservationId: string;
  seatNumbers: number[];
  expiresAt: string;
}

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data.event);
        setSeats(res.data.data.seats);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSeatClick = (seatNumber: number) => {
    if (reservation) return; // lock selection after reserving
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
    setError("");
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }
    setReserving(true);
    setError("");
    try {
      const res = await api.post("/reserve", { eventId: id, seatNumbers: selectedSeats });
      setReservation(res.data.data);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.message || "Failed to reserve seats");
      // highlight unavailable seats by refreshing seat state
      if (data?.unavailableSeats) {
        setSeats((prev) =>
          prev.map((s) =>
            data.unavailableSeats.includes(s.seatNumber)
              ? { ...s, status: "reserved" }
              : s
          )
        );
        setSelectedSeats((prev) =>
          prev.filter((s) => !data.unavailableSeats.includes(s))
        );
      }
    } finally {
      setReserving(false);
    }
  };

  const handleExpire = () => {
    setReservation(null);
    setSelectedSeats([]);
    setError("Your reservation expired. Please select seats again.");
    // refresh seats from server
    api.get(`/events/${id}`).then((res) => setSeats(res.data.data.seats));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-600 animate-pulse font-medium">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-red-500">{error || "Event not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* back */}
        <button
          onClick={() => navigate("/")}
          className="text-sm text-purple-600 hover:underline mb-6 inline-block"
        >
          ← Back to events
        </button>

        {/* event info */}
        <div className="bg-white rounded-2xl border border-purple-100 px-6 py-5 mb-6">
          <h1 className="text-2xl font-bold text-indigo-900">{event.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{event.venue}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(event.dateTime).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* seat grid */}
        <div className="bg-white rounded-2xl border border-purple-100 px-6 py-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-indigo-900">Select Seats</h2>
            {reservation && (
              <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
            )}
          </div>
          <SeatGrid seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
        </div>

        {/* error */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* action bar */}
        <div className="bg-white rounded-2xl border border-purple-100 px-6 py-4 flex items-center justify-between">
          <div>
            {selectedSeats.length > 0 && !reservation && (
              <p className="text-sm text-indigo-900">
                <span className="font-semibold">{selectedSeats.length}</span> seat{selectedSeats.length > 1 ? "s" : ""} selected:{" "}
                <span className="text-purple-600 font-medium">{selectedSeats.sort((a, b) => a - b).join(", ")}</span>
              </p>
            )}
            {reservation && (
              <p className="text-sm text-indigo-900">
                Reserved seats:{" "}
                <span className="text-purple-600 font-medium">{reservation.seatNumbers.sort((a, b) => a - b).join(", ")}</span>
              </p>
            )}
            {selectedSeats.length === 0 && !reservation && (
              <p className="text-sm text-gray-400">No seats selected</p>
            )}
          </div>

          <div className="flex gap-3">
            {!reservation ? (
              <button
                onClick={handleReserve}
                disabled={reserving || selectedSeats.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {reserving ? "Reserving..." : "Reserve Seats"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/booking/confirm", { state: { reservation, event } })}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
              >
                Confirm Booking →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
