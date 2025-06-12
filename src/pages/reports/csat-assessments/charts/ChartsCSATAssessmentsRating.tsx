import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatNumberWithThousandsSeparator } from "@/functions/number";

type RatingDistributionProps = {
    distribution: { [key: number]: number };
    total: number;
};

export function ChartsCSATAssessmentsRating({ distribution, total }: RatingDistributionProps) {
    const { theme } = useGlobal();
    const isThemeLight = theme === "light";

    return (
        <Box>
            <Typography
                fontWeight={700}
                fontSize={18}
                mt={-1}
                mb={2}
                textAlign='center'
                sx={{ color: isThemeLight ? "#484848" : "#EDF0F9" }}>
                Distribuição das Avaliações
            </Typography>

            {Array.from({ length: 5 }, (_, i) => {
                const rating = 5 - i;
                const count = distribution[rating] || 0;
                const percentage = total ? ((count / total) * 100).toFixed(2) : "0";

                return (
                    <Box key={rating} display='flex' alignItems='center' mb={1.7} mr={1}>
                        <Box display='flex' mr={2}>
                            {Array.from({ length: 5 }, (_, j) =>
                                j < rating ? (
                                    <StarIcon key={j} sx={{ color: "#FFA726" }} />
                                ) : (
                                    <StarBorderIcon key={j} sx={{ color: "#BDBDBD" }} />
                                ),
                            )}
                        </Box>

                        <Box
                            flexGrow={1}
                            height={16}
                            bgcolor={isThemeLight ? "#e0e0e0" : "#22444B"}
                            borderRadius={8}
                            overflow='hidden'>
                            <Box
                                width={`${percentage}%`}
                                height='100%'
                                bgcolor='#FFA726'
                                borderRadius={8}
                                sx={{ transition: "width 0.5s ease-in-out" }}
                            />
                        </Box>

                        <Typography variant='body2' width={100} textAlign='center' noWrap>
                            {formatNumberWithThousandsSeparator(count)} ({percentage}%)
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
