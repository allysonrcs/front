import api from "./api";
const baseUrl = "/employees";

export const uploadImageProfile = (data: FormData) => {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/image-profile`, data)
            .then((response) => resolve(response.data))
            .catch(reject);
    });
};
