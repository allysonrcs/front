import IcAi from "@/assets/icons/flat_icons/ic-ai.svg";
import IcAudio from "@/assets/icons/flat_icons/ic-audio.svg";
import IcDocument from "@/assets/icons/flat_icons/ic-document.svg";
import IcExcel from "@/assets/icons/flat_icons/ic-excel.svg";
import IcFile from "@/assets/icons/flat_icons/ic-file.svg";
import IcFolder from "@/assets/icons/flat_icons/ic-folder.svg";
import IcImg from "@/assets/icons/flat_icons/ic-img.svg";
import IcPdf from "@/assets/icons/flat_icons/ic-pdf.svg";
import IcPpt from "@/assets/icons/flat_icons/ic-power_point.svg";
import IcPsd from "@/assets/icons/flat_icons/ic-psd.svg";
import IcTxt from "@/assets/icons/flat_icons/ic-txt.svg";
import IcVideo from "@/assets/icons/flat_icons/ic-video.svg";
import IcWord from "@/assets/icons/flat_icons/ic-word.svg";
import IcZip from "@/assets/icons/flat_icons/ic-zip.svg";

const iconMap: Record<string, string> = {
    ai: IcAi,
    eps: IcAi,
    mp3: IcAudio,
    wav: IcAudio,
    mp4: IcVideo,
    mov: IcVideo,
    jpg: IcImg,
    jpeg: IcImg,
    gif: IcImg,
    png: IcImg,
    svg: IcImg,
    pdf: IcPdf,
    doc: IcWord,
    docx: IcWord,
    odt: IcDocument,
    rtf: IcDocument,
    txt: IcTxt,
    xls: IcExcel,
    xlsx: IcExcel,
    csv: IcExcel,
    ppt: IcPpt,
    pptx: IcPpt,
    psd: IcPsd,
    zip: IcZip,
    rar: IcZip,
    tar: IcZip,
    gz: IcZip,
};

export function FileIcon({ ext }: { ext: string }) {
    const lower = ext.toLowerCase();
    const src = iconMap[lower] ?? (lower === "" ? IcFolder : IcFile); //explica essa logica aqui
    return <img src={src} alt={lower ? `${lower} icon` : "folder icon"} style={{ width: 42, height: 42 }} />;
}
