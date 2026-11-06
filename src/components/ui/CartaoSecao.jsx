import CartaoTela from './CartaoTela.jsx'
import './CartaoSecao.css'

// Seção de uma tela com título e, se precisar, uma ação à direita (ex.: botão "Editar").
export default function CartaoSecao({ titulo, acao, children }) {
  return (
    <CartaoTela>
      <div className="cartao-secao__cabecalho">
        <h2 className="cartao-secao__titulo">{titulo}</h2>
        {acao}
      </div>
      {children}
    </CartaoTela>
  )
}