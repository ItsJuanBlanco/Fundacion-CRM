import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'

const ESTADOS = ['registrado', 'contactado', 'activo', 'inactivo', 'moroso']

export default function PanelDonantes({ session }) {
  const [donantes, setDonantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [donanteEditando, setDonanteEditando] = useState(null)

  useEffect(() => {
    cargarDonantes()
  }, [])

  async function cargarDonantes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('donantes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setDonantes(data)
    setLoading(false)
  }

  async function actualizarEstado(id, nuevoEstado) {
    // Actualiza en la UI de inmediato para que se sienta rápido
    setDonantes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d))
    )
    await supabase.from('donantes').update({ estado: nuevoEstado }).eq('id', id)
  }

  async function guardarNotas(id, notas) {
    await supabase.from('donantes').update({ notas }).eq('id', id)
    setDonantes((prev) => prev.map((d) => (d.id === id ? { ...d, notas } : d)))
    setDonanteEditando(null)
  }

  async function eliminarDonante(id) {
    if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.')) return
    await supabase.from('donantes').delete().eq('id', id)
    setDonantes((prev) => prev.filter((d) => d.id !== id))
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  const donantesFiltrados = useMemo(() => {
    return donantes.filter((d) => {
      const coincideBusqueda =
        busqueda === '' ||
        d.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.identificacion?.includes(busqueda) ||
        d.celular?.includes(busqueda) ||
        d.ciudad?.toLowerCase().includes(busqueda.toLowerCase())

      const coincideEstado = filtroEstado === 'todos' || d.estado === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [donantes, busqueda, filtroEstado])

  const stats = useMemo(() => {
    const total = donantes.length
    const activos = donantes.filter((d) => d.estado === 'activo').length
    const pendientes = donantes.filter((d) => d.estado === 'registrado').length
    const totalMensual = donantes
      .filter((d) => d.estado === 'activo' && d.frecuencia === 'mensual')
      .reduce((sum, d) => sum + (d.monto_comprometido || 0), 0)
    return { total, activos, pendientes, totalMensual }
  }, [donantes])

  function exportarCSV() {
    const headers = ['Nombre', 'Identificación', 'Celular', 'Email', 'Ciudad', 'Frecuencia', 'Monto', 'Estado', 'Fecha registro']
    const rows = donantesFiltrados.map((d) => [
      d.nombre_completo,
      d.identificacion,
      d.celular,
      d.email || '',
      d.ciudad || '',
      d.frecuencia,
      d.monto_comprometido,
      d.estado,
      new Date(d.created_at).toLocaleDateString('es-CO'),
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `donantes_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="logo-sm">❤</div>
          Panel de Donantes
        </div>
        <button className="logout-link" onClick={cerrarSesion}>
          Cerrar sesión ({session.user.email})
        </button>
      </div>

      <div className="container-wide">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="value">{stats.total}</div>
            <div className="label">Total registrados</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.activos}</div>
            <div className="label">Donantes activos</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats.pendientes}</div>
            <div className="label">Pendientes de contactar</div>
          </div>
          <div className="stat-card">
            <div className="value">${stats.totalMensual.toLocaleString('es-CO')}</div>
            <div className="label">Compromiso mensual activo</div>
          </div>
        </div>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, celular o ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '10px 16px' }} onClick={exportarCSV}>
            Exportar CSV
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Cargando donantes...</div>
        ) : donantesFiltrados.length === 0 ? (
          <div className="empty-state">
            {donantes.length === 0
              ? 'Todavía no hay donantes registrados.'
              : 'No se encontraron donantes con esos filtros.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Celular</th>
                  <th>Ciudad</th>
                  <th>Frecuencia</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {donantesFiltrados.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.nombre_completo}</strong>
                      {d.tipo_donante === 'empresa' && <span style={{ color: '#6b7280', fontSize: 11 }}> (empresa)</span>}
                    </td>
                    <td>{d.identificacion}</td>
                    <td>{d.celular}</td>
                    <td>{d.ciudad || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{d.frecuencia}</td>
                    <td>${Number(d.monto_comprometido).toLocaleString('es-CO')}</td>
                    <td>
                      <select
                        className="status-select"
                        value={d.estado}
                        onChange={(e) => actualizarEstado(d.id, e.target.value)}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(d.created_at).toLocaleDateString('es-CO')}</td>
                    <td>
                      <button className="link-btn" onClick={() => setDonanteEditando(d)}>
                        {d.notas ? 'Ver/editar notas' : 'Agregar nota'}
                      </button>
                    </td>
                    <td>
                      <button className="link-btn" style={{ color: '#dc2626' }} onClick={() => eliminarDonante(d.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {donanteEditando && (
        <ModalNotas
          donante={donanteEditando}
          onGuardar={guardarNotas}
          onCerrar={() => setDonanteEditando(null)}
        />
      )}
    </div>
  )
}

function ModalNotas({ donante, onGuardar, onCerrar }) {
  const [notas, setNotas] = useState(donante.notas || '')

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Notas — {donante.nombre_completo}</h3>
        <div className="field">
          <label>Seguimiento / observaciones</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            placeholder="Ej: Contactado por WhatsApp el 2 de julio, confirmó que pagará por transferencia..."
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn" onClick={() => onGuardar(donante.id, notas)}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
