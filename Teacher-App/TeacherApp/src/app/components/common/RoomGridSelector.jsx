"use client";
import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import clsx from "clsx";

export const RoomGridSelector = ({
  rooms,
  caregivers,
  selected,
  setSelected,
  searchTerm,
  setSearchTerm,
}) => {
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  useEffect(() => {
    const filtered = rooms.filter((room) =>
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  const toggleSelection = (roomId) => {
    if (selected.includes(roomId)) {
      setSelected(selected.filter((id) => id !== roomId));
    } else {
      setSelected([...selected, roomId]);
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search rooms..."
        className="w-full sm:w-72"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => toggleSelection(room.id)}
            className={clsx(
              "cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200",
              selected.includes(room.id)
                ? "border-primary bg-primary/10"
                : "border-gray-300 bg-white hover:shadow-md",
            )}
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {room.roomName}
            </h3>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-800">Residents:</h4>
              <ul className="list-disc pl-5">
                {room.residents.map((resident) => (
                  <li key={resident.id} className="text-sm text-gray-700">
                    {resident.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-800">Caregiver:</h4>
              <span className="text-sm text-gray-700">
                {caregivers[room.id] || "Not Assigned"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
