import { Stack, Collapse } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { useFileInput } from "./Root";
import { FileItem } from "./FileItem";

export function FileList(): JSX.Element | null {
    const { files } = useFileInput();
    if (!files.length) return null;

    return (
        <TransitionGroup component={Stack} spacing={1} mt={2}>
            {files.map((meta) => (
                <Collapse key={meta.file.name} timeout={350} appear unmountOnExit>
                    <FileItem meta={meta} />
                </Collapse>
            ))}
        </TransitionGroup>
    );
}
