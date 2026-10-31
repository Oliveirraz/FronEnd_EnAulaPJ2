import { Navigate, Route, Routes } from 'react-router-dom'
import CadastroAlunoPage from './features/cadastro/CadastroAlunoPage.jsx'
import CadastroProfessorPage from './features/cadastro/CadastroProfessorPage.jsx'
import EscolhaPerfilPage from './features/cadastro/EscolhaPerfilPage.jsx'
import InicioPage from './features/inicio/InicioPage.jsx'
import LoginPage from './features/login/LoginPage.jsx'
import LayoutAutenticacao from './layouts/LayoutAutenticacao.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutAutenticacao />}>
        <Route path="/cadastro" element={<EscolhaPerfilPage />} />
        <Route path="/cadastro/aluno" element={<CadastroAlunoPage />} />
        <Route path="/cadastro/professor" element={<CadastroProfessorPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/inicio" element={<InicioPage />} />
      <Route path="*" element={<Navigate to="/cadastro" replace />} />
    </Routes>
  )
}