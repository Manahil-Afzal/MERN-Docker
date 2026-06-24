"use client";

import { styles } from "@/app/styles/style";
import {
	useEditLayoutMutation,
	useGetHeroDataQuery,
} from "@/redux/features/layout/layoutApi";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { AiOutlineCamera } from "react-icons/ai";
import { HiOutlineSearch } from "react-icons/hi";

const FALLBACK_IMAGE = "/assests/banner1.png";
const FALLBACK_TITLE = "𝐿𝑒𝑎𝑟𝑛 𝑠𝑚𝑎𝑟𝑡𝑒𝑟 𝑤𝑖𝑡ℎ 𝑍𝑦𝐿𝑂";
const FALLBACK_SUBTITLE =
	"Find the right course, track your progress, and grow your skills with simple search and personalized learning support.";
const FALLBACK_TAGLINE =
	"Explore courses in programming, design, business, and more.";

const EditHero = () => {
	const [titleInput, setTitleInput] = useState<string | undefined>(undefined);
	const [subtitleInput, setSubtitleInput] = useState<string | undefined>(undefined);
	const [taglineInput, setTaglineInput] = useState<string | undefined>(undefined);
	const [imageInput, setImageInput] = useState<string | undefined>(undefined);
	const [searchTerm, setSearchTerm] = useState("");

	const { data, refetch } = useGetHeroDataQuery("Banner", {
		refetchOnMountOrArgChange: true,
	});

	const [editLayout, { isLoading, isSuccess, error }] = useEditLayoutMutation();

	const serverBanner = data?.layout?.banner;
	const serverTitle = serverBanner?.title || FALLBACK_TITLE;
	const serverSubtitle =
		serverBanner?.subtitle || serverBanner?.subTitle || FALLBACK_SUBTITLE;
	const serverTagline =
		serverBanner?.tagline || serverBanner?.tagLine || serverBanner?.bottomText || FALLBACK_TAGLINE;

	const serverImage = useMemo(() => {
		const bannerImage = serverBanner?.image;
		if (typeof bannerImage === "string") return bannerImage;
		return bannerImage?.url || FALLBACK_IMAGE;
	}, [serverBanner?.image]);

	const currentTitle = titleInput ?? serverTitle;
	const currentSubtitle = subtitleInput ?? serverSubtitle;
	const currentTagline = taglineInput ?? serverTagline;
	const currentImage = imageInput ?? serverImage;

	const hasChanges =
		currentTitle !== serverTitle ||
		currentSubtitle !== serverSubtitle ||
		currentTagline !== serverTagline ||
		currentImage !== serverImage;

	useEffect(() => {
		if (isSuccess) {
			toast.success("Hero updated successfully!");
			refetch();
		}

		if (error && typeof error === "object" && error !== null && "data" in error) {
			const apiError = error as { data?: { message?: string } };
			toast.error(apiError?.data?.message || "Failed to update hero section");
		}
	}, [isSuccess, error, refetch]);

	const handleUpdateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result === "string") {
				setImageInput(result);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleSave = async () => {
		if (!hasChanges || isLoading) return;

		await editLayout({
			type: "Banner",
			image: currentImage,
			title: currentTitle,
			subtitle: currentSubtitle,
			tagline: currentTagline,
		});
	};

	return (
		<section className="w-full bg-transparent transition-colors duration-300 pb-20">
			<div className="w-[95%] md:w-[90%] mx-auto pt-10 md:pt-20 pl-4 md:pl-0">

				{/* ✅ RESPONSIVE GRID FIX */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">

					{/* IMAGE SECTION */}
					<div className="flex justify-center">
						<div className="relative w-full max-w-[560px] aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
							<Image
								src={currentImage}
								alt="Hero banner"
								fill
								unoptimized
								className="object-cover transition duration-300 dark:brightness-75"
							/>

							<input
								type="file"
								id="banner"
								accept="image/*"
								onChange={handleUpdateImage}
								className="hidden"
							/>

							<label
								htmlFor="banner"
								className="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-black/50 rounded-full p-2 cursor-pointer"
							>
								<AiOutlineCamera className="dark:text-white text-black text-[20px]" />
							</label>
						</div>
					</div>

					{/* TEXT SECTION */}
					<div className="flex flex-col justify-center">

						<textarea
							className="mt-4 md:mt-8 resize-none text-purple-700 dark:text-purple-400 text-[26px] md:text-[54px] font-Poppins font-bold leading-tight w-full outline-none bg-transparent"
							rows={2}
							value={currentTitle}
							onChange={(e) => setTitleInput(e.target.value)}
						/>

						<textarea
							value={currentSubtitle}
							onChange={(e) => setSubtitleInput(e.target.value)}
							rows={3}
							className="mt-2 text-[15px] md:text-[19px] font-Josefin font-medium text-gray-500 dark:text-gray-400 w-full leading-relaxed bg-transparent outline-none resize-none"
						/>

						{/* SEARCH BOX - MOBILE FIX */}
						<div className="mt-3 flex w-full max-w-[650px] items-center overflow-hidden rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-white-300 shadow-lg">
							<input
								type="text"
								placeholder="Search courses..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full bg-transparent px-4 md:px-5 py-3 md:py-4 outline-none text-black dark:text-gray-600 placeholder:text-gray-500 text-sm md:text-base"
							/>
							<button
								type="button"
								className="m-1 md:m-2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-linear-to-r from-black via-purple-950 to-purple-700 text-white"
							>
								<HiOutlineSearch size={20} />
							</button>
						</div>

						<textarea
							value={currentTagline}
							onChange={(e) => setTaglineInput(e.target.value)}
							rows={2}
							className="mt-3 text-[13px] md:text-[16px] text-gray-500 dark:text-gray-400 font-Josefin w-full bg-transparent outline-none resize-none"
						/>

						{/* BUTTON */}
						<div className="mt-6 md:mt-8 flex justify-end">
							<button
								type="button"
								className={`${styles.button} w-[120px]! md:w-[130px]! h-[40px]! md:h-[42px]! rounded-md! ${
									hasChanges && !isLoading
										? "bg-[#8b5cf6]!"
										: "bg-[#7f8c8d]!"
								} text-white`}
								onClick={handleSave}
								disabled={!hasChanges || isLoading}
							>
								{isLoading ? "Saving..." : "Save"}
							</button>
						</div>

					</div>
				</div>
			</div>
		</section>
	);
};

export default EditHero;