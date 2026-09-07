import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import CadastroAluno from "./pages/Aluno/CadastroAluno";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route
          path="/cadastro-aluno"
          element={<CadastroAluno />}
        />

        <Route
          path="*"
          element={<Navigate to="/cadastro-aluno" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;