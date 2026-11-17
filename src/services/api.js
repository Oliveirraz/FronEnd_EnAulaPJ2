
import { lerSessao } from './sessao.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

async function lerMensagemDoServidor(resposta) {
  const texto = await resposta.text().catch(() => '')

  return texto.trimStart().startsWith('{') ? '' : texto.trim()
}

// =====================================================
// CADASTRO
// =====================================================

// Cadastro multipart/form-data.
// O navegador define automaticamente o Content-Type e o boundary.
async function enviarCadastro(rota, nomeDaParte, dados, foto) {
  const formData = new FormData()

  formData.append(
    nomeDaParte,
    new Blob([JSON.stringify(dados)], {
      type: 'application/json',
    })
  )

  if (foto) {
    formData.append('foto', foto)
  }

  const resposta = await fetch(`${API_URL}/api/${rota}`, {
    method: 'POST',
    body: formData,
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

export function cadastrarAluno(dados, foto) {
  return enviarCadastro('alunos', 'aluno', dados, foto)
}

export function cadastrarProfessor(dados, foto) {
  return enviarCadastro('professores', 'professor', dados, foto)
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

export async function entrar({ email, senha, tipo }) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      senha,
      tipo,
    }),
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

// =====================================================
// REQUISIÇÕES AUTENTICADAS
// =====================================================

async function requisicaoAutenticada(caminho, opcoes = {}) {
  const token = lerSessao()?.token

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  if (resposta.status === 204) {
    return null
  }

  const texto = await resposta.text()

  return texto ? JSON.parse(texto) : null
}

// =====================================================
// ALUNOS
// =====================================================

export function buscarAluno(id) {
  return requisicaoAutenticada(`/api/alunos/${id}`)
}

// =====================================================
// PROFESSORES
// =====================================================

export function buscarProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`)
}

export function atualizarProfessor(id, dados) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

export function excluirProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'DELETE',
  })
}

// =====================================================
// TABELA DE PREÇOS
// =====================================================

// Rota pública: utilizada antes do login.
export async function buscarTabelaPrecos() {
  const resposta = await fetch(`${API_URL}/api/tabela-precos`)

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

// =====================================================
// AULAS
// =====================================================

// HU10 - Lista as aulas para selecionar onde o material será anexado.
// ATENÇÃO: confirmar no backend se a rota é /api/aulas.
export function listarAulas() {
  return requisicaoAutenticada('/api/aulas')
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
// MATERIAIS DE APOIO - HU10
// =====================================================

// Lista os materiais vinculados a uma aula.
export function listarMateriaisDaAula(aulaId) {
  if (!aulaId) {
    return Promise.reject(
      new Error('Selecione uma aula para listar os materiais.')
    )
  }

  return requisicaoAutenticada(
    `/api/materiais/aula/${encodeURIComponent(aulaId)}`
  )
}

// Envia um arquivo de apoio para uma aula.
export function enviarMaterialAula(aulaId, arquivo) {
  if (!aulaId || !arquivo) {
    return Promise.reject(
      new Error('Informe a aula e o arquivo para realizar o envio.')
    )
  }

  const formData = new FormData()

  formData.append('arquivo', arquivo)

  return requisicaoAutenticada(
    `/api/materiais/aula/${encodeURIComponent(aulaId)}`,
    {
      method: 'POST',
      body: formData,
    }
  )
}

// Remove um material enviado.
export function excluirMaterialApoio(materialId) {
  if (!materialId) {
    return Promise.reject(
      new Error('Informe o material que deseja excluir.')
    )
  }

  return requisicaoAutenticada(
    `/api/materiais/${encodeURIComponent(materialId)}`,
    {
      method: 'DELETE',
    }
  )
}
