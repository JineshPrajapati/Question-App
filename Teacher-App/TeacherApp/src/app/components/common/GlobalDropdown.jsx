import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useDropdown } from "../../../contexts/dropdownContext";

const GlobalDropdown = () => {
  const { isOpen, menuItems, onSelect, menuRef, menuStyle, search, setSearch } =
    useDropdown();

  const filteredItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="scrollbar-thin scrollbar-thumb-gray-300 fixed z-[9999] max-h-60 w-60 overflow-hidden overflow-y-auto rounded-lg border border-gray-400 bg-white shadow-lg"
      style={menuStyle}
    >
      <div className="flex items-center gap-2 border-b border-gray-400 bg-gray-100 p-2">
        <Search size={16} className="text-gray-700" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.value}
              className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              onClick={() => {
                if (onSelect) onSelect(item);
              }}
            >
              {item.label}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-700">No results found</div>
        )}
      </div>
    </motion.div>
  );
};

export default GlobalDropdown;
