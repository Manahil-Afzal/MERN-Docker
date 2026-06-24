'use client'
import React, { useState, FC, useEffect } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { styles } from '../../styles/style';
import { useLoginMutation } from '@/redux/features/auth/authApi';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Props = {
    setRoute?: (route: string) => void;
    setOpen?: (open: boolean) => void;
    redirectTo?: string;
};

const schema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Please enter your email"),
    password: Yup.string().required("Please enter your password!").min(6),
});

const Login: FC<Props> = ({ setRoute, setOpen, redirectTo}) => {
    const [show, setShow] = useState(false);
    const [login, {isSuccess, isError, error}] = useLoginMutation();
    const router = useRouter();

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password }) => {
           await login({email, password})
        },
    });

      useEffect(() =>{
        if(isSuccess){
            toast.success("Login Successfully!")
            if (redirectTo) {
                router.push(redirectTo);
            } else {
                setOpen?.(false);
            }
        }
        if(isError && error){
            if("data" in error){
                const errorData = error as unknown as { data?: { message?: string } };
                toast.error(errorData.data?.message || "Login failed");

            }
        }
      }, [isSuccess, isError, error, setOpen, redirectTo, router]);  

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div className='w-full'>
            <h1 className={`${styles.title}`}>
                 <span className="text-purple-400"> Login with ZyLO</span>
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="w-full mt-5">
                    <label className={`${styles.label}`} htmlFor='email'>
                        Enter your Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        id="email"
                        placeholder="mail@gmail.com"
                        className={`${errors.email && touched.email ? "border-purple-300" : "border-purple-200"
                            } ${styles.input} focus:border-purple-700 transition-colors`}
                    />
                    {errors.email && touched.email && (
                        <span className="text-purple-400 pt-2 block">{errors.email}</span>
                    )}
                </div>

                <div className="w-full mt-5 relative mb-1">
                    <label className={`${styles.label}`} htmlFor="password">
                        Enter Your Password
                    </label>
                    <input
                        type={!show ? "password" : "text"}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        id="password"
                        placeholder="password~@&%"
                        className={`${errors.password && touched.password ? "border-purple-300" : "border-purple-200"
                            } ${styles.input} hide-password-toggle pr-10 focus:border-purple-700 transition-colors`}
                    />
                    <div className="absolute bottom-3 right-2 z-1 cursor-pointer text-black dark:text-white">
                        {!show ? (
                            <AiOutlineEyeInvisible
                                size={20}
                                onClick={() => setShow(true)}
                            />
                        ) : (
                            <AiOutlineEye
                                size={20}
                                onClick={() => setShow(false)}
                            />
                        )}
                    </div>
                </div>
                {errors.password && touched.password && (
                    <span className="text-purple-400 pt-2 block">{errors.password}</span>
                )}

                <div className="w-full mt-5">
                    <input
                        type="submit"
                        value="Login"
                        className={`${styles.button} bg-purple-400! hover:bg-purple-400! transition-all cursor-pointer`}
                    />
                </div>

                <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                    Or Join with
                </h5>
                <div className="flex items-center justify-center my-3">
                    <FcGoogle size={30} className="cursor-pointer mr-2"
                     onClick={() => signIn("google")}
                    />
                    <AiFillGithub size={30} className="cursor-pointer ml-2 text-black dark:text-white hover:text-purple-700 transition-colors"
                       onClick={() => signIn("github")}
                    />
                </div>
                <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                    Not have any account?{" "}
                    <span 
                        className="text-purple-400 pl-1 cursor-pointer font-semibold hover:underline"
                        onClick={() => setRoute?.("Sign-Up")}
                    >
                        Sign Up
                    </span>
                </h5>
            </form>
            <br />
        </div>
    )
}

export default Login;