export function generateColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

interface IListUser {
    user?: number;
    color?: string;
}

export class generateColorClass {
    private listUser: IListUser[] = [];

    generateColor(id: number) {
        if (this.listUser.length === 0) {
            this.listUser = [{ user: id, color: generateColor() }];
        }
    }
}

export const createHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return hash;
};

export const generateColorByString = (str: string) => {
    const hash = createHash(str);

    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += ("00" + value.toString(16)).substr(-2);
    }

    return colour;
};
