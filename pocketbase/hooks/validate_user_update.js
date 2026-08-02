onRecordUpdateRequest((e) => {
  const originalNome = e.record.original().getString('name')
  const originalEmail = e.record.original().getString('email')
  const originalPerfil = e.record.original().getString('perfil')
  const originalAtivo = e.record.original().getBool('ativo')

  try {
    e.record.set('emailVisibility', true)
  } catch (_) {}

  if (e.auth) {
    var isSuperuser = false
    try {
      isSuperuser = e.hasSuperuserAuth()
    } catch (_) {}
    const isAdmin = isSuperuser || e.auth.getString('perfil') === 'Administrador'

    if (!isAdmin) {
      e.record.set('perfil', originalPerfil)
      e.record.set('ativo', originalAtivo)
    }

    if (e.auth.id === e.record.id && originalAtivo && !e.record.getBool('ativo')) {
      throw new BadRequestError('Voce nao pode desativar seu proprio usuario.', {
        ativo: new ValidationError('invalid', 'Voce nao pode desativar seu proprio usuario.'),
      })
    }

    if (e.auth.id === e.record.id && originalPerfil !== e.record.getString('perfil')) {
      throw new BadRequestError('Voce nao pode alterar seu proprio perfil.', {
        perfil: new ValidationError('invalid', 'Voce nao pode alterar seu proprio perfil.'),
      })
    }
  }

  e.next()

  try {
    const newAtivo = e.record.getBool('ativo')
    let acao = 'editou'
    if (originalAtivo && !newAtivo) {
      acao = 'desativou'
    } else if (!originalAtivo && newAtivo) {
      acao = 'ativou'
    }

    const auditCol = $app.findCollectionByNameOrId('auditoria')
    const audit = new Record(auditCol)
    audit.set('usuario', e.auth ? e.auth.id : '')
    audit.set('acao', acao)
    audit.set('entidade', 'usuario')
    audit.set('entidadeId', e.record.id)
    audit.set(
      'detalhes',
      JSON.stringify({
        antes: {
          nome: originalNome,
          email: originalEmail,
          perfil: originalPerfil,
          ativo: originalAtivo,
        },
        depois: {
          nome: e.record.getString('name'),
          email: e.record.getString('email'),
          perfil: e.record.getString('perfil'),
          ativo: newAtivo,
        },
      }),
    )
    $app.save(audit)
  } catch (err) {}
}, 'users')
