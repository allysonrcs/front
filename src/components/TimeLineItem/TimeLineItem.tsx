import { Box, BoxProps, SxProps } from "@mui/material";
import { ReactNode, FC } from "react";
import {
    TimelineOppositeContent,
    TimelineConnector,
    TimelineSeparator,
    TimelineContent,
    TimelineItem,
    TimelineDot,
} from "@mui/lab";

type TimeLineContentProps = {
    children?: ReactNode;
} & BoxProps;

export const TimelineItemContent: FC<TimeLineContentProps> = ({ children, ...props }) => {
    return <Box {...props}>{children}</Box>;
};

type TimeLineItemProps = {
    timeLineItemLeft?: ReactNode;
    timeLineItemRigth?: ReactNode;
    timeLineItemCenter?: ReactNode;
    sx?: SxProps;
};

export const TimeLineItem: FC<TimeLineItemProps> = ({
    timeLineItemLeft,
    timeLineItemRigth,
    timeLineItemCenter,
    ...sx
}) => {
    return (
        <TimelineItem>
            {timeLineItemLeft && <TimelineOppositeContent {...sx}>{timeLineItemLeft}</TimelineOppositeContent>}

            <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot>{timeLineItemCenter && <>{timeLineItemCenter}</>}</TimelineDot>
                <TimelineConnector />
            </TimelineSeparator>

            {timeLineItemRigth && <TimelineContent sx={{ py: "12px", px: 2 }}>{timeLineItemRigth}</TimelineContent>}
        </TimelineItem>
    );
};
