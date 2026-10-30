export interface DashboardStatCardProps {
    label: string;
    value: string;
}

export default function DashboardStatCard({ label, value }: DashboardStatCardProps) {
    return (
        <div className="dashboard-stat">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}
