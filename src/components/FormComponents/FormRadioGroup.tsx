import { FC } from "react";
import { get, Controller } from "react-hook-form";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, RadioGroupProps } from "@mui/material";

type Option = {
    label: string;
    value: string | number | boolean;
};

type FormRadioGroupProps = {
    control: any;
    errors: any;
    name: string;
    disabled?: boolean;
    options: Option[];
    label: string;
    defaultValue?: string | number | boolean;
} & RadioGroupProps;

const FormRadioGroup: FC<FormRadioGroupProps> = ({
    control,
    errors,
    name,
    label,
    disabled = false,
    options,
    defaultValue,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <FormControl component='fieldset' error={!!error}>
            <FormLabel component='legend'>{label}</FormLabel>
            <Controller
                control={control}
                name={name}
                defaultValue={defaultValue || options[0]?.value || ""}
                render={({ field }) => (
                    <RadioGroup {...field} {...props}>
                        {options.map((option) => (
                            <FormControlLabel
                                key={option.value.toString()}
                                value={option.value}
                                disabled={disabled}
                                control={<Radio />}
                                label={option.label}
                            />
                        ))}
                    </RadioGroup>
                )}
            />
            {error && <p style={{ color: "red" }}>{error.message}</p>}
        </FormControl>
    );
};

export default FormRadioGroup;
