import { BoxMain } from "@/components/Box/BoxMain";
import { ProductsModalitiesFields } from "./ProductsModalitiesFields";

export function ProductsModalities() {
    return (
        <BoxMain title='Cadastro de Modalidade do Produto' goBack={true}>
            <ProductsModalitiesFields />
        </BoxMain>
    );
}
