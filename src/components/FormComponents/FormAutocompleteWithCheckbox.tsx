import { FC } from "react";
import { Controller, get } from "react-hook-form";
import { Autocomplete, TextField, TextFieldProps } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

type AutocompleteOption = {
    id: number | string | boolean;
    label: string;
};

type FormInputProps = {
    name: string;
    options: AutocompleteOption[];
    control: any;
    errors: any;
    disabledAutocomplete?: boolean;
    disableClearable?: boolean;
} & TextFieldProps;

const FormAutocompleteWithCheckbox: FC<FormInputProps> = ({
    control,
    errors,
    options,
    name,
    disabledAutocomplete = false,
    disableClearable = false,
    ...props
}) => {
    const error = get(errors, name);

    return (
        <Controller
            defaultValue={props.defaultValue ?? []}
            control={control}
            name={name as any}
            render={({ field: { ref, onChange, ...field } }) => (
                <Autocomplete
                    multiple
                    id={"id-" + name}
                    {...field}
                    options={options}
                    disableCloseOnSelect
                    disabled={disabledAutocomplete}
                    disableClearable={disableClearable}
                    getOptionLabel={(option) => option.label}
                    onChange={(_, data) => onChange(data)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(liProps, option, { selected }) => {
                        return (
                            <li {...liProps}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField {...params} {...props} error={!!error} helperText={error ? error.message : ""} />
                    )}
                    sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                />
            )}
        />
    );
};

export default FormAutocompleteWithCheckbox;
