
// src/App.jsx

import { Navigate, Route, Routes } from 'react-router-dom'

import BuscaAulasPage from './features/busca/BuscaAulasPage.jsx'
import SelecionarAulasPage from './features/busca/SelecionarAulasPage.jsx'
import CadastroAlunoPage from './features/cadastro/CadastroAlunoPage.jsx'
import CadastroProfessorPage from './features/cadastro/CadastroProfessorPage.jsx'
import EscolhaPerfilPage from './features/cadastro/EscolhaPerfilPage.jsx'
import InicioPage from './features/inicio/InicioPage.jsx'
import LoginPage from './features/login/LoginPage.jsx'
import PerfilMatriculasAlunoPage from './features/perfil/PerfilMatriculasAlunoPage.jsx'

import PerfilAulasPage from './features/perfil/PerfilAulasPage.jsx'
import PerfilDadosPage from './features/perfil/PerfilDadosPage.jsx'
import PerfilMateriasPage from './features/perfil/PerfilMateriasPage.jsx'
import PerfilSegurancaPage from './features/perfil/PerfilSegurancaPage.jsx'
import PerfilMateriaisPage from './features/perfil/PerfilMateriaisPage.jsx'
import PerfilMatriculasPage from './features/perfil/PerfilMatriculasPage.jsx'

import PerfilMateriaisAlunoPage from './features/perfil/PerfilMateriaisAlunoPage.jsx'
import PerfilAlunoDadosPage from './features/perfil/PerfilAlunoDadosPage.jsx'
import PerfilSegurancaAlunoPage from './features/perfil/PerfilSegurancaAlunoPage.jsx'

import LayoutAutenticacao from './layouts/LayoutAutenticacao.jsx'
import LayoutPerfil from './layouts/LayoutPerfil.jsx'
import LayoutPerfilAluno from './layouts/LayoutPerfilAluno.jsx'

import RotaProtegida from './routes/RotaProtegida.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas públicas */}
      <Route element={<LayoutAutenticacao />}>
        <Route path="/cadastro" element={<EscolhaPerfilPage />} />
        <Route path="/cadastro/aluno" element={<CadastroAlunoPage />} />
        <Route path="/cadastro/professor" element={<CadastroProfessorPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rotas privadas gerais */}
      <Route element={<RotaProtegida />}>
        <Route path="/inicio" element={<InicioPage />} />
      </Route>

      {/* Rotas do perfil do professor */}
      <Route element={<RotaProtegida tipo="PROFESSOR" />}>
        <Route path="/perfil" element={<LayoutPerfil />}>
          <Route index element={<Navigate to="dados" replace />} />

          <Route path="dados" element={<PerfilDadosPage />} />

          <Route path="materias" element={<PerfilMateriasPage />} />

          <Route path="aulas" element={<PerfilAulasPage />} />

          <Route path="materiais" element={<PerfilMateriaisPage />} />

          {/* CORREÇÃO: Rota de gerenciamento de matrículas */}
          <Route
            path="matriculas"
            element={<PerfilMatriculasPage />}
          />

          <Route path="seguranca" element={<PerfilSegurancaPage />} />
        </Route>
      </Route>

      {/* Rotas do aluno */}
      <Route element={<RotaProtegida tipo="ALUNO" />}>
        <Route path="/aluno/perfil" element={<LayoutPerfilAluno />}>
          <Route index element={<Navigate to="dados" replace />} />

          <Route path="dados" element={<PerfilAlunoDadosPage />} />

          <Route
            path="buscar-aulas"
            element={<BuscaAulasPage />}
          />

          <Route
            path="selecionar-aulas"
            element={<SelecionarAulasPage />}
          />

          <Route
            path="aulas"
            element={<div>Aulas do aluno</div>}
          />

          <Route
            path="materiais"
            element={<PerfilMateriaisAlunoPage />}
          />

          <Route
            path="seguranca"
            element={<PerfilSegurancaAlunoPage />}
          />
          
          <Route
            path="matriculas"
            element={<PerfilMatriculasAlunoPage />}
          />

        </Route>

        {/* Redirecionamento de endereço antigo */}
        <Route
          path="/aluno/buscar-aulas"
          element={
            <Navigate
              to="/aluno/perfil/buscar-aulas"
              replace
            />
          }
        />
      </Route>

      {/* Rota não encontrada */}
      <Route
        path="*"
        element={<Navigate to="/cadastro" replace />}
      />
    </Routes>
  )
}
