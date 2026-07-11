import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  const items = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
    { id: 4, name: "Date" },
    { id: 5, name: "Grape" },
    { id: 6, name: "Mango" },
    { id: 7, name: "Orange" },
  ];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 240;
      const dropdownHeight = 240;

      let left = rect.left;
      let right = "auto";
      let top = rect.bottom + 5;
      let bottom = "auto";

      if (rect.bottom + dropdownHeight > viewportHeight) {
        top = "auto";
        bottom = viewportHeight - rect.top + 5;
      }

      if (rect.right + dropdownWidth > viewportWidth) {
        left = "auto";
        right = viewportWidth - rect.right;
      }

      setMenuStyle({
        top: top !== "auto" ? `${top}px` : "auto",
        bottom: bottom !== "auto" ? `${bottom}px` : "auto",
        left: left !== "auto" ? `${left}px` : "auto",
        right: right !== "auto" ? `${right}px` : "auto",
        position: "fixed",
      });
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border-1 border-gray-300 px-4 py-2 text-gray-800 transition-all"
      >
        Choose Caregiver <ChevronDown size={16} />
      </button>

      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="scrollbar-thin scrollbar-thumb-gray-300 fixed z-[9999] max-h-60 w-60 overflow-hidden overflow-y-auto rounded-lg border bg-white shadow-lg"
          style={menuStyle}
        >
          <div className="flex items-center gap-2 border-b bg-gray-100 p-2">
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
                  key={item.id}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-700">
                No results found
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DropdownMenu;
