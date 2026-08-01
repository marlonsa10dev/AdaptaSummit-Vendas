onRecordUpdateRequest((e) => {
  const originalNome = e.record.original().getString('nome')
  const originalVendedor = e.record.original().getString('vendedor')

  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', 'editou')
    audit.set('entidade', 'cliente')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        antes: {
          nome: originalNome,
          vendedor: originalVendedor,
        },
        depois: {
          nome: e.record.getString('nome'),
          vendedor: e.record.getString('vendedor'),
        },
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'clientes')
