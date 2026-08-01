onRecordUpdateRequest((e) => {
  const originalTipo = e.record.original().getString('tipo')
  const originalDescricao = e.record.original().getString('descricao')
  const originalStatus = e.record.original().getString('status')
  const originalDataProximaAcao = e.record.original().getString('dataProximaAcao')

  e.next()

  try {
    const newStatus = e.record.getString('status')
    const newDataProximaAcao = e.record.getString('dataProximaAcao')
    let acao = 'editou'
    if (newStatus === 'Concluída' && originalStatus !== 'Concluída') {
      acao = 'concluiu'
    } else if (newDataProximaAcao !== originalDataProximaAcao) {
      acao = 'reagendou'
    }

    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', acao)
    audit.set('entidade', 'registro')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        antes: {
          tipo: originalTipo,
          descricao: originalDescricao,
          status: originalStatus,
          dataProximaAcao: originalDataProximaAcao,
        },
        depois: {
          tipo: e.record.getString('tipo'),
          descricao: e.record.getString('descricao'),
          status: newStatus,
          dataProximaAcao: newDataProximaAcao,
        },
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'registros')
