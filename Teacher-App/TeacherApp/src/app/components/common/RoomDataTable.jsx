"use client";
import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import clsx from "clsx";
import { FormSelectCustomised } from "../form/FormElements";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";

export const RoomDataTable = ({
  rooms,
  caregivers,
  selectedRoom,
  setSelectedRoom,
  selectedCaregiver,
  setSelectedCaregiver,
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
    if (selectedRoom.includes(roomId)) {
      setSelectedRoom(selectedRoom.filter((id) => id !== roomId));
    } else {
      setSelectedRoom([...selectedRoom, roomId]);
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-1 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
              ></th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
              >
                Room Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
              >
                Residents
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
              >
                Caregiver
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRooms.map((room) => (
              <tr key={room.id}>
                <td className="px-1 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                  <input
                    type="checkbox"
                    className="text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded-md border border-gray-300"
                    onChange={() => toggleSelection(room.id)}
                    checked={selectedRoom.includes(room.id)}
                  />
                </td>
                <td className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-900">
                  {room.roomName}
                </td>
                <td className="px-6 py-4 text-left text-sm whitespace-nowrap text-gray-700">
                  <div className="flex flex-wrap gap-3 rounded-md p-2">
                    {room.residents.map((resident) => (
                      <div
                        key={resident.id}
                        className="flex items-center gap-1 rounded-md bg-gray-100 p-2"
                      >
                        <img
                          src={resident.profileImage}
                          alt={resident.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <p>{resident.name}</p>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-left text-sm whitespace-nowrap text-gray-700">
                  {caregivers[room.id] ? (
                    <div className="flex w-[200px] cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-200 p-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={caregivers[room.id].profileImage}
                          alt={caregivers[room.id].name}
                          className="h-6 w-6 rounded-full"
                        />
                        <p>{caregivers[room.id].name}</p>
                      </div>
                      <button className="bg-primary/10 text-primary rounded-md p-1">
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button className="bg-primary w-[200px] cursor-pointer rounded-md px-2 py-2 text-sm text-white">
                      + Assign Caregiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
