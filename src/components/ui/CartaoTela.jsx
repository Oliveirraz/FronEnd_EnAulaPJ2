import './CartaoTela.css'

// Cartão que agrupa o conteúdo de uma tela de formulário (a partir do tablet).
export default function CartaoTela({ children }) {
  return <div className="cartao-tela">{children}</div>
}