import React, { FC } from 'react';
import { IoMdCheckmark } from 'react-icons/io';

type Props = { // Fixed casing to match component usage
    active: number;
    setActive: (active: number) => void;
}

const CourseOptions: FC<Props> = ({ active }) => {
    const options = [
        "Course Information",
        "Course Options",
        "Course Content",
        "Course Preview",
    ];

    return (
        <div>
            {options.map((option: string, index: number) => (
                <div key={index} className={`w-full flex py-5`}>
                    <div className={`w-[35px] h-[35px] rounded-full flex items-center justify-center ${
                        active >= index ? "bg-purple-400" : "bg-[#384766]"
                    } relative`}>
                        <IoMdCheckmark className="text-[25px] text-white" />
                        
                        {/* Connecting Line */}
                        {index !== options.length - 1 && (
                            <div className={`absolute h-[33px] w-1 ${
                                active > index ? "bg-purple-400" : "bg-[#384766]"
                            } bottom-[-100%]`} />
                        )}
                    </div>

                    <h5 className={`pl-3 ${
                        active === index
                            ? "dark:text-white text-black"
                            : "dark:text-[#ffffffc1] text-[#000000ad]"
                    } text-[20px] font-Poppins`}>
                        {option}
                    </h5>
                </div>
            ))}
        </div>
    );
};

export default CourseOptions;