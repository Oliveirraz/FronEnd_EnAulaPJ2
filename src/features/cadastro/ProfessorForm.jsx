import { IconCertificate, IconCurrencyReal } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import UploadFoto from '../../components/ui/UploadFoto.jsx'
import { TITULACOES, rotuloDaTitulacao } from '../../constants/titulacoes.js'
import useCadastro from '../../hooks/useCadastro.js'
import useTabelaPrecos from '../../hooks/useTabelaPrecos.js'
import { cadastrarProfessor } from '../../services/api.js'
import { formatarMoeda } from '../../utils/formatadores.js'
import CamposComuns from './CamposComuns.jsx'
import './Formulario.css'

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
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched', defaultValues: VALORES_INICIAIS })
  const [foto, setFoto] = useState(null)
  const { enviar, erroServidor } = useCadastro(cadastrarProfessor, setError)
  const { minimos, erro: erroTabela } = useTabelaPrecos()

  const titulacao = useWatch({ control, name: 'titulacao' })
  const minimo = minimos[titulacao] // número, ou undefined (sem titulação ou sem tabela)
  const minimoAnterior = useRef(undefined)

  // Ao escolher (ou trocar) a titulação, o valor da hora-aula acompanha o mínimo dela:
  // preenche se estiver vazio, sobe se ficou abaixo do novo mínimo e troca se ainda
  // for o mínimo da titulação anterior. Um valor maior, digitado pela pessoa, é mantido.
  useEffect(() => {
    if (minimo === undefined) return

    const atual = getValues('valorHoraAula')
    const vazio = atual === '' || atual === undefined || atual === null

    if (vazio || Number(atual) < minimo || Number(atual) === minimoAnterior.current) {
      setValue('valorHoraAula', String(minimo), { shouldValidate: true })
    }
    minimoAnterior.current = minimo
  }, [minimo, getValues, setValue])

  function textoDeAjuda() {
    if (minimo !== undefined) {
      return `Mínimo para ${rotuloDaTitulacao(titulacao)}: ${formatarMoeda(minimo)}. Você pode cobrar mais.`
    }
    if (titulacao && erroTabela) {
      return 'Não foi possível carregar o valor mínimo agora. O servidor confere ao enviar.'
    }
    return undefined
  }

  // Retornar a promessa mantém isSubmitting ativo enquanto o envio acontece.
  function aoEnviar({ nome, email, senha, titulacao, valorHoraAula }) {
    return enviar(
      {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        titulacao,
        // Vazio vira null: o back end então usa o valor mínimo da titulação.
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
          rotulo="Valor da hora-aula em R$"
          icone={IconCurrencyReal}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          disabled={!titulacao}
          placeholder={titulacao ? undefined : 'Escolha a titulação primeiro'}
          ajuda={textoDeAjuda()}
          erro={errors.valorHoraAula?.message}
          {...register('valorHoraAula', {
            validate: (valor) => {
              if (valor === '' || minimo === undefined) return true
              return (
                Number(valor) >= minimo ||
                `O valor mínimo para ${rotuloDaTitulacao(titulacao)} é ${formatarMoeda(minimo)}.`
              )
            },
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