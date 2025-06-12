import { createContext, useContext, useId, useState, ReactNode, useEffect } from "react";

export type FileMeta = {
    file: File;
    isValid: boolean;
    error?: string;
};

interface FileInputContextType {
    id: string;
    files: FileMeta[];
    onFilesSelected: (newFiles: File[], multiple: boolean) => void;
    removeFile: (fileName: string) => void;
    allowedTypes: string[];
    maxSizeBytes: number;
}

const FileInputContext = createContext<FileInputContextType>(null as any);
export const useFileInput = () => useContext(FileInputContext);

interface RootProps {
    children: ReactNode;
    allowedTypes?: string[];
    maxSizeBytes?: number;
    onFilesChange?: (files: File[]) => void;
    resetTrigger?: number;
}

export function Root({
    children,
    allowedTypes = ["pdf", "jpg", "png", "docx"],
    maxSizeBytes = 5 * 1024 * 1024,
    onFilesChange,
    resetTrigger,
}: RootProps) {
    const id = useId();
    const [files, setFiles] = useState<FileMeta[]>([]);

    function onFilesSelected(newFiles: File[], multiple: boolean) {
        const metas = newFiles.map((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            if (!allowedTypes.includes(ext)) {
                return { file, isValid: false, error: `Tipo ".${ext}" não permitido` };
            }
            if (file.size > maxSizeBytes) {
                return { file, isValid: false, error: `Máx. ${(maxSizeBytes / 1024 / 1024).toFixed(1)} MB excedido` };
            }
            return { file, isValid: true };
        });

        setFiles((prev) => {
            const atual = multiple ? [...prev, ...metas] : metas;
            onFilesChange?.(atual.filter((m) => m.isValid).map((m) => m.file));
            return atual;
        });
    }

    function removeFile(fileName: string) {
        setFiles((prev) => {
            const filtered = prev.filter((m) => m.file.name !== fileName);
            onFilesChange?.(filtered.filter((m) => m.isValid).map((m) => m.file));
            return filtered;
        });
    }

    useEffect(() => {
        if (resetTrigger !== undefined) {
            setFiles([]);
            onFilesChange?.([]);
        }
    }, [resetTrigger]);

    return (
        <FileInputContext.Provider value={{ id, files, onFilesSelected, removeFile, allowedTypes, maxSizeBytes }}>
            {children}
        </FileInputContext.Provider>
    );
}
