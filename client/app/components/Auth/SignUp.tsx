'use client'
import React, { useState, FC, useEffect } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { styles } from '../../styles/style';
import { useRegisterMutation } from '@/redux/features/auth/authApi';
import {toast} from "react-hot-toast";

type Props = {
    setRoute: (route: string) => void;
};

const schema = Yup.object().shape({
    name: Yup.string().required("Please enter your name!"),
    email: Yup.string().email("Invalid email").required("Please enter your email"),
    password: Yup.string().required("Please enter your password!").min(6),
});

const Signup: FC<Props> = ({ setRoute }) => {
    const [show, setShow] = useState(false);
    const [register, { data, error, isSuccess}]= useRegisterMutation();

    useEffect(() => {
        if(isSuccess){
            const message = data?.message || "Registration successful";
            toast.success(message);
            setRoute("verification");
        }
        if(error){
            const errorData = error as unknown as { data?: { message?: string }; error?: string };
            const message =
                errorData.data?.message ||
                errorData.error ||

                "Unable to register right now. Please check the server connection.";

            toast.error(message);
        }
    }, [isSuccess, data, error, setRoute])
    
    const formik = useFormik({
        initialValues: {name:"", email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ name, email, password }) => {
            const data = {
                name, email, password
            };
            await register(data);
        },
    });
    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div className='w-full'>
            <h1 className={`${styles.title}`}>
                 <span className="text-purple-400"> Join to ZyLO</span>
            </h1>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                     <label className={`${styles.label}`} htmlFor='email'>
                        Enter your Name 
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        id="name"
                        placeholder="Alexen"
                        className={`${errors.name && touched.name ? "border-purple-300" : "border-purple-200"
                            } ${styles.input} focus:border-purple-700 transition-colors`}
                    />
                    {errors.name && touched.name && (
                        <span className="text-purple-400 pt-2 block">{errors.name}</span>
                    )}
                </div>
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
                        value="Sign Up"
                        className={`${styles.button} bg-purple-400! hover:bg-purple-400! transition-all cursor-pointer`}
                    />
                </div>

                <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                    Or Join with
                </h5>
                <div className="flex items-center justify-center my-3">
                    <FcGoogle size={30} className="cursor-pointer mr-2" />
                    <AiFillGithub size={30} className="cursor-pointer ml-2 text-black dark:text-white hover:text-purple-700 transition-colors" />
                </div>
                <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                    Already have an account?{" "}
                    <span 
                        className="text-purple-400 pl-1 cursor-pointer font-semibold hover:underline"
                        onClick={() => setRoute("Login")}
                    >
                        Sign in
                    </span>
                </h5>
            </form>
            <br />
        </div>
    )
}

export default Signup;