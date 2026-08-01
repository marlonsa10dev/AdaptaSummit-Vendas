onRecordCreateRequest((e) => {
  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', 'criou')
    audit.set('entidade', 'registro')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        tipo: e.record.getString('tipo'),
        descricao: e.record.getString('descricao'),
        cliente: e.record.getString('cliente'),
        data: e.record.getString('data'),
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'registros')
