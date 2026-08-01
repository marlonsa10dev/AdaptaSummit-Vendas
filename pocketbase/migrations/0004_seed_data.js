migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const clientesCol = app.findCollectionByNameOrId('clientes')
    const registrosCol = app.findCollectionByNameOrId('registros')

    let adminRecord
    try {
      adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'marlonsa@hotmail.com')
      adminRecord.set('perfil', 'Administrador')
      adminRecord.set('name', 'Marlon Sá')
      app.save(adminRecord)
    } catch (_) {
      adminRecord = new Record(usersCol)
      adminRecord.setEmail('marlonsa@hotmail.com')
      adminRecord.setPassword('Skip@Pass')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Marlon Sá')
      adminRecord.set('perfil', 'Administrador')
      app.save(adminRecord)
    }

    let sellerRecord
    try {
      sellerRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'vendedor@demo.com')
      sellerRecord.set('perfil', 'Vendedor')
      sellerRecord.set('name', 'Carlos Vendedor')
      app.save(sellerRecord)
    } catch (_) {
      sellerRecord = new Record(usersCol)
      sellerRecord.setEmail('vendedor@demo.com')
      sellerRecord.setPassword('Skip@Pass')
      sellerRecord.setVerified(true)
      sellerRecord.set('name', 'Carlos Vendedor')
      sellerRecord.set('perfil', 'Vendedor')
      app.save(sellerRecord)
    }

    const getOrCreateClient = (nome, vendedorId) => {
      try {
        return app.findFirstRecordByData('clientes', 'nome', nome)
      } catch (_) {
        const rec = new Record(clientesCol)
        rec.set('nome', nome)
        rec.set('vendedor', vendedorId)
        app.save(rec)
        return rec
      }
    }

    const c1 = getOrCreateClient('TechCorp Soluções', adminRecord.id)
    const c2 = getOrCreateClient('Mercearia Central', sellerRecord.id)

    const today = new Date()
    const dateStr = (daysAgo) => {
      const d = new Date(today)
      d.setDate(d.getDate() - daysAgo)
      return d.toISOString().replace('T', ' ')
    }

    const getOrCreateRegistro = (
      tipo,
      descricao,
      clienteId,
      responsavelId,
      proximaAcao,
      daysAgo,
    ) => {
      try {
        app.findFirstRecordByData('registros', 'descricao', descricao)
      } catch (_) {
        const rec = new Record(registrosCol)
        rec.set('data', dateStr(daysAgo))
        rec.set('tipo', tipo)
        rec.set('descricao', descricao)
        rec.set('cliente', clienteId)
        rec.set('responsavel', responsavelId)
        if (proximaAcao) rec.set('proximaAcao', proximaAcao)
        app.save(rec)
      }
    }

    getOrCreateRegistro(
      'Highlight',
      'Fechamento do contrato anual de software corporativo com aumento de 20% no MRR.',
      c1.id,
      adminRecord.id,
      '',
      1,
    )

    getOrCreateRegistro(
      'Lowlight',
      'Atraso na implantação do módulo adicional devido a alinhamento pendente da equipe de TI.',
      c1.id,
      adminRecord.id,
      '',
      3,
    )

    getOrCreateRegistro(
      'Ação para semana seguinte',
      'Reunião agendada para apresentação da proposta comercial da nova filial.',
      c2.id,
      sellerRecord.id,
      'Enviar minuta contratual revisada e agendar call com o diretor financeiro.',
      2,
    )
  },
  (app) => {},
)
