import { useState } from "react";
import { Loader } from "../Loader/Loader";
import { Box, Modal, useMediaQuery, useTheme } from "@mui/material";
import "./cardPreview.css";
type CardPreviewImageProps = {
    base64: string;
    loading: boolean;
};

export function CardPreviewImage({ base64, loading }: CardPreviewImageProps) {
    const [openModal, setOpenModal] = useState<boolean>(false);

    const theme = useTheme();

    const smDown = useMediaQuery(theme.breakpoints.down("sm"));

    async function handleCLick() {
        setOpenModal((prev) => !prev);
    }

    return (
        <div className='cards'>
            <div className='card'>
                {loading ? (
                    <Loader />
                ) : (
                    <div
                        style={{
                            borderRadius: "10px",
                            border: "none",
                            width: "100%",
                            height: "100%",
                        }}
                        onClick={handleCLick}>
                        <img
                            style={{
                                width: "100%",
                                height: "100%",
                                flex: 1,
                                borderRadius: "8px",
                                backgroundSize: "cover",
                                backgroundPosition: "center center",
                                objectFit: "cover",
                            }}
                            src={base64}
                        />
                    </div>
                )}
            </div>

            <Modal
                open={openModal}
                onClose={() => {
                    handleCLick();
                }}>
                <Box
                    sx={{
                        height: smDown ? "60%" : "none",
                        padding: smDown ? 5 : 10,
                        width: smDown ? "100%" : "80%",
                        position: "absolute" as "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                    <img
                        style={{
                            backgroundRepeat: "no-repeat",
                            width: "100%",
                            height: "100%",
                            objectFit: smDown ? "fill" : "cover",
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                        }}
                        src={base64}
                        alt='Imagem'
                    />
                </Box>
            </Modal>
        </div>
    );
}
