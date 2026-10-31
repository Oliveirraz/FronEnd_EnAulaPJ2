import './Marca.css'

// Marca do EnAula: o selo "E" é decorativo, então o leitor de tela lê só o nome.
export default function Marca({ className = '' }) {
  return (
    <p className={`marca ${className}`.trim()}>
      <span className="marca__selo" aria-hidden="true">
        E
      </span>
      <span className="marca__nome">EnAula</span>
    </p>
  )
}