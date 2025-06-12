import { FC } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type FormInputProps = {
    name: string;
    format?: string;
} & TextFieldProps;

const FormDatePicker: FC<FormInputProps> = ({ name, format = "DD/MM/YYYY", ...props }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            render={({ field: { onChange, value } }) => (
                <DatePicker
                    value={value}
                    inputFormat={format}
                    disabled={props.disabled}
                    onChange={onChange}
                    renderInput={(params: any) => (
                        <TextField
                            {...params}
                            {...props}
                            error={!!error}
                            helperText={error ? error.message : ""}
                            sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                        />
                    )}
                />
            )}
        />
    );
};

export default FormDatePicker;
