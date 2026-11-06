// A sessão fica no sessionStorage: some ao fechar a aba, o que combina com o
// token de 1 hora do back end. O acesso é protegido porque o navegador pode
// bloquear o armazenamento (modo privado, configurações de privacidade).
const CHAVE = 'enaula.sessao'

export function salvarSessao({ token, tipo, id, nome, email }) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify({ token, tipo, id, nome, email }))
    return true
  } catch {
    return false
  }
}

export function lerSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function limparSessao() {
  try {
    sessionStorage.removeItem(CHAVE)
  } catch {
    // Sem armazenamento disponível: não há o que limpar.
  }
}

// Lê a data de expiração (claim "exp", em segundos) do JWT, sem validar a assinatura.
// A validação de verdade é feita pelo back end; aqui só evitamos usar um token vencido.
export function sessaoExpirada(sessao) {
  try {
    const [, carga] = sessao.token.split('.')
    const { exp } = JSON.parse(atob(carga.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof exp === 'number' && exp * 1000 <= Date.now()
  } catch {
    return false
  }
}