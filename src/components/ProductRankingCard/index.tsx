import { useId } from "react";
import type { ReactNode } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import type { RankedProduct } from "../../types/rankings";
import { BRAZILIAN_STATES, BRAZILIAN_STATE_NAMES } from "../../utils/validateStore";
import { formatDashboardNumber } from "../../utils/dashboardFormatters";
import LoadingSpinner from "../LoadingSpinner";
import ErrorAlert from "../ErrorAlert";
import "../../../styles/components/ProductRankingCard/product-ranking-card.css";

export interface ProductRankingCardProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    state: string;
    items: ReadonlyArray<RankedProduct>;
    loading: boolean;
    error: string;
    emptyMessage: string;
    onStateChange: (state: string) => void;
}

export default function ProductRankingCard({
    title, subtitle, icon, state, items, loading, error, emptyMessage, onStateChange,
}: ProductRankingCardProps) {
    const id = useId();
    return (
        <article className="product-ranking-card" aria-labelledby={`${id}-title`} aria-busy={loading}>
            <header className="product-ranking-card__heading">
                <div className="product-ranking-card__title">
                    <span className="product-ranking-card__icon" aria-hidden="true">{icon}</span>
                    <div>
                        <h2 id={`${id}-title`}>{title}</h2>
                        <p>{subtitle}</p>
                    </div>
                </div>
                <div className="product-ranking-card__select">
                    <label className="product-ranking-card__select-label" htmlFor={`${id}-state`}>Filtrar {title} por estado</label>
                    <select id={`${id}-state`} name="state" value={state} onChange={(event) => onStateChange(event.currentTarget.value)}>
                        <option value="">Todos</option>
                        {BRAZILIAN_STATES.map((uf) => <option key={uf} value={uf}>{BRAZILIAN_STATE_NAMES[uf] ?? uf}</option>)}
                    </select>
                    <MdKeyboardArrowDown className="product-ranking-card__select-icon" aria-hidden="true" />
                </div>
            </header>
            <div className="product-ranking-card__body">
                {loading ? <LoadingSpinner message={`Carregando ${title.toLowerCase()}...`} /> : null}
                {!loading && error ? <ErrorAlert message={error} /> : null}
                {(() => {
                    const validItems = items.filter((item) => !/^\d+$/u.test(item.productId));
                    if (loading || error) return null;
                    if (validItems.length === 0) return <p className="product-ranking-card__empty">{emptyMessage}</p>;
                    return (
                        <ol className="product-ranking-card__list">
                            {validItems.map((item, index) => (
                                <li key={`${item.productId}-${index}`} className="product-ranking-card__item">
                                    <span className="product-ranking-card__rank">{index + 1}</span>
                                    <span className="product-ranking-card__name">{item.productId}</span>
                                    <span className="product-ranking-card__score">{formatDashboardNumber(item.score)}</span>
                                </li>
                            ))}
                        </ol>
                    );
                })()}
            </div>
        </article>
    );
}
