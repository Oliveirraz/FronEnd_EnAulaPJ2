import { IconCash, IconCertificate, IconLogout } from '@tabler/icons-react'
import { Outlet, useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import NavegacaoAbas from '../components/ui/NavegacaoAbas.jsx'
import { rotuloDaTitulacao } from '../constants/titulacoes.js'
import useProfessor from '../hooks/useProfessor.js'
import { lerSessao, limparSessao } from '../services/sessao.js'
import { formatarMoeda } from '../utils/formatadores.js'
import './LayoutPerfil.css'

// Seções do perfil do professor. Cada uma é uma rota dentro de /perfil.
const ABAS = [
  { para: 'dados', texto: 'Dados' },
  { para: 'materias', texto: 'Matérias' },
  { para: 'aulas', texto: 'Aulas' },
  { para: 'seguranca', texto: 'Segurança' },
]

const ROTULO_DO_TIPO = { PROFESSOR: 'Professor', ALUNO: 'Aluno' }

// Estrutura das telas de perfil: painel com a identidade da pessoa + abas e conteúdo.
export default function LayoutPerfil() {
  const navigate = useNavigate()
  const sessao = lerSessao()
  const dadosDoProfessor = useProfessor()
  const { professor } = dadosDoProfessor

  // A rota protegida garante a sessão; isto só evita um erro se ela sumir no meio.
  if (!sessao) return null

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout-perfil">
      <aside className="layout-perfil__painel fundo-quadro" aria-label="Resumo do perfil">
                {/* A key reinicia o avatar se o endereço da foto mudar (ex.: link novo) */}
                <Avatar key={professor?.fotoUrl ?? 'sem-foto'} src={professor?.fotoUrl} />

        <div className="layout-perfil__identidade">
          <p className="layout-perfil__nome">{professor?.nome ?? sessao.nome}</p>
          <p className="layout-perfil__tipo">
            <span className="layout-perfil__selo">{ROTULO_DO_TIPO[sessao.tipo]}</span>
          </p>
          <p className="layout-perfil__email">{professor?.email ?? sessao.email}</p>

          {professor && (
            <ul className="layout-perfil__resumo">
              <li>
                <IconCertificate size="1.25rem" aria-hidden="true" />
                {rotuloDaTitulacao(professor.titulacao) || 'Titulação não informada'}
              </li>
              <li>
                <IconCash size="1.25rem" aria-hidden="true" />
                {professor.valorHoraAula === null
                  ? 'Valor da hora-aula não informado'
                  : `${formatarMoeda(professor.valorHoraAula)} por hora-aula`}
              </li>
            </ul>
          )}
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
            <Outlet context={dadosDoProfessor} />
          </main>
        </div>
      </div>
    </div>
  )
}