"use client";

import React, { FC, useState } from "react";
import { AiOutlineDelete, AiOutlineMail } from "react-icons/ai";
import { useTheme } from "@/app/utils/theme-provider";
import { Box, Button, Modal } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Loader from "../../Loader/Loader";
import { format } from "timeago.js";
import {
  useAddMemberMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "@/redux/features/user/userApi";


type Props = {
  isTeam?: boolean;
};

const AllUsers: FC<Props> = ({ isTeam = false }) => {
  const { theme } = useTheme();

  const [active, setActive] = useState(false);
  type UserRow = {
    _id: string;
    name: string;
    email: string;
    role: string;
    courses?: unknown[];
    createdAt: string | Date;
  };

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  type UsersQueryResult = {
    users?: UserRow[];
  };

  const { isLoading, data } = useGetAllUsersQuery({});

  const [addMember] = useAddMemberMutation();
  const [deleteUser] = useDeleteUserMutation();


  type Row = {
    id: string;
    name: string;
    email: string;
    role: string;
    courses: number;
    created_at: string;
  };

  const rows: Row[] =
    data?.users?.map((item) => ({
      id: item._id,
      name: item.name,
      email: item.email,
      role: item.role,
      courses: item.courses?.length ?? 0,
      created_at: format(item.createdAt),
    })) ?? [];

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "email", headerName: "Email", flex: 0.5 },
    { field: "role", headerName: "Role", flex: 0.5 },
    { field: "courses", headerName: "Courses", flex: 0.5 },
    { field: "created_at", headerName: "Joined", flex: 0.5 },


    {
      field: "delete",
      headerName: "Delete",
      flex: 0.2,
      renderCell: (params: { row: Row }) => (
        <Button onClick={() => setDeleteTarget(null)}>
          <AiOutlineDelete className="text-black dark:text-white" size={20} />
        </Button>
      ),
    },
    {
      field: "email_action",
      headerName: "Email",
      flex: 0.2,
      renderCell: (params: { row: Row }) => (
        <Button component="a" href={`mailto:${params.row.email}`}>
          <AiOutlineMail className="text-black dark:text-white" size={20} />
        </Button>
      ),
    },

  ];

  return (
    <div className="mt-[120px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box sx={{ m: "20px" }}>
          {/* 🔥 RESPONSIVE WRAPPER */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: { xs: "900px", md: "100%" } }}>
              <Box
                sx={{
                  m: "40px 0 0 0",
                  height: { xs: "65vh", md: "80vh" },

                  "& .MuiDataGrid-root": {
                    border: "none",
                    outline: "none",
                  },

                  /* ROW COLORS SAME */
                  "& .MuiDataGrid-row": {
                    color: theme === "dark" ? "#fff" : "#000",
                    borderBottom:
                      theme === "dark"
                        ? "1px solid #ffffff30!important"
                        : "1px solid #ccc!important",
                  },

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#c084fc !important",
                    color: "#000 !important",
                  },

                  "& .MuiDataGrid-columnHeader": {
                    backgroundColor: "#c084fc !important",
                    color: "#000 !important",
                  },

                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: "#c084fc !important",
                    color: "#000",
                  },

                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  },

                  /* remove hover change */
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "transparent !important",
                  },

                  "& .MuiDataGrid-cell": {
                    borderBottom: "none!important",
                  },
                }}
              >
                <DataGrid
                  checkboxSelection
                  disableRowSelectionOnClick
                  rows={rows}
                  columns={columns}
                />
              </Box>
            </Box>
          </Box>

          {/* MODALS unchanged */}
          <Modal open={active} onClose={() => setActive(false)}>
            <Box />
          </Modal>

          <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
            <Box />
          </Modal>
        </Box>
      )}
    </div>
  );
};

export default AllUsers;
