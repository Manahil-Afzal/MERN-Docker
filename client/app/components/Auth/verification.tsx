'use client'
import { styles } from '@/app/styles/style';
import React, { FC, useEffect, useRef, useState } from 'react';
import { VscWorkspaceTrusted } from 'react-icons/vsc';
import { useActivationMutation } from '@/redux/features/auth/authApi';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

type Props = {
    setRoute: (route: string) => void;
};

type VerifyNumber = {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
};

const Verification: FC<Props> = ({ setRoute }) => {
    const [invalidError, setInvalidError] = useState<boolean>(false);
    const [activation, { isSuccess, error }] = useActivationMutation();

    const token = useSelector(
        (state: { auth?: { token?: string } }) => state.auth?.token
    );

    useEffect(() => {
        if (isSuccess) {
            toast.success('Account activated successfully');
        }

        if (error) {
            if ('data' in error) {
                const errorData = error as unknown as { data?: { message?: string } };
                toast.error(errorData.data?.message || 'Verification failed');
            } else {
                console.log('An error occured:', error);
            }
        }

    }, [isSuccess, error]);

    useEffect(() => {
        if (isSuccess) setRoute('Login');
    }, [isSuccess, setRoute]);

    // Fixed: Initializing refs properly
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
        '0': '',
        '1': '',
        '2': '',
        '3': '',
    });

    const verificationHandler = async () => {
        const verificationNumber = Object.values(verifyNumber).join('');
        if (verificationNumber.length !== 4) {
            setInvalidError(true);
            return;
        }

        await activation({
            activation_token: token,
            activation_code: verificationNumber,
        });
    };

    const handleInputChange = (index: number, value: string) => {
        setInvalidError(false);

        // Only allow numbers
        const lastChar = value.slice(-1);
        if (value !== '' && !/^\d+$/.test(lastChar)) return;

        const newVerifyNumber = { ...verifyNumber, [index]: lastChar } as VerifyNumber;
        setVerifyNumber(newVerifyNumber);

        if (value === '' && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (value.length > 0 && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    return (
        <div className="w-full">
            <h1 className={`${styles.title}`}>Verify Your Account</h1>
            <br />

            <div className="w-full flex items-center justify-center mt-2">
                {/* Updated to Purple Circle */}
                <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-white">
                    <VscWorkspaceTrusted size={40} />
                </div>
            </div>

            <div className="text-center mt-4 text-[14px] text-gray-600 dark:text-gray-300">
                <p>Please enter the 4-digit code sent to your email.</p>
            </div>

            <br />
            <br />

            <div className="flex flex-col items-center">
                <div className="flex items-center gap-3">
                    {Object.keys(verifyNumber).map((key, index) => (
                        <input
                            type="text"
                            key={key}
                            ref={inputRefs[index]}
                            className={`w-[65px] h-16 bg-transparent border-[3px] rounded-[10px] flex items-center text-black dark:text-white justify-center text-[18px] font-Poppins outline-none text-center ${
                                invalidError
                                    ? 'shake border-purple-300'
                                    : 'dark:border-white border-[#0000004a] focus:border-purple-700'
                            }`}
                            placeholder=""
                            maxLength={1}
                            value={verifyNumber[key as keyof VerifyNumber]}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                        />
                    ))}
                </div>

                <div className="w-full flex justify-center mt-8">
                    {/* Updated Button to Purple */}
                    <button
                        className={`${styles.button} bg-purple-500! hover:bg-purple-800! transition-colors`}
                        onClick={verificationHandler}
                        type="button"
                    >
                        Verify OTP
                    </button>
                </div>

                <h5 className="text-center pt-6 font-Poppins text-[14px] text-black dark:text-white">
                    Go back to Sign in?
                    <span
                        className="text-purple-500 pl-1 cursor-pointer font-semibold hover:underline"
                        onClick={() => setRoute('Login')}
                    >
                        {' '}
                        Sign in
                    </span>
                </h5>
            </div>
        </div>
    );
};

export default Verification;

