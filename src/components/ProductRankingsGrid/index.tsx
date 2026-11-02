import { MdOutlineRestaurant, MdOutlineWarningAmber } from "react-icons/md";
import ProductRankingCard from "../ProductRankingCard";
import { useProductRanking } from "../../hooks/useProductRanking";

/** Os dois rankings de produtos do dashboard, cada um com seu próprio filtro de UF. */
export default function ProductRankingsGrid() {
    const consumed = useProductRanking("registered");
    const expired = useProductRanking("expired");

    return (
        <div className="dashboard-product-rankings">
            <ProductRankingCard
                title="Top 5 Alimentos Mais Consumidos"
                subtitle="Produtos com maior registro de consumo no período."
                icon={<MdOutlineRestaurant />}
                state={consumed.state}
                items={consumed.items}
                loading={consumed.loading}
                error={consumed.error}
                emptyMessage="Nenhum registro de consumo para este filtro."
                onStateChange={consumed.setState}
            />
            <ProductRankingCard
                title="Top 5 Alimentos Mais Vencidos"
                subtitle="Produtos que mais venceram no período."
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
