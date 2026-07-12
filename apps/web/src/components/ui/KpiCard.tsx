import Card from "./Card";

type KpiCardProps = {
  label: string;
  value: string | number;
  className?: string;
};

export default function KpiCard({ label, value, className = "" }: KpiCardProps) {
  return (
    <Card className={`kpi-card ${className}`.trim()}>
      <span className="kpi-card-label">{label}</span>
      <span className="kpi-card-value">{value}</span>
    </Card>
  );
}
