import { ReactElement } from "react";
import { Box, Chip, Typography, LinearProgress } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatNumberWithThousandsSeparator } from "@/functions/number";
import { improvementOptions, positiveOptions } from "@/constants/array-tags-options-csat-assessments";

type CSATRecord = {
    rating: number;
    selected_tags?: string;
};

type Props = {
    data: CSATRecord[];
};

export function ChartsCSATAssessmentsTagsDistribution({ data }: Props) {
    const { theme } = useGlobal();
    const isThemeLight = theme === "light";

    const countTags = (tagList: string[]) =>
        tagList.reduce<Record<string, number>>((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

    const parseTags = (records: CSATRecord[], condition: (r: CSATRecord) => boolean) => {
        const tags = records
            .filter(condition)
            .flatMap((r) => (r.selected_tags ? r.selected_tags.split(";").map((t) => t.trim()) : []));
        return countTags(tags);
    };

    const negativeTagCounts = parseTags(data, (r) => r.rating >= 1 && r.rating <= 4);
    const positiveTagCounts = parseTags(data, (r) => r.rating === 5);

    const totalNegatives = Object.values(negativeTagCounts).reduce((a, b) => a + b, 0);
    const totalPositives = Object.values(positiveTagCounts).reduce((a, b) => a + b, 0);

    const renderGroup = (
        title: string,
        tags: { label: string; icon: React.ReactNode }[],
        counts: Record<string, number>,
        total: number,
        progressBarColor: string,
        type: string,
    ) => (
        <Box flex={1}>
            <Typography
                fontWeight={700}
                fontSize={18}
                mt={-1}
                mb={2}
                textAlign={"center"}
                sx={{ color: isThemeLight ? "#484848" : "#EDF0F9" }}>
                {title}
            </Typography>
            {tags.map(({ label, icon }) => {
                const count = counts[label] || 0;
                const percent = total > 0 ? ((count / total) * 100).toFixed(2) : "0";
                return (
                    <Box key={label} display='flex' alignItems='center' mb={0.5}>
                        <Chip
                            icon={icon as ReactElement}
                            label={label}
                            variant='outlined'
                            sx={{
                                mr: 2,
                                height: 26,
                                fontSize: "0.75rem",
                                border: "none",
                                width: 225,
                                justifyContent: "flex-end",
                                flexDirection: "row-reverse",
                                borderColor: isThemeLight ? "none" : "#8bc4cf",
                                "& .MuiChip-icon": {
                                    fontSize: 16,
                                    color: isThemeLight
                                        ? type === "negative"
                                            ? "#49479d"
                                            : "#009688"
                                        : type === "negative"
                                          ? "#807fdb"
                                          : "#009688",
                                    ml: 0.25,
                                },
                                "& .MuiChip-label": {
                                    textAlign: "right",
                                    flexGrow: 1,
                                },
                            }}
                        />

                        <Box flex={1} mr={1}>
                            <LinearProgress
                                variant='determinate'
                                value={+percent}
                                sx={{
                                    height: 16,
                                    borderRadius: 4,
                                    backgroundColor: isThemeLight ? "#e0e0e0" : "#22444B",
                                    "& .MuiLinearProgress-bar": { backgroundColor: progressBarColor },
                                }}
                            />
                        </Box>
                        <Typography fontSize={14} width={100} whiteSpace={"nowrap"}>
                            {formatNumberWithThousandsSeparator(count)} ({percent}%)
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );

    return (
        <Box display='flex' gap={2} flexWrap='wrap'>
            {renderGroup(
                "Distribuição por Avaliações Negativas",
                improvementOptions,
                negativeTagCounts,
                totalNegatives,
                "#49479d",
                "negative",
            )}
            {renderGroup(
                "Distribuição por Avaliações Positivas",
                positiveOptions,
                positiveTagCounts,
                totalPositives,
                "#009688",
                "positive",
            )}
        </Box>
    );
}
