import { FC } from "react";
import { Controller } from "react-hook-form";
import { Checkbox, CheckboxProps, FormControlLabel, SxProps } from "@mui/material";

type FormCheckboxProps = {
    name: string;
    label: string;
    control: any;
    sxProps?: SxProps;
} & CheckboxProps;

const FormCheckbox: FC<FormCheckboxProps> = ({ name, label, control, sxProps, ...props }) => {
    return (
        <FormControlLabel
            control={
                <Controller
                    name={name as any}
                    control={control}
                    defaultValue={false}
                    render={({ field: { value, ...field } }) => <Checkbox {...field} checked={!!value} {...props} />}
                />
            }
            label={label}
            sx={{ ...sxProps }}
        />
    );
};

export default FormCheckbox;
