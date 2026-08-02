routerAdd(
  'DELETE',
  '/backend/v1/users/{id}',
  (e) => {
    const userId = e.request.pathValue('id')
    const authId = e.auth ? e.auth.id : ''

    if (!authId) {
      return e.unauthorizedError('auth required')
    }

    const perfil = e.auth ? e.auth.getString('perfil') : ''
    if (perfil !== 'Administrador') {
      return e.forbiddenError('Apenas administradores podem excluir usuários')
    }

    if (userId === authId) {
      return e.badRequestError('Você não pode excluir o seu próprio usuário.')
    }

    let userRecord
    try {
      userRecord = $app.findRecordById('users', userId)
    } catch (err) {
      return e.notFoundError('Usuário não encontrado')
    }

    const userName = userRecord.getString('name')

    try {
      const clientes = $app.findRecordsByFilter('clientes', "vendedor = '" + userId + "'", '', 0, 0)
      for (const c of clientes) {
        c.set('vendedor', '')
        $app.save(c)
      }

      const registrosResp = $app.findRecordsByFilter(
        'registros',
        "responsavel = '" + userId + "'",
        '',
        0,
        0,
      )
      for (const r of registrosResp) {
        r.set('responsavel', '')
        $app.save(r)
      }

      const registrosAtual = $app.findRecordsByFilter(
        'registros',
        "atualizadoPor = '" + userId + "'",
        '',
        0,
        0,
      )
      for (const r of registrosAtual) {
        r.set('atualizadoPor', '')
        $app.save(r)
      }

      const audits = $app.findRecordsByFilter('auditoria', "usuario = '" + userId + "'", '', 0, 0)
      for (const a of audits) {
        a.set('usuario', '')
        $app.save(a)
      }

      const auditCol = $app.findCollectionByNameOrId('auditoria')
      const audit = new Record(auditCol)
      audit.set('usuario', authId)
      audit.set('acao', 'excluiu')
      audit.set('entidade', 'user')
      audit.set('entidadeId', userId)
      audit.set('detalhes', 'excluiu usuário ' + userName)
      $app.save(audit)

      $app.delete(userRecord)

      return e.json(200, { success: true })
    } catch (err) {
      return e.badRequestError(
        'Não foi possível excluir o usuário. Verifique se não há dados vinculados e tente novamente.',
      )
    }
  },
  $apis.requireAuth(),
)
