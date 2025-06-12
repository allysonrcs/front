import { BoxMain } from "@/components/Box/BoxMain";
import { ProductivityDailyFields } from "./ProductivityDailyFields";

export function ProductivityDaily() {
    return (
        <BoxMain title='Cadastro de Produtividade Diária' goBack={true}>
            <ProductivityDailyFields />
        </BoxMain>
    );
}
