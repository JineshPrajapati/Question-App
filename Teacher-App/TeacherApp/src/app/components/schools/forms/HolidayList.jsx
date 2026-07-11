import React, { useEffect, useState } from "react";
import axios from "../api";
import HolidayForm from "./HolidayForm";
import Modal from "../../model/Modal";

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHolidays = async () => {
    const res = await axios.get("/holidays");
    setHolidays(res.data);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleEdit = (id) => {
    setSelectedHolidayId(id);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedHolidayId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this holiday?")) {
      await axios.delete(`/holidays/${id}`);
      fetchHolidays();
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchHolidays();
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Holiday List</h2>

      <button
        onClick={handleAdd}
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        + Add Holiday
      </button>

      {/* Modal wrapper */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <HolidayForm
          holidayId={selectedHolidayId}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holidays.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center">
                No holidays found.
              </td>
            </tr>
          ) : (
            holidays.map((h) => (
              <tr key={h.id}>
                <td className="border p-2">{h.name}</td>
                <td className="border p-2">{h.holidayType}</td>
                <td className="border p-2">
                  {new Date(h.startDate).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  {new Date(h.endDate).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(h.id)}
                    className="bg-primary hover:bg-primary mr-2 rounded px-2 py-1 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HolidayList;
