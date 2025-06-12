import { useEffect, useState } from "react";
import { Box, Typography, Rating, Skeleton, Tooltip, Modal } from "@mui/material";
import { searchAverageRatingCsatAssessments } from "@/services/csat-assessments";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { BoxModal } from "../BoxModal/BoxModal";
import { CSATAssessmentsForm, CSATAssessmentsFormsProps } from "./CSATAssessmentsForm";
import { formatNumberWithThousandsSeparator } from "@/functions/number";
import { useMediaQuery } from "@/contexts/MediaQueryContext";

type Props = {
    module: string;
    routePath?: string;
    isClickable?: boolean;
    formProps?: CSATAssessmentsFormsProps;
};

export function CSATAverageRating({ module, routePath = "", isClickable = false, formProps }: Props) {
    const [loadingRating, setLoadingRating] = useState<boolean>(true);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [openModal, setOpenModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { device } = useMediaQuery();
    const isMobile = device === "Mobile";

    const { getInfoError } = useGlobal();

    useEffect(() => {
        const fetchAverageRating = async () => {
            try {
                setLoadingRating(true);
                const data = await searchAverageRatingCsatAssessments({
                    module,
                    route_path: routePath,
                });

                setAverageRating(data.average_rating);
                setTotalReviews(data.total_reviews);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoadingRating(false);
            }
        };

        fetchAverageRating();
    }, [module, routePath]);

    const handleOpenModal = () => {
        if (isClickable) setOpenModal(true);
    };

    if (loadingRating) {
        return (
            <Box display='flex' alignItems='center' gap={0.5}>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant='circular' width={14} height={14} />
                ))}
                <Skeleton variant='text' width={24} height={18} />
            </Box>
        );
    }

    if (!isClickable && (averageRating === null || totalReviews === null)) return null;

    return (
        <>
            <Tooltip title={`Nota: ${averageRating}/5`}>
                <Box
                    display='flex'
                    alignItems='center'
                    gap={0.5}
                    sx={{ cursor: isClickable ? "pointer" : "default" }}
                    onClick={handleOpenModal}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <Rating
                        value={averageRating || 0}
                        precision={0.5}
                        size={isMobile ? "small" : "medium"}
                        readOnly={!isHovered}
                    />
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        fontSize={isMobile ? 11 : 13}
                        mt={!isMobile ? 0.5 : 0}>
                        ({formatNumberWithThousandsSeparator(totalReviews)})
                    </Typography>
                </Box>
            </Tooltip>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <BoxModal
                    title={"Avaliação CSAT"}
                    handleClose={() => setOpenModal(false)}
                    width={"550px"}
                    maxHeight='95%'>
                    <Box sx={{ maxHeight: "85vh", overflowX: "auto", padding: 1, mt: -4 }}>
                        <CSATAssessmentsForm
                            onCloseModal={() => setOpenModal(false)}
                            context='Interação na Avaliação'
                            {...formProps}
                        />
                    </Box>
                </BoxModal>
            </Modal>
        </>
    );
}
