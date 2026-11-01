import "../../../styles/components/PlanCard/plan-card.css";

export interface PlanCardProps {
    id: number;
    title: string;
    price: string;
    priceSuffix: string;
    subtitle: string;
    benefits: string[];
    selected: boolean;
    disabled?: boolean;
    pending?: boolean;
    actionLabel: string;
    actionAriaLabel: string;
    onAction: (planId: number) => void;
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
        aria-hidden="true"
        focusable="false"
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
        stroke="#4f2078"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
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
    benefits,
    selected,
    disabled = false,
    pending = false,
    actionLabel,
    actionAriaLabel,
    onAction,
}: PlanCardProps) {
    return (
        <article
            className={`planCard${selected ? " selected" : ""}`}
            aria-current={selected ? "true" : undefined}
            aria-labelledby={`plan-title-${id}`}
        >
            <header className="planCardHeader">
                <h2 id={`plan-title-${id}`} className="planTitle">{title}</h2>
                <div className="planPriceRow">
                    <span className="planPrice">{price}</span>
                    <span className="planPriceSuffix">{priceSuffix}</span>
                </div>
                <p className="planSubtitle">{subtitle}</p>
                <hr className="planSeparator" />
            </header>
            <ul className="planBenefits">
                {benefits.map((benefit) => (
                    <li key={benefit} className="planBenefit">
                        <span className="planBenefitIcon">{benefit.startsWith("IA") ? CHECK_SVG : MINUS_SVG}</span>
                        <p className="planBenefitText">{benefit}</p>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className="planButton"
                onClick={() => onAction(id)}
                aria-label={`${actionAriaLabel} ${title}`}
                disabled={disabled}
                aria-busy={pending}
            >
                {actionLabel}
            </button>
        </article>
    );
}
