import api from "./api";
const baseUrl = "/document-files";

export function donwloadImageBanner(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}/file_image_banner`, { responseType: "arraybuffer" })
            .then((res) => {
                resolve(res);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
