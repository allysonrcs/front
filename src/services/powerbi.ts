import api from "./api";

const baseUrl = "/powerbi";

type IFetchEmbedConfigPowerBi = {
    embedToken: string;
    embedUrl: string;
    reportId: string;
} | null;

export function getEmbedConfig(id: number): Promise<IFetchEmbedConfigPowerBi> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
