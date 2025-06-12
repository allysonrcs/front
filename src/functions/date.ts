import moment from "moment";

export function durationAsString(start: string | Date, end: string | Date) {
    const duration = moment.duration(moment(end).diff(moment(start)));

    const days = Math.floor(duration.asDays());
    const daysFormatted = days ? `${days}d ` : "";

    const hours = duration.hours();
    const hoursFormatted = `${hours}h `;

    const minutes = duration.minutes();
    const minutesFormatted = `${minutes}min`;

    return [daysFormatted, hoursFormatted, minutesFormatted].join("");
}

export function getNameDay(index: number): string {
    let week = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

    if (!week[index]) {
        return "Dia inválido.";
    }

    return week[index];
}

export function isValidDate(date: string | Date, format: string): boolean {
    return moment(date, format, true).isValid();
}

export function formatDate(date: string | Date, format: string): string {
    const parsedDate = moment(date);

    if (!parsedDate.isValid()) {
        return "";
    }

    return parsedDate.format(format);
}

export const date = (date: string) => {
    let today = moment(new Date());
    if (moment(moment(date).format("YYYY-MM-DD")).isSame(moment(today).format("YYYY-MM-DD"), "day")) {
        return moment(date, "YYYY-MM-DD HH:mm").format("HH:mm");
    } else if (moment(date).add(7, "days").isBefore(today)) {
        return moment(date, "YYYY-MM-DD HH:mm").format("DD/MM/YYYY");
    } else {
        return moment(date).format("dddd");
    }
};

export function formatTimeAgo(dateString: string): string {
    const now = moment();
    const then = moment(dateString);
    const diffInSeconds = now.diff(then, "seconds");
    if (diffInSeconds < 60) {
        return `${diffInSeconds} s`;
    }

    const diffInMinutes = now.diff(then, "minutes");
    if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
    }

    const diffInHours = now.diff(then, "hours");
    if (diffInHours < 24) {
        return `${diffInHours} h`;
    }

    const diffInDays = now.diff(then, "days");
    if (diffInDays < 7) {
        return `${diffInDays} d`;
    }

    const diffInWeeks = now.diff(then, "weeks");
    if (diffInWeeks < 4) {
        return `${diffInWeeks} sem`;
    }

    const diffInMonths = now.diff(then, "months");
    if (diffInMonths < 12) {
        return `${diffInMonths} m`;
    }

    const diffInYears = now.diff(then, "years");
    return `${diffInYears} a`;
}
