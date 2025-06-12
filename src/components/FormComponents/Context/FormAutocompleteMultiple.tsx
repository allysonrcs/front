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

const FormAutocompleteMultiple: FC<FormInputProps> = ({
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
            defaultValue={[]}
            render={({ field: { ref, onChange, ...field } }) => (
                <Autocomplete
                    multiple
                    options={options}
                    {...field}
                    defaultValue={[]}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    onChange={(_, data) => onChange(data)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...props}
                            fullWidth
                            inputRef={ref}
                            error={!!error}
                            helperText={error ? error.message : ""}
                        />
                    )}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormAutocompleteMultiple;
