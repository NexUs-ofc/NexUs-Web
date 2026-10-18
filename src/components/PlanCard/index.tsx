import "./plan-card.css";

export interface PlanCardProps {
    id: number;
    title: string;
    price: string;
    priceSuffix: string;
    subtitle: string;
    featured: boolean;
    benefits: string[];
    selected: boolean;
    onContract: (planId: number) => void;
}

const CHECK_SVG = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4f2078"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MINUS_SVG = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#737380"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export default function PlanCard({
    id,
    title,
    price,
    priceSuffix,
    subtitle,
    featured,
    benefits,
    selected,
    onContract,
}: PlanCardProps) {
    return (
        <article
            className={`planCard ${featured ? "featured" : ""} ${selected ? "selected" : ""}`}
            aria-pressed={selected}
        >
            <header className="planCardHeader">
                <h2 className="planTitle">{title}</h2>
                <div className="planPriceRow">
                    <span className="planPrice">{price}</span>
                    <span className="planPriceSuffix">{priceSuffix}</span>
                </div>
                <p className="planSubtitle">{subtitle}</p>
                <hr className="planSeparator" />
            </header>
            <div className="planBenefits">
                {benefits.map((benefit) => (
                    <div key={benefit} className={`planBenefit ${!selected ? "notIncluded" : ""}`}>
                        {selected ? <span className="planBenefitIcon">{CHECK_SVG}</span> : <span className="planBenefitIcon">{MINUS_SVG}</span>}
                        <p className="planBenefitText">{benefit}</p>
                    </div>
                ))}
            </div>
            <button
                type="button"
                className="planButton"
                onClick={() => onContract(id)}
                aria-label={`Contratar o plano ${title}`}
            >
                Contratar Plano
            </button>
        </article>
    );
}
