onRecordCreateRequest((e) => {
  e.record.set('ativo', true)

  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', 'criou')
    audit.set('entidade', 'usuario')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        nome: e.record.getString('name'),
        email: e.record.getString('email'),
        perfil: e.record.getString('perfil'),
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'users')
