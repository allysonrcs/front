import { FC } from "react";
import { get, Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type FormInputProps = {
    control: any;
    errors: any;
    name: string;
    format?: string;
    minDate?: string;
    maxDate?: string;
} & TextFieldProps;

const FormDatePicker: FC<FormInputProps> = ({
    control,
    errors,
    name,
    format = "DD/MM/YYYY",
    minDate,
    maxDate,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <Controller
            defaultValue={null}
            control={control}
            name={name as any}
            render={({ field: { onChange, value } }) => (
                <DatePicker
                    disabled={props.disabled}
                    minDate={minDate}
                    maxDate={maxDate}
                    value={value}
                    inputFormat={format}
                    onChange={onChange}
                    renderInput={(params: any) => (
                        <TextField
                            {...params}
                            {...props}
                            sx={{ button: { margin: 0 }, "& fieldset": { borderRadius: "8px !important" } }}
                            error={!!error}
                            helperText={error ? error.message : ""}
                        />
                    )}
                />
            )}
        />
    );
};

export default FormDatePicker;
