import { ChevronRight, HomeIcon } from "lucide-react";
import { useNavigate } from "react-router";

export const MainLayout = ({
  children,
  pageTitle,
  subtitle = null,
  actionButton = () => {},
  showBreadCrumps = false,
  renderBreadCrumps = () => {},
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col overflow-hidden shadow-lg">
      <div className="flex justify-between px-6 py-4">
        <div className="flex flex-col items-start gap-0.5">
          <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          {showBreadCrumps && renderBreadCrumps()}

          {/* < */}
        </div>
        {actionButton() || ""}
      </div>
      <div className="max-h-full flex-1 overflow-auto">{children}</div>
    </div>
  );
};
