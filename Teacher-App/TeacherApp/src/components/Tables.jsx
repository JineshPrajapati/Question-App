// import { useMemo } from "react";
// import {
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";

// const FacilityTable = () => {
//   const data = [
//     {
//       facilityId: 1,
//       title: "Test1",
//       address: "Address1",
//       state: "Machigun",
//       country: "US",
//       zipcode: 358425,
//       email: "test1@test.com",
//       contactNumber: 123456789,
//       facilityType: "regular",
//       accommodationType: "test",
//       status: "active",
//     },
//     {
//       facilityId: 2,
//       title: "Test2",
//       address: "Address2",
//       state: "Texas",
//       country: "US",
//       zipcode: 758425,
//       email: "test2@test.com",
//       contactNumber: 987654321,
//       facilityType: "premium",
//       accommodationType: "luxury",
//       status: "inactive",
//     },
//   ];

//   const columns = useMemo(
//     () => [
//       { accessorKey: "facilityId", header: "ID" },
//       { accessorKey: "title", header: "Title" },
//       { accessorKey: "address", header: "Address" },
//       { accessorKey: "state", header: "State" },
//       { accessorKey: "country", header: "Country" },
//       { accessorKey: "zipcode", header: "Zipcode" },
//       { accessorKey: "email", header: "Email" },
//       { accessorKey: "contactNumber", header: "Contact" },
//       { accessorKey: "facilityType", header: "Type" },
//       { accessorKey: "accommodationType", header: "Accommodation" },
//       { accessorKey: "status", header: "Status" },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
//         <div className="p-4 border-b">
//           <h2 className="text-xl font-bold text-gray-700">Facility List</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left border-collapse">
//             <thead className="bg-gray-800 text-white">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <th
//                       key={header.id}
//                       className="px-4 py-3 text-left font-medium border-b"
//                     >
//                       {header.isPlaceholder ? null : (
//                         <button
//                           className="flex items-center space-x-1"
//                           onClick={header.column.getToggleSortingHandler()}
//                         >
//                           <span>
//                             {flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                           </span>
//                           <ArrowUpDown className="w-4 h-4" />
//                         </button>
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {table.getRowModel().rows.map((row) => (
//                 <tr key={row.id} className="hover:bg-gray-100">
//                   {row.getVisibleCells().map((cell) => (
//                     <td key={cell.id} className="px-4 py-3 border-b">
//                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FacilityTable;
