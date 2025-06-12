import { useEffect, useState } from "react";
import { useGlobal } from "../../../contexts/GlobalContext";
import { downloadNotificationFile } from "../../../services/notifications";
import { toast } from "react-toastify";
import { CardPreviewImage } from "../../CardPreviewImage/CardPreviewImage";

type CardNotificationProps = {
    title?: string;
    description?: string;
    id_document_file: number;
};

export function CardNotification({ id_document_file, description, title }: CardNotificationProps) {
    const [imageData, setImageData] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const { getInfoError } = useGlobal();

    async function arrayBufferToBase64(buffer: any) {
        let binary = "";
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    useEffect(() => {
        async function execute() {
            try {
                setLoading((prev) => !prev);
                const res = await downloadNotificationFile(id_document_file);
                if (res && res.data) {
                    const base64String = await arrayBufferToBase64(res.data);
                    setImageData(`data:${res.headers["content-type"]};base64, ${base64String}`);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
            }
        }
        execute();
    }, [id_document_file]);

    return <CardPreviewImage loading={loading} base64={imageData} />;
}
