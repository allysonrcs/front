export const getFormData = function (obj: any, form?: any, namespace?: string) {
    var fd = form || new FormData();
    var formKey;

    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (namespace) {
                formKey = namespace + "[" + property + "]";
            } else {
                formKey = property;
            }

            if (typeof obj[property] === "object" && !(obj[property] instanceof File)) {
                getFormData(obj[property], fd, property);
            } else if (obj[property] instanceof File) {
                if (formKey.indexOf("[") !== -1) {
                    formKey = formKey.slice(0, formKey.indexOf("["));
                }

                fd.append(formKey, obj[property]);
            } else {
                fd.append(formKey, obj[property]);
            }
        }
    }

    return fd;
};
