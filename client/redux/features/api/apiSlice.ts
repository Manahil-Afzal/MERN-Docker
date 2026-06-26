import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_SERVER_URI || "http://13.53.127.99:8000/api/v1",
    credentials: "include",
  }),

  endpoints: (builder) => ({

    // ================= AUTH =================
    refreshToken: builder.query({
      query: () => ({
        url: "user/refresh",
        method: "GET",
      }),
    }),

    loadUser: builder.query({
      query: () => ({
        url: "user/me",
        method: "GET",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),

    // ================= LAYOUT (THIS WAS MISSING) =================
    getLayoutByType: builder.query({
      query: (type: string) => ({
        url: `layout/get-layout/${type}`,
        method: "GET",
      }),
    }),

  }),
});

// ================= EXPORT HOOKS =================
export const {
  useRefreshTokenQuery,
  useLoadUserQuery,
  useGetLayoutByTypeQuery,
} = apiSlice;