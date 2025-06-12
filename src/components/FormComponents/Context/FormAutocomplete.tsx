import { FC } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { Autocomplete, TextField, TextFieldProps } from "@mui/material";

type AutocompleteOption = {
    id: number | string | boolean;
    label: string;
};

type FormInputProps = {
    name: string;
    options: AutocompleteOption[];
    disabledAutocomplete?: boolean;
    disableClearable?: boolean;
} & TextFieldProps;

const FormAutocomplete: FC<FormInputProps> = ({
    options,
    name,
    disabledAutocomplete = false,
    disableClearable = false,
    ...props
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const error = get(errors, name);

    return (
        <Controller
            control={control}
            name={name as any}
            defaultValue={null}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    fullWidth
                    clearOnEscape
                    disabled={disabledAutocomplete}
                    disableClearable={disableClearable}
                    options={options}
                    getOptionLabel={(option) => {
                        if (option && option.label) {
                            return option.label;
                        }
                        return "";
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                        <TextField {...params} {...props} error={!!error} helperText={error ? error.message : ""} />
                    )}
                    onChange={(_event, data) => {
                        field.onChange(data ?? "");
                    }}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormAutocomplete;
