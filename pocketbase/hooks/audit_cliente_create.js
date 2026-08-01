onRecordCreateRequest((e) => {
  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', 'criou')
    audit.set('entidade', 'cliente')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        nome: e.record.getString('nome'),
        vendedor: e.record.getString('vendedor'),
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'clientes')
