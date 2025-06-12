import { ChangeEvent } from "react";
import { useFileInput } from "./Root";

interface ControlProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Control({ multiple = false, accept, ...props }: ControlProps) {
    const { id, onFilesSelected } = useFileInput();

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
        if (!fileList?.length) return;
        const arr = Array.from(fileList);
        onFilesSelected(arr, multiple);
        e.target.value = "";
    }

    return <input type='file' id={id} hidden accept={accept} multiple={multiple} onChange={handleChange} {...props} />;
}
