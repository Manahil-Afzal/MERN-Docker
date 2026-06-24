"use client";

import React, { useMemo } from "react";
import {
  DataGrid,
  GridToolbar,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useTheme } from "@/app/utils/theme-provider";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import Loader from "../../Loader/Loader";
import { format } from "timeago.js";
import { useGetAllOrdersQuery } from "@/redux/features/orders/ordersApi";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import { AiOutlineMail } from "react-icons/ai";

type Props = {
  isDashboard?: boolean;
};

type OrderRow = {
  _id: string;
  userId: string;
  courseId: string;
  createdAt: string | Date;
};

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
};

type CourseRow = {
  _id: string;
  name?: string;
  price?: number;
};


const AllInvoices = (props: Props) => {
  const { theme } = useTheme();
  const { isDashboard } = props;

  const { isLoading, data } = useGetAllOrdersQuery({});
  const { data: usersData } = useGetAllUsersQuery({});
  const { data: coursesData } = useGetAllCoursesQuery({});

  const rows = useMemo(() => {
    const orders = data?.orders ?? [];
    const users = usersData?.users ?? [];
    const courses = coursesData?.courses ?? [];

    return (orders as OrderRow[]).map((item: OrderRow) => {
      const user = (users as UserRow[]).find((u: UserRow) => u._id === item.userId);

      const course =
        (courses as CourseRow[]).find((c: CourseRow) => c._id === item.courseId);



      return {
        id: item._id,
        userName: user?.name ?? "N/A",
        userEmail: user?.email ?? "N/A",
        title: course?.name ?? "N/A",
        price: typeof course?.price === "number" ? `$${course.price}` : "N/A",
        created_at: format(item.createdAt),
      };
    });
  }, [data, usersData, coursesData]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "userName", headerName: "Name", flex: isDashboard ? 0.6 : 0.5 },

    ...(isDashboard
      ? []
      : [
          { field: "userEmail", headerName: "Email", flex: 1 },
          { field: "title", headerName: "Course Title", flex: 1 },
        ]),

    { field: "price", headerName: "Price", flex: 0.5 },

    ...(isDashboard
      ? [{ field: "created_at", headerName: "Created At", flex: 0.5 }]
      : [
          {
            field: "email",
            headerName: "Email",
            flex: 0.2,
            renderCell: (params: GridRenderCellParams<{ userEmail?: string }>) => (
              <a href={`mailto:${params.row.userEmail ?? ""}`}>

                <AiOutlineMail className="text-black dark:text-white" size={20} />
              </a>
            ),
          },
        ]),
  ];

  return (
    <div className={!isDashboard ? "mt-[120px]" : "mt-0"}>
      {isLoading ? (
        <Loader />
      ) : (
        <Box sx={{ m: isDashboard ? "0" : "40px" }}>

          {/* ✅ MOBILE FIX WRAPPER */}
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                minWidth: {
                  xs: "900px", // mobile scroll fix
                  md: "100%",
                },
              }}
            >
              <Box
                sx={{
                  m: isDashboard ? "0" : "40px 0 0 0",
                  height: isDashboard ? "35vh" : "90vh",

                  "& .MuiDataGrid-root": {
                    border: "none",
                    outline: "none",
                  },

                  "& .MuiDataGrid-row": {
                    color: theme === "dark" ? "#fff" : "#000",
                    borderBottom:
                      theme === "dark"
                        ? "1px solid #ffffff30!important"
                        : "1px solid #ccc!important",
                  },

                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "transparent !important",
                  },

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#c084fc !important",
                    color: "#000",
                  },

                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "#c084fc !important",
                  },

                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#c084fc",
                    color: "#000",
                  },

                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor:
                      theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  },
                }}
              >
                <DataGrid
                  checkboxSelection={isDashboard ? false : true}
                  disableRowSelectionOnClick
                  rows={rows}
                  columns={columns}
                  slots={isDashboard ? undefined : { toolbar: GridToolbar }}
                />
              </Box>
            </Box>
          </Box>

        </Box>
      )}
    </div>
  );
};

export default AllInvoices;