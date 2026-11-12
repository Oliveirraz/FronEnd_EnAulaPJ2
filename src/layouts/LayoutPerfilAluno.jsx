import { IconLogout } from '@tabler/icons-react'
import { Outlet, useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import NavegacaoAbas from '../components/ui/NavegacaoAbas.jsx'
import { lerSessao, limparSessao } from '../services/sessao.js'
import './LayoutPerfil.css'
import useAluno from '../hooks/useAluno.js'


// Seções do perfil do aluno. Por enquanto, só uma; as outras entram nas próximas etapas.
const ABAS = [
  { para: 'dados', texto: 'Dados' },
  { para: 'aulas', texto: 'Aulas' },
  { para: 'materiais', texto: 'Materiais' },
  { para: 'seguranca', texto: 'Segurança' },
]

// Estrutura das telas de perfil do aluno: painel com a identidade + abas e conteúdo.
export default function LayoutPerfilAluno() {
  const navigate = useNavigate()
  const sessao = lerSessao()
  const dadosDoAluno = useAluno()
  const { aluno } = dadosDoAluno

  // A rota protegida garante a sessão; isto só evita um erro se ela sumir no meio.
  if (!sessao) return null

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout-perfil">
      <aside className="layout-perfil__painel fundo-quadro" aria-label="Resumo do perfil">
        <Avatar key={aluno?.fotoUrl ?? 'sem-foto'} src={aluno?.fotoUrl} />

        <div className="layout-perfil__identidade">
          <p className="layout-perfil__nome">{aluno?.nome ?? sessao.nome}</p>
          <p className="layout-perfil__tipo">
            <span className="layout-perfil__selo">Aluno</span>
          </p>
          <p className="layout-perfil__email">{aluno?.email ?? sessao.email}</p>
        </div>

        <Button variante="contorno-claro" className="layout-perfil__sair" onClick={sair}>
          <IconLogout size="1.25rem" aria-hidden="true" />
          <span className="layout-perfil__sair-texto">Sair</span>
        </Button>
      </aside>

      <div className="layout-perfil__area">
        <div className="layout-perfil__miolo">
          <NavegacaoAbas rotulo="Seções do perfil" itens={ABAS} />
          <main>
            <Outlet context={dadosDoAluno} />
          </main>
        </div>
      </div>
    </div>
  )
}