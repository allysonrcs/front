import { Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Chart } from "@/components/Charts/ECharts/chart";
import { IListCooperatedPanel } from "@/services/reports";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { formatNumberWithThousandsSeparator } from "@/functions/number";
import * as echarts from "echarts";
import { ECBasicOption } from "echarts/types/dist/shared";
import "moment/dist/locale/pt-br";
import moment from "moment";

interface DataChartsPanelCooperatedProps {
    dataChart: IListCooperatedPanel[];
    colorBorderSystem: string;
    themeContext: string;
}

export function ChartsBusinessPanelCooperated({
    dataChart,
    colorBorderSystem,
    themeContext,
}: DataChartsPanelCooperatedProps) {
    const themeUI = useTheme();
    const isMobile = useMediaQuery(themeUI.breakpoints.down("sm"));

    moment.locale("pt-br");

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const clienteTipoData = dataChart.reduce(
        (acc, item) => {
            acc[item.cliente_tipo] = (acc[item.cliente_tipo] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalClientes = Object.values(clienteTipoData).reduce((sum, val) => sum + val, 0);

    const colorClientes: Record<string, string> = {
        PF: "#7DB61C",
        PJ: "#009688",
        MEI: "#e9c80b",
        PR: "#49479d",
    };

    const clienteTipoOptions: ECBasicOption = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const percent = ((params.value / totalClientes) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição por Tipo de Cooperado", left: "center" },
        legend: {
            bottom: "0%",
            left: "center",
            formatter: (name: string) => name,
        },
        series: [
            {
                type: "pie",
                radius: ["30%", "55%"],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: themeUI.palette.text.primary,
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                    color: themeUI.palette.text.secondary,
                },
                data: Object.entries(clienteTipoData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: colorClientes[key] ? { color: colorClientes[key] } : undefined,
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_por_tipo_coop", show: true },
            },
        },
    };

    const associadosData = dataChart.reduce(
        (acc, item) => {
            const key = item.e_cooperado ? "Associado" : "Não Associado";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const eRuralData = dataChart.reduce(
        (acc, item) => {
            const key = item.e_rural ? "Rural" : "Não é Rural";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalAssociado = Object.values(associadosData).reduce((sum, val) => sum + val, 0);
    const totalRural = Object.values(eRuralData).reduce((sum, val) => sum + val, 0);

    const colorAssociado: Record<string, string> = {
        Associado: "#7DB61C",
        "Não Associado": "#FF6723",
    };

    const colorRural: Record<string, string> = {
        Rural: "#4CAF50",
        "Não é Rural": "#49479d",
    };

    const associadoVSRuralOptions: ECBasicOption = {
        title: [{ text: "Distribuição por Associados e Rural", left: "center" }],
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const total = params.seriesName === "Distribuição de Associados" ? totalAssociado : totalRural;
                const percent = ((params.value / total) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        legend: {
            bottom: "0%",
            left: "center",
            formatter: (name: string) => name,
        },
        series: [
            {
                name: "Distribuição de Associados",
                type: "pie",
                radius: ["20%", "35%"],
                center: ["33%", "55%"],
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: themeUI.palette.text.primary,
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                },
                labelLine: {
                    show: true,
                    length: 6,
                    length2: 6,
                },
                data: Object.entries(associadosData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: { color: colorAssociado[key] },
                })),
            },
            {
                name: "Distribuição Rural",
                type: "pie",
                radius: ["20%", "35%"],
                center: ["73%", "55%"],
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: themeUI.palette.text.primary,
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                },
                labelLine: {
                    show: true,
                    length: 6,
                    length2: 6,
                },
                data: Object.entries(eRuralData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: { color: colorRural[key] },
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_dist_associados_e_rural", show: true },
            },
        },
    };

    const contaData = dataChart.reduce(
        (acc, item) => {
            const key = item.cc_sitconta ?? "NÃO IDENTIFICADO";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalContaData = Object.values(contaData).reduce((sum, val) => sum + val, 0);

    const contaColors: Record<string, string> = {
        ATIVA: "#7DB61C",
        INATIVA: "#009688",
        ENCERRADA: "#e9c80b",
        BLOQUEADA: "#dc2626",
        "NÃO IDENTIFICADO": "#49479d",
    };

    const contaOptions: ECBasicOption = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const percent = ((params.value / totalContaData) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },

            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        legend: {
            bottom: "0%",
            left: "center",
            itemWidth: 14,
            itemHeight: 12,
            formatter: (name: string) => name,
        },
        title: { text: "Situação da Conta Corrente", left: "center" },
        series: [
            {
                type: "pie",
                radius: ["25%", "50%"],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: themeUI.palette.text.primary,
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                    color: themeUI.palette.text.secondary,
                },
                data: Object.entries(contaData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: contaColors[key] ? { color: contaColors[key] } : undefined,
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_situacao_conta_corrente", show: true },
            },
        },
    };

    const perfilData = dataChart.reduce(
        (acc, item) => {
            acc[item.cliente_perfil] = (acc[item.cliente_perfil] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalPerfilClientes = Object.values(perfilData).reduce((sum, val) => sum + val, 0);

    const colorPerfis: Record<string, string> = {
        "Médias PJ": "#009688",
        "Varejo PF": "#7DB61C",
        "Relacionamento PF": "#e9c80b",
        "MEI PJ": "#49479d",
    };

    const perfilOptions: ECBasicOption = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const percent = ((params.value / totalPerfilClientes) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição por Tipo de Perfil", left: "center" },
        legend: {
            bottom: "0%",
            left: "center",
            itemWidth: 12,
            itemHeight: 12,
            formatter: (name: string) => name,
        },
        series: [
            {
                type: "pie",
                radius: ["20%", "45%"],
                top: "-16%",
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                        color: themeUI.palette.text.primary,
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                    color: themeUI.palette.text.secondary,
                },
                data: Object.entries(perfilData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: colorPerfis[key] ? { color: colorPerfis[key] } : undefined,
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_tipo_perfil", show: true },
            },
        },
    };

    const mapGenero: Record<string, string> = {
        F: "Feminino",
        M: "Masculino",
        N: "Não Informado",
    };

    const generoData = dataChart.reduce(
        (acc, item) => {
            const generoFormatado = mapGenero[item.cliente_sexo] || "Não se Aplica";
            acc[generoFormatado] = (acc[generoFormatado] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalGeneroClientes = Object.values(generoData).reduce((sum, val) => sum + val, 0);

    const generoColor: Record<string, string> = {
        Masculino: "#009688",
        Feminino: "#7DB61C",
        "Não Informado": "#e9c80b",
        "Não se Aplica": "#49479d",
    };

    const generoOptions: ECBasicOption = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const percent = ((params.value / totalGeneroClientes) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}% `;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição por Gênero", left: "center" },
        legend: {
            bottom: "0%",
            left: "center",
            formatter: (name: string) => name.split(" - ")[0],
        },
        series: [
            {
                type: "pie",
                radius: ["35%", "60%"],
                top: "0%",
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                    color: themeContext === "light" ? "#011216" : "#ffffff",
                },
                data: Object.entries(generoData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: generoColor[key] ? { color: generoColor[key] } : undefined,
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_por_genero", show: true },
            },
        },
    };

    const estadoCivilData = dataChart.reduce(
        (acc, item) => {
            acc[item.cliente_estadocivl] = (acc[item.cliente_estadocivl] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalEstadoCivilClientes = Object.values(estadoCivilData).reduce((sum, val) => sum + val, 0);

    const colorEstadoCivil: Record<string, string> = {
        "Médias PJ": "#009688",
        "Varejo PF": "#7DB61C",
        "Relacionamento PF": "#e9c80b",
        "MEI PJ": "#49479d",
    };

    const estadoCivilOptions: ECBasicOption = {
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const percent = ((params.value / totalEstadoCivilClientes) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição por Estado Civil", left: "center" },
        legend: {
            bottom: "0%",
            left: "center",
            itemWidth: 14,
            itemHeight: 14,
            formatter: (name: string) => name,
        },
        series: [
            {
                type: "pie",
                radius: ["25%", "50%"],
                top: "-12%",
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: themeContext === "light" ? "#ffffff" : "#00161b",
                    borderWidth: 2,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: "bold",
                    },
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${formatNumberWithThousandsSeparator(params.value)}`,
                    fontSize: 12,
                    color: themeContext === "light" ? "#011216" : "#ffffff",
                },
                data: Object.entries(estadoCivilData).map(([key, value]) => ({
                    name: key,
                    value,
                    itemStyle: colorEstadoCivil[key] ? { color: colorEstadoCivil[key] } : undefined,
                })),
            },
        ],
        toolbox: {
            top: "40%",
            orient: "vertical",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_por_estado_civil", show: true },
            },
        },
    };

    const relacaoData = dataChart.reduce(
        (acc, item) => {
            const year = new Date(item.cliente_relacionamento).getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        },
        {} as Record<number, number>,
    );

    const totalCooperadosAno = Object.values(relacaoData).reduce((sum, val) => sum + val, 0);

    const relacaoOptions: ECBasicOption = {
        animationDuration: 750,
        title: { text: "Novos Cooperados por Ano", left: "center" },
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const formattedValue = formatNumberWithThousandsSeparator(params.value);
                const percent = ((params.value / totalCooperadosAno) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formattedValue} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        grid: {
            left: "0.5%",
            right: "4%",
            top: "20%",
            bottom: "15%",
            containLabel: true,
        },
        xAxis: { type: "category", data: Object.keys(relacaoData) },
        yAxis: { type: "value", splitLine: { show: false } },
        series: [
            {
                type: "line",
                data: Object.values(relacaoData),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#009688",
                },
                markLine: {
                    data: [{ type: "average", name: "Média" }],
                },
                symbol: "circle",
                symbolSize: 8,
                itemStyle: {
                    color: "#0da797 ",
                    borderColor: "#088578",
                    borderWidth: 1,
                },
                label: {
                    show: true,
                    position: "top",
                    formatter: (params: any) => formatNumberWithThousandsSeparator(params.value),
                    color: themeUI.palette.text.primary,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "#03534b7b" },
                            { offset: 1, color: "#03534b13" },
                        ],
                    },
                },
            },
        ],
        toolbox: {
            bottom: "-2%",
            orient: "horizontal",
            feature: {
                magicType: {
                    type: ["line", "bar"],
                    title: {
                        line: "Mudar para gráfico de linhas",
                        bar: "Mudar para gráfico de barras",
                    },
                    show: true,
                },
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                restore: { title: "Restaurar gráfico padrão", show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_coop_por_ano", show: true },
            },
        },
    };

    const novosCooperadosEsteMesData = dataChart.reduce(
        (acc, item) => {
            const date = new Date(item.cliente_relacionamento);
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                const day = date.getDate().toString().padStart(2, "0");
                acc[day] = (acc[day] || 0) + 1;
            }
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalCooperadoEsteMes = Object.values(novosCooperadosEsteMesData).reduce((sum, val) => sum + val, 0);

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const novosCooperadosMesAnteriorData = dataChart.reduce(
        (acc, item) => {
            const date = new Date(item.cliente_relacionamento);
            if (date.getFullYear() === currentYear && date.getMonth() === previousMonth) {
                const day = date.getDate().toString().padStart(2, "0");
                acc[day] = (acc[day] || 0) + 1;
            }
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalCooperadoMesPassado = Object.values(novosCooperadosMesAnteriorData).reduce((sum, val) => sum + val, 0);

    const diasOrdenados = Array.from(
        new Set([...Object.keys(novosCooperadosEsteMesData), ...Object.keys(novosCooperadosMesAnteriorData)]),
    ).sort((a, b) => Number(a) - Number(b));

    const nameCurrentMonth = moment().month(currentMonth).format("MMMM");
    const namePreviousMonth = moment().month(previousMonth).format("MMMM");

    const nameCurrentMonthUpper = nameCurrentMonth.charAt(0).toUpperCase() + nameCurrentMonth.slice(1);
    const namePreviousMonthUpper = namePreviousMonth.charAt(0).toUpperCase() + namePreviousMonth.slice(1);

    const novosCooperadosOptions: ECBasicOption = {
        animationDuration: 750,
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const total =
                    params.seriesName === `${nameCurrentMonthUpper}` ? totalCooperadoEsteMes : totalCooperadoMesPassado;
                const percent = ((params.value / total) * 100).toFixed(2);
                return `${params.marker} ${params.name}: ${formatNumberWithThousandsSeparator(params.value)} | ${percent}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: {
            text: !isMobile
                ? `Novos Cooperados por Dia - ${nameCurrentMonthUpper} vs ${namePreviousMonthUpper}`
                : "Novos Cooperados",
            left: "center",
        },
        xAxis: {
            type: "category",
            data: diasOrdenados,
        },
        yAxis: { type: "value", splitLine: { show: false } },
        grid: {
            left: "0.5%",
            right: "1%",
            top: "20%",
            bottom: !isMobile ? "15%" : "20%",
            containLabel: true,
        },
        legend: {
            bottom: "0%",
            left: !isMobile ? "center" : "left",
            data: [`${nameCurrentMonthUpper}`, `${namePreviousMonthUpper}`],
            formatter: (name: string) => {
                let value = 0;
                let average = 0;

                if (name === `${nameCurrentMonthUpper}`) {
                    value = totalCooperadoEsteMes;
                    average = totalCooperadoEsteMes / diasOrdenados.length;
                } else if (name === `${namePreviousMonthUpper}`) {
                    value = totalCooperadoMesPassado;
                    average = totalCooperadoMesPassado / diasOrdenados.length;
                }
                return `${name}: ${formatNumberWithThousandsSeparator(value)} | Média: ${average.toFixed(2)}`;
            },
        },
        series: [
            {
                name: `${nameCurrentMonthUpper}`,
                type: "line",
                data: diasOrdenados.map((day) => novosCooperadosEsteMesData[day] || 0),
                lineStyle: {
                    width: 3,
                    color: "#7DB61C",
                },
                label: {
                    show: true,
                    position: "top",
                    fontWeight: "bold",
                    color: "#7DB61C",
                },
                connectNulls: true,
                symbol: "circle",
                symbolSize: 8,
                itemStyle: {
                    color: "#98ce3b",
                    borderColor: "#679c0e",
                    borderWidth: 1,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "#7eb61c7b" },
                            { offset: 1, color: "#7eb61c1d" },
                        ],
                    },
                },
            },
            {
                name: `${namePreviousMonthUpper}`,
                type: "line",
                data: diasOrdenados.map((day) => novosCooperadosMesAnteriorData[day] || 0),
                lineStyle: {
                    width: 3,
                    color: "#FF6723",
                },
                label: {
                    show: true,
                    position: "top",
                    fontWeight: "bold",
                    color: "#FF6723",
                },
                connectNulls: true,
                symbol: "circle",
                symbolSize: 8,
                itemStyle: {
                    color: "#FF6723",
                    borderColor: "#e34b36",
                    borderWidth: 1,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "#FF67237b" },
                            { offset: 1, color: "#FF672313" },
                        ],
                    },
                },
            },
        ],
        toolbox: {
            bottom: "-2%",
            orient: "horizontal",
            feature: {
                magicType: {
                    show: true,
                    type: ["line", "bar", "stack"],
                    title: {
                        line: "Mudar para gráfico de linhas",
                        bar: "Mudar para gráfico de barras",
                        stack: "Empilhar",
                    },
                },
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                restore: { title: "Restaurar gráfico padrão", show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_coop_por_mes", show: true },
            },
        },
    };

    const cooperadosAgenciaData = dataChart.reduce(
        (acc, item) => {
            const agencia = item.agencia_nome ?? "Não Identificado";

            if (!acc[agencia]) {
                acc[agencia] = { cooperados: 0, naoCooperados: 0 };
            }

            if (item.e_cooperado) {
                acc[agencia].cooperados += 1;
            } else {
                acc[agencia].naoCooperados += 1;
            }

            return acc;
        },
        {} as Record<string, { cooperados: number; naoCooperados: number }>,
    );

    const totalGeralAgencia = Object.values(cooperadosAgenciaData).reduce(
        (sum, { cooperados, naoCooperados }) => sum + cooperados + naoCooperados,
        0,
    );

    const sortedAgencias = Object.entries(cooperadosAgenciaData).sort(
        (a, b) => a[1].cooperados + a[1].naoCooperados - (b[1].cooperados + b[1].naoCooperados),
    );

    const agenciaOptions: ECBasicOption = {
        animationDuration: 750,
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params: any) => {
                const agencia = params[0].axisValue;
                const cooperados = formatNumberWithThousandsSeparator(params[0].value);
                const naoCooperados = formatNumberWithThousandsSeparator(params[1].value);
                const totalCooperados = params[0].value + params[1].value;
                const totalFormatted = formatNumberWithThousandsSeparator(totalCooperados);

                const percentCooperados = ((params[0].value / totalCooperados) * 100).toFixed(2);
                const percentNaoCooperados = ((params[1].value / totalCooperados) * 100).toFixed(2);
                const percentAgenciaSobreGeral = ((totalCooperados / totalGeralAgencia) * 100).toFixed(2);

                return `
                    <b>${agencia}</b><br/>
                    💚 Cooperados: ${cooperados} | ${percentCooperados}%<br/>
                    🟠 Não Cooperados: ${naoCooperados} | ${percentNaoCooperados}%<br/>
                    ⚫ Total: ${totalFormatted} | ${percentAgenciaSobreGeral}%
                `;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição de Cooperados por Agência", left: "center" },
        legend: { bottom: "0%", left: "3%" },
        xAxis: { type: "value" },
        yAxis: {
            type: "category",
            data: sortedAgencias.map(([key]) => key),
            axisLabel: {
                fontSize: 11,
                interval: 0,
            },
        },
        grid: {
            left: "2%",
            right: "5%",
            bottom: "10%",
            containLabel: true,
        },
        series: [
            {
                name: "Cooperados",
                type: "bar",
                stack: "total",
                data: sortedAgencias.map(([_, values]) => values.cooperados),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#43dd90" },
                        { offset: 0.5, color: "#23cf79" },
                        { offset: 1, color: "#08ac5a" },
                    ]),
                },
                label: { show: false },
            },
            {
                name: "Não Cooperados",
                type: "bar",
                stack: "total",
                data: sortedAgencias.map(([_, values]) => values.naoCooperados),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#e9723b" },
                        { offset: 0.5, color: "#FF6723" },
                        { offset: 1, color: "#e05515" },
                    ]),
                },
                label: { show: false },
            },
            {
                name: "Total",
                type: "bar",
                barGap: "-100%",
                data: sortedAgencias.map(([_, values]) => values.cooperados + values.naoCooperados),
                itemStyle: { color: "transparent" },
                label: {
                    show: true,
                    position: "outside",
                    formatter: (params: any) => formatNumberWithThousandsSeparator(params.value),
                    fontWeight: "bold",
                    color: themeUI.palette.text.primary,
                },
            },
        ],
        toolbox: {
            bottom: "-1%",
            orient: "horizontal",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                restore: { title: "Restaurar gráfico padrão", show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_coop_por_agencia", show: true },
            },
        },
    };

    const idadeData = dataChart
        .filter((item) => ["PF", "PR"].includes(item.cliente_tipo))
        .reduce(
            (acc, item) => {
                const age = new Date().getFullYear() - new Date(item.cliente_nascimento).getFullYear();
                acc[age] = (acc[age] || 0) + 1;
                return acc;
            },
            {} as Record<number, number>,
        );

    const sortedIdades = Object.keys(idadeData)
        .map(Number)
        .sort((a, b) => a - b);

    const totalPessoas = Object.values(idadeData).reduce((sum, val) => sum + val, 0);
    const somaIdades = Object.entries(idadeData).reduce((sum, [age, count]) => sum + Number(age) * count, 0);
    const idadeMedia = somaIdades / totalPessoas;
    const maxQuantidade = Math.max(...Object.values(idadeData));
    const yMedia = maxQuantidade / 2;

    const idadeOptions: ECBasicOption = {
        tooltip: {
            trigger: "axis",
            formatter: (params: any) => {
                const idade = params[0].axisValue;
                const quantidade = formatNumberWithThousandsSeparator(params[0].value);
                const percentual = ((params[0].value / totalPessoas) * 100).toFixed(2);
                return `Idade: ${idade}<br/>Quantidade: ${quantidade}<br/>Percentual : ${percentual}%`;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: {
            text: "Distribuição de Cooperados por Idade",
            subtext: !isMobile
                ? "Apenas cooperados com tipo 'PF' (Pessoa Física) e 'PR' (Produtor Rural) foram considerados"
                : "Apenas 'PF' e 'PR' foram considerados",
            left: "center",
        },
        grid: {
            left: "1%",
            right: "4%",
            bottom: "11%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            data: sortedIdades.map(String),
            name: "Idade",
        },
        yAxis: { type: "value", name: "Quantidade" },
        series: [
            {
                type: "bar",
                data: sortedIdades.map((age) => idadeData[age]),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#43dd90" },
                        { offset: 0.5, color: "#23cf79" },
                        { offset: 1, color: "#08ac5a" },
                    ]),
                },
                label: {
                    show: false,
                    position: "top",
                    formatter: (params: any) => params.value,
                    fontWeight: "bold",
                    color: "#ffffff",
                },
            },
            {
                name: "Média de Idade",
                type: "line",
                data: Array(sortedIdades.length).fill(yMedia),
                lineStyle: {
                    type: "dashed",
                    color: themeContext === "light" ? "#025e70" : "#c9d200",
                    width: 2,
                    opacity: 0.7,
                },
                symbol: "none",
                label: {
                    show: true,
                    position: "bottom",
                    formatter: `Idade Média: ${idadeMedia.toFixed(1)}`,
                    color: themeContext === "light" ? "#025e70" : "#c9d200",
                    fontWeight: "bold",
                    fontSize: 13,
                    opacity: 0.8,
                },
            },
        ],
        toolbox: {
            bottom: "-2%",
            left: "0%",
            orient: "horizontal",
            feature: {
                magicType: {
                    type: ["line"],
                    title: {
                        line: "Mudar para gráfico de linhas",
                    },
                    show: true,
                },
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                restore: { title: "Restaurar gráfico padrão", show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_coop_por_idade", show: true },
            },
        },
    };

    const cooperadosCarteiraData = dataChart.reduce(
        (acc, item) => {
            const carteira = item.carteira_nome ?? "Não Identificado";

            if (!acc[carteira]) {
                acc[carteira] = { cooperados: 0, naoCooperados: 0 };
            }

            if (item.e_cooperado) {
                acc[carteira].cooperados += 1;
            } else {
                acc[carteira].naoCooperados += 1;
            }

            return acc;
        },
        {} as Record<string, { cooperados: number; naoCooperados: number }>,
    );

    const totalGeralCarteira = Object.values(cooperadosCarteiraData).reduce(
        (sum, { cooperados, naoCooperados }) => sum + cooperados + naoCooperados,
        0,
    );

    const sortedCarteiras = Object.entries(cooperadosCarteiraData).sort(
        (a, b) => a[1].cooperados + a[1].naoCooperados - (b[1].cooperados + b[1].naoCooperados),
    );

    const carteiraOptions: ECBasicOption = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params: any) => {
                const carteira = params[0].axisValue;
                const cooperados = params[0].value;
                const naoCooperados = params[1].value;
                const totalCooperados = cooperados + naoCooperados;

                const percentCooperados = ((cooperados / totalCooperados) * 100).toFixed(2);
                const percentNaoCooperados = ((naoCooperados / totalCooperados) * 100).toFixed(2);

                const formattedCooperados = formatNumberWithThousandsSeparator(cooperados);
                const formattedNaoCooperados = formatNumberWithThousandsSeparator(naoCooperados);
                const formattedTotalCooperados = formatNumberWithThousandsSeparator(totalCooperados);
                const percentCarteiraSobreGeral = ((totalCooperados / totalGeralCarteira) * 100).toFixed(2);

                return `
                    <b>${carteira}</b><br/>
                    💚 Cooperados: ${formattedCooperados} | ${percentCooperados}%<br/>
                    🟠 Não Cooperados: ${formattedNaoCooperados} | ${percentNaoCooperados}%<br/>
                    ⚫ Total: ${formattedTotalCooperados} | ${percentCarteiraSobreGeral}%
                `;
            },
            textStyle: {
                color: themeContext === "light" ? "#011216" : "#ffffff",
            },
            backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        },
        title: { text: "Distribuição de Cooperados por Carteira", left: "center" },
        legend: { bottom: "0%", left: "3%" },
        grid: {
            left: "0%",
            right: "5%",
            bottom: "10%",
            containLabel: true,
        },
        xAxis: { type: "value" },
        yAxis: {
            type: "category",
            data: sortedCarteiras.map(([key]) => key),
            axisLabel: {
                fontSize: 11,
                interval: 0,
            },
        },
        series: [
            {
                name: "Cooperados",
                type: "bar",
                stack: "total",
                data: sortedCarteiras.map(([_, values]) => values.cooperados),
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#43dd90" },
                    { offset: 0.5, color: "#23cf79" },
                    { offset: 1, color: "#08ac5a" },
                ]),
                label: { show: false },
            },
            {
                name: "Não Cooperados",
                type: "bar",
                stack: "total",
                data: sortedCarteiras.map(([_, values]) => values.naoCooperados),
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "#e9723b" },
                    { offset: 0.5, color: "#FF6723" },
                    { offset: 1, color: "#e05515" },
                ]),
                label: { show: false },
            },
            {
                name: "Total",
                type: "bar",
                barGap: "-100%",
                data: sortedCarteiras.map(([_, values]) => values.cooperados + values.naoCooperados),
                itemStyle: { color: "transparent" },
                label: {
                    show: true,
                    position: "outside",
                    formatter: (params: any) => formatNumberWithThousandsSeparator(params.value),
                    fontWeight: "bold",
                    color: themeUI.palette.text.primary,
                },
            },
        ],
        toolbox: {
            bottom: "-1%",
            orient: "horizontal",
            feature: {
                dataView: { title: "Dados do gráfico", readOnly: true, show: true },
                restore: { title: "Restaurar gráfico padrão", show: true },
                saveAsImage: { title: "Salvar Imagem", type: "png", name: "chart_coop_por_carteira", show: true },
            },
        },
    };

    const sxStyleProps = {
        border: `1px solid ${colorBorderSystem}`,
        borderRadius: 4,
        backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
        backdropFilter: "blur(50px)",
        p: 1,
        mb: 2,
    };

    return (
        <Grid container spacing={0} justifyContent='center'>
            {dataChart.length ? (
                <>
                    <Grid item xs={12} md={3.95} height={320} sx={sxStyleProps}>
                        <Chart options={clienteTipoOptions} height={300} />
                    </Grid>

                    <Grid item md={0.1} />

                    <Grid item xs={12} md={3.85} height={320} sx={sxStyleProps}>
                        <Chart options={associadoVSRuralOptions} height={300} />
                    </Grid>

                    <Grid item md={0.1} />

                    <Grid item xs={12} md={3.95} height={320} sx={sxStyleProps}>
                        <Chart options={contaOptions} height={300} />
                    </Grid>

                    <Grid item xs={12} md={3.95} height={380} sx={sxStyleProps}>
                        <Chart options={generoOptions} height={360} />
                    </Grid>

                    <Grid item md={0.1} />

                    <Grid item xs={12} md={3.85} height={380} sx={sxStyleProps}>
                        <Chart options={estadoCivilOptions} height={360} />
                    </Grid>

                    <Grid item md={0.1} />

                    <Grid item xs={12} md={3.95} height={380} sx={sxStyleProps}>
                        <Chart options={perfilOptions} height={360} />
                    </Grid>

                    <Grid item xs={12} md={12} height={280} sx={sxStyleProps}>
                        <Chart options={novosCooperadosOptions} height={260} />
                    </Grid>

                    <Grid item xs={12} md={12} height={280} sx={sxStyleProps}>
                        <Chart options={relacaoOptions} height={260} />
                    </Grid>

                    <Grid item xs={12} md={5.95} height={535} sx={sxStyleProps}>
                        <Chart options={agenciaOptions} height={510} />
                    </Grid>

                    <Grid item md={0.1} />

                    <Grid item xs={12} md={5.95} height={535} sx={sxStyleProps}>
                        <Chart options={carteiraOptions} height={510} />
                    </Grid>

                    <Grid item xs={12} md={12} height={280} sx={sxStyleProps}>
                        <Chart options={idadeOptions} height={260} />
                    </Grid>
                </>
            ) : (
                <Grid
                    item
                    xs={12}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px dashed ${colorBorderSystem}`,
                        borderRadius: 4,
                        backgroundColor: themeContext === "light" ? "#ffffff" : "#00161b",
                        backdropFilter: "blur(50px)",
                        height: "200px",
                        mt: 3,
                        mb: 2,
                    }}>
                    <VisibilityOffOutlinedIcon color='primary' sx={{ fontSize: 40, mb: 1 }} />
                    <Typography color='text.secondary' sx={{ textAlign: "center" }}>
                        Nenhum dado de cooperado foi encontrado. Por favor, aplique um novo filtro na listagem para
                        visualizar o relatório.
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
}
