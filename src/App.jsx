import { Navigate, Route, Routes } from 'react-router-dom'
import CadastroAlunoPage from './features/cadastro/CadastroAlunoPage.jsx'
import CadastroProfessorPage from './features/cadastro/CadastroProfessorPage.jsx'
import EscolhaPerfilPage from './features/cadastro/EscolhaPerfilPage.jsx'
import InicioPage from './features/inicio/InicioPage.jsx'
import LoginPage from './features/login/LoginPage.jsx'
import PerfilAulasPage from './features/perfil/PerfilAulasPage.jsx'
import PerfilDadosPage from './features/perfil/PerfilDadosPage.jsx'
import PerfilMateriasPage from './features/perfil/PerfilMateriasPage.jsx'
import PerfilSegurancaPage from './features/perfil/PerfilSegurancaPage.jsx'
import LayoutAutenticacao from './layouts/LayoutAutenticacao.jsx'
import LayoutPerfil from './layouts/LayoutPerfil.jsx'
import RotaProtegida from './routes/RotaProtegida.jsx'

export default function App() {
  return (
    <Routes>
      
      {/* Tela inicial: redireciona para o login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas públicas */}
      <Route element={<LayoutAutenticacao />}>
        <Route path="/cadastro" element={<EscolhaPerfilPage />} />
        <Route path="/cadastro/aluno" element={<CadastroAlunoPage />} />
        <Route path="/cadastro/professor" element={<CadastroProfessorPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rotas privadas: exigem login */}
      <Route element={<RotaProtegida />}>
        <Route path="/inicio" element={<InicioPage />} />
      </Route>

      {/* Perfil do professor (o do aluno virá depois) */}
      <Route element={<RotaProtegida tipo="PROFESSOR" />}>
        <Route path="/perfil" element={<LayoutPerfil />}>
          <Route index element={<Navigate to="dados" replace />} />
          <Route path="dados" element={<PerfilDadosPage />} />
          <Route path="materias" element={<PerfilMateriasPage />} />
          <Route path="aulas" element={<PerfilAulasPage />} />
          <Route path="seguranca" element={<PerfilSegurancaPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/cadastro" replace />} />
    </Routes>
  )
}