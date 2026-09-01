import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CadastroAluno from "./pages/Aluno/CadastroAluno";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* REDIRECT PADRÃO */}
        <Route path="/" element={<Navigate to="/cadastro-aluno" />} />

        {/* CADASTRO ALUNO */}
        <Route path="/cadastro-aluno" element={<CadastroAluno />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;