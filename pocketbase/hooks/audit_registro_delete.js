onRecordDeleteRequest((e) => {
  const recordId = e.record.id
  const recordData = {
    tipo: e.record.getString('tipo'),
    descricao: e.record.getString('descricao'),
    cliente: e.record.getString('cliente'),
  }

  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', 'excluiu')
    audit.set('entidade', 'registro')
    audit.set('entidadeId', recordId)
    audit.set('detalhes', JSON.stringify(recordData))
    $app.save(audit)
  } catch (err) {}
}, 'registros')
