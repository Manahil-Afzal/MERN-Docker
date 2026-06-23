"use client";
import React, { FC, useEffect, useState } from 'react';
import { Modal, Box } from "@mui/material";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem?: unknown;
    component: React.ComponentType<{ setOpen: (open: boolean) => void; setRoute?: (route: string) => void }>;
    setRoute?: (route: string) => void;
}

const CustomModal: FC<Props> = ({ open, setOpen, setRoute, component: Component }) => {
    const [mounted, setMounted] = useState(false);

    // Ensure the modal only attempts to render on the client
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            disableScrollLock // Recommended for Next.js to prevent layout shift
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow-2xl p-6 outline-none transition-all">
                <Component setOpen={setOpen} setRoute={setRoute} />
            </Box>
        </Modal>
    )
}

export default CustomModal;