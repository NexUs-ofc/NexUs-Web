import { MdOutlineRestaurant, MdOutlineWarningAmber } from "react-icons/md";
import ProductRankingCard from "../ProductRankingCard";
import { useProductRanking } from "../../hooks/useProductRanking";

/** Os dois rankings de produtos do dashboard, cada um com seu próprio filtro de UF. */
export default function ProductRankingsGrid() {
    const registered = useProductRanking("registered");
    const expired = useProductRanking("expired");

    return (
        <div className="dashboard-product-rankings">
            <ProductRankingCard
                title="Top 5 Alimentos Mais Registrados"
                subtitle="Produtos com mais cadastros no estoque."
                icon={<MdOutlineRestaurant />}
                state={registered.state}
                items={registered.items}
                loading={registered.loading}
                error={registered.error}
                emptyMessage="Nenhum produto registrado para este filtro."
                onStateChange={registered.setState}
            />
            <ProductRankingCard
                title="Top 5 Alimentos Mais Vencidos"
                subtitle="Produtos com mais ocorrências de vencimento."
                icon={<MdOutlineWarningAmber />}
                state={expired.state}
                items={expired.items}
                loading={expired.loading}
                error={expired.error}
                emptyMessage="Nenhum registro de vencimento para este filtro."
                onStateChange={expired.setState}
            />
        </div>
    );
}
