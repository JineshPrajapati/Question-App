import React, { useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../../../api/services/dashboardService";
import { data } from "react-router";
import { Icons } from "react-toastify";
import PropTypes from "prop-types";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { AuthContext } from "../../../contexts/authContext";
import {
  HomeModernIcon,
  PencilIcon,
  UsersIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { School, GraduationCap, UserCircleIcon } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  bgColor,
  iconColor,
  isLoading,
}) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">
          {isLoading ? (
            <LoadingSpinner size={6} fullHeight={false} />
          ) : typeof value === "number" ? (
            value.toLocaleString()
          ) : (
            value
          )}
        </h3>
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
  bgColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
};
export const DashboardStatistics = ({
  onRefresh,
  selectedOption,
  handleSelectionChange,
}) => {
  const { user, currSelectedFacility } = useContext(AuthContext);

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats", currSelectedFacility],
    queryFn: () => getDashboardStats(currSelectedFacility),
  });

  useEffect(() => {}, [dashboardData]);
  const entityTotals =
    data?.data?.reduce((acc, item) => {
      acc[item.EntityName] = item.Total;
      return acc;
    }, {}) || {};

  const DashboardHeader = ({ title, lastUpdated }) => (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h1>
    </div>
  );

  DashboardHeader.propTypes = {
    title: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string,
  };

  const StatsGrid = ({ stats, isLoading }) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard isLoading={isLoading} key={stat.id} {...stat} />
      ))}
    </div>
  );

  StatsGrid.propTypes = {
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
          .isRequired,
        icon: PropTypes.elementType.isRequired,
        bgColor: PropTypes.string.isRequired,
        iconColor: PropTypes.string.isRequired,
      }),
    ).isRequired,
  };

  const stats = [
    {
      id: "User",
      title: "Total Users",
      value: dashboardData?.data?.data?.[0]?.total || 0,
      icon: UserGroupIcon,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      id: "schools",
      title: "Total Schools",
      value: dashboardData?.data?.data?.[1]?.total || 0,
      icon: School,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "teachers",
      title: "Total Teachers",
      value: dashboardData?.data?.data?.[2]?.total || 0,
      icon: UserIcon,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "students",
      title: "Total Students",
      value: dashboardData?.data?.data?.[3]?.total || 0,
      icon: GraduationCap,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Dashboard"
          lastUpdated={new Date().toLocaleDateString()}
        />
      </div>

      {user.userTypeId == 7 && (
        <StatsGrid isLoading={isLoading} stats={stats} />
      )}
    </div>
  );
};
