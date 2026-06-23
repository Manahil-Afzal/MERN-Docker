"use client";
import { styles } from "@/app/styles/style";
import { useEditLayoutMutation, useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { HiMinus, HiPlus } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import toast from "react-hot-toast";
import Loader from "../../Loader/Loader"; 

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  active?: boolean;
}

const EditFaq = () => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("FAQ", {
    refetchOnMountOrArgChange: true,
  });
  const [editLayout, { isSuccess: layoutSuccess, error }] = useEditLayoutMutation();

  const [questions, setQuestions] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestions(
        Array.isArray(data?.layout?.faq)
          ? data.layout.faq.map((q: FaqItem) => ({ ...q, active: false }))
          : []
      );
    }
    if (layoutSuccess) {
      refetch();
      toast.success("FAQ updated successfully");
    }

    if (error) {
      if ("data" in error) {
        const errorData = error as { data?: { message?: string } };
        toast.error(errorData?.data?.message);
      }
    }
  }, [data, layoutSuccess, error, refetch]);

  const toggleQuestion = (id: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === id ? { ...q, active: !q.active } : q
      )
    );
  };

  const handleQuestionChange = (id: string, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q._id === id ? { ...q, question: value } : q))
    );
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q._id === id ? { ...q, answer: value } : q))
    );
  };

  const newFaqHandler = () => {
    setQuestions([
      ...questions,
      {
        _id: Date.now().toString(), // Temporary ID for client-side handling
        question: "",
        answer: "",
        active: true,
      },
    ]);
  };

  const areQuestionsUnchanged = (originalQuestions: FaqItem[] = [], newQuestions: FaqItem[] = []) => {
    const origClean = originalQuestions.map((q) => ({ question: q.question, answer: q.answer }));
    const newClean = newQuestions.map((q) => ({ question: q.question, answer: q.answer }));
    return JSON.stringify(origClean) === JSON.stringify(newClean);
  };

  const isAnyQuestionEmpty = (items: FaqItem[] = []) => {
    return items.some((q) => q.question === "" || q.answer === "");
  };

  const handleEdit = async () => {
    if (!areQuestionsUnchanged(data?.layout?.faq, questions) && !isAnyQuestionEmpty(questions)) {
      const finalFaq = questions.map((q) => ({ question: q.question, answer: q.answer }));
      await editLayout({
        type: "FAQ",
        faq: finalFaq,
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-[90%] 800px:w-[80%] m-auto mt-[120px]">
          <div className="mt-12">
            <dl className="space-y-8">
              {questions.map((q: FaqItem) => (
                <div
                  key={q._id}
                  className={`${
                    q._id !== questions[0]?._id && "border-t"
                  } border-gray-200 pt-6`}
                >
                  <dt className="text-lg">
                    <button
                      className="flex items-start dark:text-white text-black justify-between w-full text-left focus:outline-none"
                      onClick={() => toggleQuestion(q._id)}
                    >
                      <input
                        className={`${styles.input} !border-none !bg-transparent`}
                        value={q.question}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuestionChange(q._id, e.target.value)}
                        placeholder={"Add your question..."}
                      />

                      <span className="ml-6 flex-shrink-0">
                        {q.active ? <HiMinus className="h-6 w-6" /> : <HiPlus className="h-6 w-6" />}
                      </span>
                    </button>
                  </dt>
                  {q.active && (
                    <dd className="mt-2 pr-12">
                      <div className="flex items-center w-full">
                        <input
                          className={`${styles.input} !border-none !bg-transparent`}
                          value={q.answer}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(q._id, e.target.value)}
                          placeholder={"Add your answer..."}
                        />
                        <span className="ml-6 flex-shrink-0">
                          <AiOutlineDelete
                            className="dark:text-white text-black text-[18px] cursor-pointer"
                            onClick={() => {
                              setQuestions((prevQuestions) =>
                                prevQuestions.filter((item) => item._id !== q._id)
                              );
                            }}
                          />
                        </span>
                      </div>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
            <br />
            <br />
            <IoMdAddCircleOutline
              className="dark:text-white text-black text-[25px] cursor-pointer"
              onClick={newFaqHandler}
            />
          </div>

          <div
            className={`${styles.button} !w-[100px] !min-h-[40px] !h-[40px] dark:text-white text-black bg-[#cccccc34] 
              ${
                areQuestionsUnchanged(data?.layout?.faq, questions) || isAnyQuestionEmpty(questions)
                  ? "!cursor-not-allowed"
                  : "!cursor-pointer !bg-purple-400"
              }
              !rounded fixed bottom-12 right-12`}
            onClick={
              areQuestionsUnchanged(data?.layout?.faq, questions) || isAnyQuestionEmpty(questions)
                ? () => null
                : handleEdit
            }
          >
            Save
          </div>
        </div>
      )}
    </>
  );
};

export default EditFaq;