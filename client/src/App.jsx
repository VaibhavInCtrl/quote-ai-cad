import { Navigate, Route, Routes } from "react-router-dom";

import AnalyzePage from "./pages/AnalyzePage";
import QuotePage from "./pages/QuotePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AnalyzePage />} />
      <Route path="/quote" element={<QuotePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
