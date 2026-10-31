import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import UploadFoto from '../../components/ui/UploadFoto.jsx'
import useCadastro from '../../hooks/useCadastro.js'
import { cadastrarProfessor } from '../../services/api.js'
import { IconCertificate, IconCurrencyReal } from '@tabler/icons-react'
import CamposComuns from './CamposComuns.jsx'
import Aviso from '../../components/ui/Aviso.jsx'
import './Formulario.css'

// Valores iguais aos do enum TitulacaoProfessor do back end.
const TITULACOES = [
  { valor: 'GRADUACAO', texto: 'Graduação' },
  { valor: 'ESPECIALIZACAO', texto: 'Especialização' },
  { valor: 'MESTRADO', texto: 'Mestrado' },
  { valor: 'DOUTORADO', texto: 'Doutorado' },
]

const VALORES_INICIAIS = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  titulacao: '',
  valorHoraAula: '',
}

export default function ProfessorForm() {
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: VALORES_INICIAIS })
  const [foto, setFoto] = useState(null)
  const { enviar, erroServidor } = useCadastro(cadastrarProfessor, setError)

  // Retornar a promessa mantém isSubmitting ativo enquanto o envio acontece.
  function aoEnviar({ nome, email, senha, titulacao, valorHoraAula }) {
    return enviar(
      {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        titulacao,
        // Campo opcional: vazio vira null, como o back end espera.
        valorHoraAula: valorHoraAula === '' ? null : Number(valorHoraAula),
      },
      foto,
    )
  }

  return (
    <form className="formulario" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <UploadFoto aoMudar={setFoto} />

      <div className="formulario__campos">
        <CamposComuns register={register} errors={errors} getValues={getValues} />

        <Select
          rotulo="Titulação"
          icone={IconCertificate}
          opcoes={TITULACOES}
          erro={errors.titulacao?.message}
          {...register('titulacao', { required: 'Selecione sua titulação.' })}
        />

        <Input
          rotulo="Valor da hora-aula em R$ (opcional)"
          icone={IconCurrencyReal}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          erro={errors.valorHoraAula?.message}
          {...register('valorHoraAula', {
            validate: (valor) =>
              valor === '' || Number(valor) >= 0 || 'Informe um valor maior ou igual a zero.',
          })}
        />
      </div>

      {erroServidor && <Aviso tipo="erro">{erroServidor}</Aviso>}

      <Button type="submit" carregando={isSubmitting}>
        {isSubmitting ? 'Criando conta...' : 'Criar conta de professor'}
      </Button>
    </form>
  )
}