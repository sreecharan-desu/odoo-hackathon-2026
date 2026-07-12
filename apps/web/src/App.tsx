import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
