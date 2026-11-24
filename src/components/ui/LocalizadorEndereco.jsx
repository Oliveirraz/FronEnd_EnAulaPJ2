import { useMemo, useState } from 'react'
import { IconSearch, IconMapPin } from '@tabler/icons-react'

/** Pesquisa um endereço no OpenStreetMap e devolve as coordenadas escolhidas. */
export default function LocalizadorEndereco({
  latitude,
  longitude,
  onCoordinatesChange,
}) {
  const [endereco, setEndereco] = useState('')
  const [resultados, setResultados] = useState([])
  const [pesquisando, setPesquisando] = useState(false)
  const [erroBusca, setErroBusca] = useState('')
  const [enderecoSelecionado, setEnderecoSelecionado] = useState('')

  const coordenadasValidas =
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180

  const mapaUrl = useMemo(() => {
    if (!coordenadasValidas) return ''

    const lat = Number(latitude)
    const lon = Number(longitude)
    const margem = 0.005

    const params = new URLSearchParams({
      bbox: `${lon - margem},${lat - margem},${lon + margem},${lat + margem}`,
      layer: 'mapnik',
      marker: `${lat},${lon}`,
    })

    return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`
  }, [coordenadasValidas, latitude, longitude])

  async function pesquisarEndereco() {
    setErroBusca('')
    setResultados([])

    const consulta = endereco.trim()

    if (consulta.length < 5) {
      setErroBusca(
        'Digite o endereço completo, incluindo cidade e estado.'
      )
      return
    }

    setPesquisando(true)

    try {
      const params = new URLSearchParams({
        q: consulta,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'br',
      })

      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9',
          },
        }
      )

      if (!resposta.ok) {
        throw new Error(
          'O serviço de mapas não respondeu. Tente novamente.'
        )
      }

      const dados = await resposta.json()

      if (!Array.isArray(dados) || dados.length === 0) {
        setErroBusca(
          'Endereço não encontrado. Confira a escrita ou inclua bairro, cidade e estado.'
        )
        return
      }

      setResultados(dados)
    } catch (error) {
      setErroBusca(
        error.message || 'Não foi possível pesquisar esse endereço.'
      )
    } finally {
      setPesquisando(false)
    }
  }

  function selecionarResultado(resultado) {
    onCoordinatesChange({
      latitude: Number(resultado.lat).toFixed(7),
      longitude: Number(resultado.lon).toFixed(7),
    })

    setEnderecoSelecionado(resultado.display_name)
    setEndereco(resultado.display_name)
    setResultados([])
    setErroBusca('')
  }

  return (
    <div className="localizador-endereco">
      <div className="localizador-endereco__pesquisa">
        <label htmlFor="endereco-para-mapa">
          <span>Pesquise seu endereço</span>

          <input
            id="endereco-para-mapa"
            type="text"
            value={endereco}
            onChange={(evento) => {
              setEndereco(evento.target.value)
              setEnderecoSelecionado('')
            }}
            placeholder="Ex.: Rua João Pessoa, 123, Monteiro - PB"
            autoComplete="street-address"
          />
        </label>

        <button
          type="button"
          onClick={pesquisarEndereco}
          disabled={pesquisando}
        >
          <IconSearch size="1.1rem" aria-hidden="true" />

          {pesquisando
            ? 'Pesquisando...'
            : 'Localizar endereço'}
        </button>
      </div>

      {erroBusca && (
        <p className="localizador-endereco__erro" role="alert">
          {erroBusca}
        </p>
      )}

      {resultados.length > 0 && (
        <div
          className="localizador-endereco__resultados"
          aria-label="Resultados encontrados"
        >
          <strong>Selecione o endereço correto:</strong>

          {resultados.map((resultado) => (
            <button
              type="button"
              key={resultado.place_id}
              onClick={() => selecionarResultado(resultado)}
            >
              <IconMapPin size="1rem" aria-hidden="true" />

              <span>{resultado.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {enderecoSelecionado && (
        <p className="localizador-endereco__selecionado">
          Endereço selecionado: {enderecoSelecionado}
        </p>
      )}

      {mapaUrl ? (
        <iframe
          className="localizador-endereco__mapa"
          title="Mapa para conferir a localização selecionada"
          src={mapaUrl}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="localizador-endereco__mapa-vazio">
          Pesquise um endereço ou use sua localização atual para
          visualizar o marcador no mapa.
        </div>
      )}

      <small className="localizador-endereco__credito">
        Mapa e pesquisa de endereços por OpenStreetMap. A posição
        encontrada é aproximada; confira o marcador antes de salvar.
      </small>
    </div>
  )
}