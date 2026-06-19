import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface Event {
  _id: string;
  name: string;
  dateTime: string;
  venue: string;
  totalSeats: number;
}

export const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-purple-600 font-medium animate-pulse">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* header */}
        <h1 className="text-3xl font-bold text-indigo-900 mb-1">Events</h1>
        <p className="text-sm text-gray-500 mb-8">Select an event to view and book seats</p>

        {/* empty state */}
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-purple-100 p-10 text-center">
            <p className="text-gray-400">No events available right now.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="bg-white rounded-2xl border border-purple-100 px-6 py-5 flex items-center justify-between cursor-pointer hover:border-purple-400 hover:shadow-md transition group"
              >
                {/* left */}
                <div>
                  <h2 className="text-lg font-semibold text-indigo-900 group-hover:text-purple-700 transition">
                    {event.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{event.venue}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.dateTime).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* right */}
                <div className="text-right shrink-0 ml-6">
                  <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {event.totalSeats} seats
                  </span>
                  <p className="text-xs text-gray-400 mt-2">View seats →</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;