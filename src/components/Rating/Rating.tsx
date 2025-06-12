import { Rating as MuiRating, RatingProps } from "@mui/material";

type FormInputRatingProps = {
    value: number;
} & RatingProps;

const Rating = ({ value, ...props }: FormInputRatingProps) => {
    return <MuiRating color='secondary' {...props} value={value} />;
};

export default Rating;
