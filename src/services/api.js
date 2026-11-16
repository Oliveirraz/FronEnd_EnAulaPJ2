import { lerSessao } from './sessao.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// O back end devolve texto puro em alguns erros (ex.: "Email já cadastrado").
// Os erros em JSON do Spring não têm mensagem útil para o usuário.
async function lerMensagemDoServidor(resposta) {
  const texto = await resposta.text().catch(() => '')
  return texto.trimStart().startsWith('{') ? '' : texto.trim()
}

// As rotas de cadastro exigem multipart/form-data: uma parte JSON
// (aluno ou professor) e uma parte opcional "foto".
// Não definimos o Content-Type: o navegador inclui o boundary sozinho.
async function enviarCadastro(rota, nomeDaParte, dados, foto) {
  const formData = new FormData()
  formData.append(nomeDaParte, new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (foto) formData.append('foto', foto)

  const resposta = await fetch(`${API_URL}/api/${rota}`, {
    method: 'POST',
    body: formData,
  })

  if (!resposta.ok) {
    throw new ApiError(resposta.status, await lerMensagemDoServidor(resposta))
  }
  return resposta.json()
}

export function cadastrarAluno(dados, foto) {
  return enviarCadastro('alunos', 'aluno', dados, foto)
}

export function cadastrarProfessor(dados, foto) {
  return enviarCadastro('professores', 'professor', dados, foto)
}

// Login: o back end espera JSON com email, senha e tipo (ALUNO ou PROFESSOR).
export async function entrar({ email, senha, tipo }) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha, tipo }),
  })

  if (!resposta.ok) {
    throw new ApiError(resposta.status, await lerMensagemDoServidor(resposta))
  }
  return resposta.json()
}

// Requisição a uma rota privada: envia o token do login no cabeçalho Authorization.
// 401 ou 403 indicam token vencido ou recusado, e quem chama decide o que fazer.
async function requisicaoAutenticada(caminho, opcoes = {}) {
  const token = lerSessao()?.token
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: { ...opcoes.headers, Authorization: `Bearer ${token}` },
  })

  if (!resposta.ok) {
    throw new ApiError(resposta.status, await lerMensagemDoServidor(resposta))
  }
  return resposta.status === 204 ? null : resposta.json()
}

export function buscarAluno(id) {
  return requisicaoAutenticada(`/api/alunos/${id}`)
}

export function buscarProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`)
}


export function atualizarProfessor(id, dados) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}


export function excluirProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'DELETE',
  })
}

// Valor mínimo da hora-aula de cada titulação. Rota pública: o cadastro do professor
// acontece antes do login.
export async function buscarTabelaPrecos() {
  const resposta = await fetch(`${API_URL}/api/tabela-precos`)

  if (!resposta.ok) {
    throw new ApiError(resposta.status, await lerMensagemDoServidor(resposta))
  }
  return resposta.json()
}

// =====================================================
// MATÉRIAS - HU05
// =====================================================

// Lista as matérias cadastradas pelo professor logado.
export function listarMaterias() {
  return requisicaoAutenticada('/api/materias')
}

// Cadastra uma nova matéria.
export function cadastrarMateria(dados) {
  return requisicaoAutenticada('/api/materias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

// Busca uma matéria específica.
export function buscarMateria(id) {
  return requisicaoAutenticada(`/api/materias/${id}`)
}

// Atualiza uma matéria existente.
export function atualizarMateria(id, dados) {
  return requisicaoAutenticada(`/api/materias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

// Exclui uma matéria.
export function excluirMateria(id) {
  return requisicaoAutenticada(`/api/materias/${id}`, {
    method: 'DELETE',
  })
}

// =====================================================
// AULAS - criação e listagem do professor logado
// =====================================================

export function listarAulas() {
  return requisicaoAutenticada('/api/aulas')
}

export function cadastrarAula(dados) {
  return requisicaoAutenticada('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}
