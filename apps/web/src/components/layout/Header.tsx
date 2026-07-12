import { Link } from "react-router-dom";
import { ROUTES } from "../../constants";

export default function Header() {
  return (
    <header className="container app-header">
      <nav className="app-nav">
        <strong className="app-brand">Odoo Hackathon 2026</strong>
        <Link to={ROUTES.home}>Home</Link>
      </nav>
    </header>
  );
}
