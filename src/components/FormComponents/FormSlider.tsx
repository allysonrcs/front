import { FC } from "react";
import { Controller, Control, get } from "react-hook-form";
import { Slider, Typography, FormControl, FormHelperText, SliderProps } from "@mui/material";

interface Mark {
    value: number;
    label?: string;
}

type FormSliderProps = {
    name: string;
    control: Control<any>;
    errors: any;
    labelTop?: string;
    labelBottom?: string;
    disabled?: boolean;
    defaultValue?: number | [number, number];
    valueLabelDisplay?: "on" | "auto" | "off";
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
    min?: number;
    max?: number;
    step?: number;
    marks?: Mark[] | boolean;
    range?: boolean;
} & SliderProps;

const FormSlider: FC<FormSliderProps> = ({
    name,
    control,
    errors,
    labelTop,
    labelBottom,
    disabled = false,
    defaultValue = 30,
    valueLabelDisplay = "auto",
    color = "primary",
    min = 10,
    max = 100,
    step = 10,
    marks = true,
    range = false,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <FormControl fullWidth error={!!error} disabled={disabled}>
            {labelTop && (
                <Typography gutterBottom color={error ? "error" : "text.primary"}>
                    {labelTop}
                </Typography>
            )}
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({ field }) => (
                    <Slider
                        {...field}
                        value={
                            range
                                ? (Array.isArray(field.value) ? field.value : defaultValue) || [min, max]
                                : (field.value ?? defaultValue)
                        }
                        onChange={(_, value) => field.onChange(value)}
                        aria-label={labelTop || labelBottom}
                        valueLabelDisplay={valueLabelDisplay}
                        color={error ? "error" : color}
                        step={step}
                        marks={Array.isArray(marks) ? marks : marks ? true : undefined}
                        min={min}
                        max={max}
                        {...props}
                    />
                )}
            />
            {labelBottom && (
                <Typography variant='body2' color={error ? "error" : "text.secondary"}>
                    {labelBottom}
                </Typography>
            )}
            {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
    );
};

export default FormSlider;
