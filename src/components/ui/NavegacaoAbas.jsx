import { NavLink } from 'react-router-dom'
import './NavegacaoAbas.css'

// Abas feitas de links: cada aba tem o seu endereço, então o botão "voltar" do
// navegador e os links diretos funcionam. A aba atual recebe aria-current="page".
export default function NavegacaoAbas({ rotulo, itens }) {
  return (
    <nav className="abas" aria-label={rotulo}>
      {itens.map(({ para, texto }) => (
        <NavLink key={para} className="abas__link" to={para}>
          {texto}
        </NavLink>
      ))}
    </nav>
  )
}