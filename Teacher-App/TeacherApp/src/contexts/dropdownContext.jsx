import { createContext, useContext, useState, useRef, useEffect } from "react";

const DropdownContext = createContext();

export const DropdownProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [onSelect, setOnSelect] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);
  const anchorRef = useRef(null);

  const openDropdown = (event, items, callback) => {
    const rect = event.currentTarget.getBoundingClientRect();
    anchorRef.current = event.currentTarget;
    setMenuItems(items);
    setOnSelect(() => callback);
    setSearch(""); // Reset search input
    setIsOpen(true);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 240;
    const dropdownHeight = 240;

    let left = rect.left;
    let right = "auto";
    let top = rect.bottom + 5;
    let bottom = "auto";

    // If dropdown overflows bottom, show above
    if (rect.bottom + dropdownHeight > viewportHeight) {
      top = "auto";
      bottom = viewportHeight - rect.top + 5;
    }

    // If dropdown overflows right, show from right to left
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
      zIndex: 9999,
    });
  };

  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        anchorRef.current !== event.target
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider
      value={{ isOpen, openDropdown, closeDropdown, menuItems, onSelect, menuRef, menuStyle, search, setSearch }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => useContext(DropdownContext);
