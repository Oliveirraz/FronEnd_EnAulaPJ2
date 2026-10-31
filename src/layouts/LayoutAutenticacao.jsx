import { Outlet, useLocation } from 'react-router-dom'
import IlustracaoPainel from '../components/ui/IlustracaoPainel.jsx'
import Marca from '../components/ui/Marca.jsx'
import './LayoutAutenticacao.css'

// Ilustração do painel conforme a tela. A escolha de perfil usa a lousa.
const ILUSTRACAO_POR_ROTA = {
  '/login': 'login',
  '/cadastro/aluno': 'aluno',
  '/cadastro/professor': 'professor',
}

// Estrutura comum às telas de cadastro e login: painel colorido + área de conteúdo.
export default function LayoutAutenticacao() {
  const { pathname } = useLocation()
  const tipoDaIlustracao = ILUSTRACAO_POR_ROTA[pathname.replace(/\/$/, '')]

  return (
    <div className="layout-autenticacao">
      <header className="layout-autenticacao__painel fundo-quadro">
        <div>
          <Marca />
          <p className="layout-autenticacao__frase">Aprenda e ensine. Tudo em um só lugar.</p>
        </div>
        <IlustracaoPainel tipo={tipoDaIlustracao} />
      </header>

      <div className="layout-autenticacao__area">
        {/* Formas decorativas do fundo (só visuais) */}
        <div className="layout-autenticacao__formas" aria-hidden="true">
          <span className="layout-autenticacao__forma layout-autenticacao__forma--grande" />
          <span className="layout-autenticacao__forma layout-autenticacao__forma--media" />
          <span className="layout-autenticacao__forma layout-autenticacao__forma--anel" />
          <span className="layout-autenticacao__forma layout-autenticacao__forma--ponto" />
        </div>

        <main className="layout-autenticacao__conteudo">
          {/* A key reinicia a animação de entrada a cada troca de tela */}
          <div key={pathname} className="layout-autenticacao__pagina">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}