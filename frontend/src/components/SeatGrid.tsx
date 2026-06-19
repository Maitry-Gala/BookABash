interface Seat {
  _id: string;
  seatNumber: number;
  status: "available" | "reserved" | "booked";
}

interface SeatGridProps {
  seats: Seat[];
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
}

const seatStyles = {
  available: "bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 cursor-pointer",
  reserved: "bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed",
  booked: "bg-red-100 border-red-300 text-red-700 cursor-not-allowed",
  selected: "bg-purple-600 border-purple-700 text-white cursor-pointer scale-105",
};

const SeatGrid = ({ seats, selectedSeats, onSeatClick }: SeatGridProps) => {
  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { label: "Available", style: "bg-emerald-100 border-emerald-300 text-emerald-700" },
          { label: "Selected", style: "bg-purple-600 border-purple-700 text-white" },
          { label: "Reserved", style: "bg-amber-100 border-amber-300 text-amber-700" },
          { label: "Booked", style: "bg-red-100 border-red-300 text-red-700" },
        ].map(({ label, style }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded border text-xs flex items-center justify-center font-medium ${style}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* screen indicator */}
      <div className="w-full bg-purple-100 text-center text-xs text-purple-500 font-medium py-1.5 rounded-lg mb-6 tracking-widest uppercase">
        Stage / Screen
      </div>

      {/* grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}>
        {seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.seatNumber);
          const isDisabled = seat.status === "reserved" || seat.status === "booked";

          const style = isSelected
            ? seatStyles.selected
            : seatStyles[seat.status];

          return (
            <button
              key={seat._id}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSeatClick(seat.seatNumber)}
              className={`w-11 h-11 rounded-lg border text-xs font-semibold transition-all duration-150 ${style}`}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeatGrid;