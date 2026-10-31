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