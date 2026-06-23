import {
  useEditLayoutMutation,
  useGetHeroDataQuery,
} from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAddCircleOutline } from "react-icons/io";
import { toast } from "react-hot-toast";



type CategoryRow = {
  _id?: string;
  uid: string;
  title: string;
};

const createCategoryRow = (category: Partial<CategoryRow> = {}): CategoryRow => ({
  _id: category._id,
  uid:
    category.uid ||
    category._id ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: category.title || "",
});

const EditCategories = () => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("Categories", {
    refetchOnMountOrArgChange: true,
  });

  const [editLayout, { isSuccess: layoutSuccess, error }] =
    useEditLayoutMutation();

  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories(
        Array.isArray(data?.layout?.categories)
          ? data.layout.categories.map((c: Partial<CategoryRow>) => createCategoryRow(c))
          : []
      );
    }

    if (layoutSuccess) {
      refetch();
      toast.success("Categories updated successfully");
    }

    if (error && "data" in error) {
      const errorData = error as { data?: { message?: string } };
      toast.error(errorData?.data?.message);
    }
  }, [data, layoutSuccess, error, refetch]);

  const handleCategoriesAdd = (uid: string, value: string) => {
    setCategories((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, title: value } : item
      )
    );
  };

  const newCategoriesHandler = () => {
    if (!categories.length) {
      setCategories([createCategoryRow()]);
      return;
    }

    if (categories[categories.length - 1].title === "") {
      toast.error("Category title cannot be empty");
      return;
    }

    setCategories((prev) => [...prev, createCategoryRow()]);
  };

  const areCategoriesUnchanged = (a: Partial<CategoryRow>[] = [], b: Partial<CategoryRow>[] = []) =>
    JSON.stringify(a) === JSON.stringify(b);

  const isAnyCategoryTitleEmpty = (items: Partial<CategoryRow>[] = []) =>
    items.some((item) => item.title === "");

  const editCategoriesHandler = async () => {
    if (
      !areCategoriesUnchanged(data?.layout?.categories ?? [], categories.map((c) => ({ _id: c._id, title: c.title }))) &&
      !isAnyCategoryTitleEmpty(categories)
    ) {
      await editLayout({
        type: "Categories",
        categories: categories.map((c) => ({ _id: c._id, title: c.title })),
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-[120px] text-center px-4 sm:px-6 md:px-0">

          <h1 className={styles.title}>
            <b>All Categories</b>
          </h1>

          {/* LIST */}
          <div className="mt-6 space-y-4">

            {categories.map((item) => (
              <div key={item.uid} className="w-full flex justify-center">

                {/* MOBILE + DESKTOP ROW */}
                <div className="flex items-center w-full md:w-auto gap-2">

                  {/* INPUT */}
                  <input
                    className={`${styles.input} w-full md:w-[unset]! border-none! text-[18px] md:text-[20px]!`}
                    value={item.title}
                    onChange={(e) =>
                      handleCategoriesAdd(item.uid, e.target.value)
                    }
                    placeholder="Enter category title..."
                  />

                  {/* DELETE ICON (now always visible on right side) */}
                  <AiOutlineDelete
                    className="dark:text-white text-black text-[18px] cursor-pointer shrink-0"
                    onClick={() =>
                      setCategories((prev) =>
                        prev.filter((c) => c.uid !== item.uid)
                      )
                    }
                  />

                </div>
              </div>
            ))}

          </div>

          {/* ADD BUTTON */}
          <div className="w-full flex justify-center mt-8">
            <IoMdAddCircleOutline
              className="dark:text-white text-black text-[25px] cursor-pointer"
              onClick={newCategoriesHandler}
            />
          </div>

          {/* SAVE BUTTON */}
          <div
            className={`${styles.button} w-[100px]! min-h-10! h-10! dark:text-white text-black bg-[#cccccc34]
              ${
                areCategoriesUnchanged(data?.layout?.categories ?? [], categories) ||
                isAnyCategoryTitleEmpty(categories)
                  ? "cursor-not-allowed!"
                  : "cursor-pointer! bg-purple-400!"
              }
              rounded! fixed bottom-6 right-6 md:bottom-12 md:right-12`}
            onClick={
              areCategoriesUnchanged(data?.layout?.categories ?? [], categories) ||
              isAnyCategoryTitleEmpty(categories)
                ? () => null
                : editCategoriesHandler
            }
          >
            Save
          </div>

        </div>
      )}
    </>
  );
};

export default EditCategories;