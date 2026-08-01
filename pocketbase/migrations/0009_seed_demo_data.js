migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const clientesCol = app.findCollectionByNameOrId('clientes')
    const registrosCol = app.findCollectionByNameOrId('registros')

    function getOrCreateUser(email, name, perfil) {
      try {
        return app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const rec = new Record(usersCol)
        rec.setEmail(email)
        rec.setPassword('Skip@Pass')
        rec.setVerified(true)
        rec.set('name', name)
        rec.set('perfil', perfil)
        rec.set('ativo', true)
        rec.set('emailVisibility', true)
        app.save(rec)
        return rec
      }
    }

    function getOrCreateClient(nome, vendedorId) {
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

    function dateStr(daysOffset) {
      const d = new Date()
      d.setDate(d.getDate() + daysOffset)
      return d.toISOString().replace('T', ' ')
    }

    function getOrCreateRegistro(
      tipo,
      descricao,
      clienteId,
      responsavelId,
      diasAtras,
      proximaAcao,
      diasProximaAcao,
      status,
    ) {
      try {
        app.findFirstRecordByData('registros', 'descricao', descricao)
        return
      } catch (_) {
        const rec = new Record(registrosCol)
        rec.set('data', dateStr(diasAtras))
        rec.set('tipo', tipo)
        rec.set('descricao', descricao)
        rec.set('cliente', clienteId)
        rec.set('responsavel', responsavelId)
        if (proximaAcao) {
          rec.set('proximaAcao', proximaAcao)
          rec.set('dataProximaAcao', dateStr(diasProximaAcao))
        }
        if (status === 'Concluida') {
          rec.set('status', 'Concluída')
          rec.set('dataConclusao', dateStr(diasProximaAcao))
        } else {
          rec.set('status', 'Pendente')
        }
        app.save(rec)
      }
    }

    var gestor = getOrCreateUser('gestor.demo@demo.com', 'Ana Gestora (Demo)', 'Gestor')
    var roberto = getOrCreateUser('roberto.vendas@demo.com', 'Roberto Vendas (Demo)', 'Vendedor')
    var juliana = getOrCreateUser(
      'juliana.comercial@demo.com',
      'Juliana Comercial (Demo)',
      'Vendedor',
    )
    var marcos = getOrCreateUser('marcos.vendas@demo.com', 'Marcos Vendas (Demo)', 'Vendedor')

    var c1 = getOrCreateClient('Padaria São João', roberto.id)
    var c2 = getOrCreateClient('Farmácia Vida Saudável', juliana.id)
    var c3 = getOrCreateClient('AutoPeças Veloz', marcos.id)
    var c4 = getOrCreateClient('Restaurante Sabor & Arte', roberto.id)
    var c5 = getOrCreateClient('Construtora Horizonte', juliana.id)
    var c6 = getOrCreateClient('Loja TechMax', marcos.id)

    getOrCreateRegistro(
      'Highlight',
      'Fechamento de contrato anual de fornecimento de pães para rede de cafeterias.',
      c1.id,
      roberto.id,
      1,
      '',
      0,
      'Pendente',
    )
    getOrCreateRegistro(
      'Lowlight',
      'Cliente reclamou de atraso na entrega de encomenda especial — precisa de plano de contingência.',
      c1.id,
      roberto.id,
      3,
      'Apresentar proposta de desconto comercial e novo SLA de entrega.',
      -2,
      'Pendente',
    )
    getOrCreateRegistro(
      'Ação para semana seguinte',
      'Agendar degustação dos novos produtos de linha natalina.',
      c1.id,
      roberto.id,
      1,
      'Enviar catálogo de produtos sazonais e confirmar data da degustação.',
      3,
      'Pendente',
    )

    getOrCreateRegistro(
      'Highlight',
      'Aumento de 30% no pedido recorrente de medicamentos de farmácia.',
      c2.id,
      juliana.id,
      2,
      '',
      0,
      'Pendente',
    )
    getOrCreateRegistro(
      'Lowlight',
      'Concorrente fez proposta agressiva de preço — risco de perda de contrato.',
      c2.id,
      juliana.id,
      4,
      'Preparar contraproposta com condições exclusivas e agendar reunião com gestor.',
      -1,
      'Concluida',
    )

    getOrCreateRegistro(
      'Highlight',
      'Primeiro pedido grande de peças automotivas para frota de 50 veículos.',
      c3.id,
      marcos.id,
      0,
      '',
      0,
      'Pendente',
    )
    getOrCreateRegistro(
      'Ação para semana seguinte',
      'Preparar cotação para linha completa de filtros e óleos.',
      c3.id,
      marcos.id,
      0,
      'Enviar cotação detalhada e agendar visita técnica.',
      5,
      'Pendente',
    )

    getOrCreateRegistro(
      'Highlight',
      'Cliente aprovou menu especial para evento corporativo de 200 pessoas.',
      c4.id,
      roberto.id,
      2,
      '',
      0,
      'Pendente',
    )
    getOrCreateRegistro(
      'Lowlight',
      'Equipe de cozinha reduziu — risco de não atender demanda do evento.',
      c4.id,
      roberto.id,
      1,
      'Contratar temporários e reorganizar escala de produção.',
      2,
      'Pendente',
    )

    getOrCreateRegistro(
      'Highlight',
      'Assinatura de contrato de fornecimento de materiais para obra de 12 meses.',
      c5.id,
      juliana.id,
      3,
      '',
      0,
      'Pendente',
    )
    getOrCreateRegistro(
      'Ação para semana seguinte',
      'Agendar reunião de alinhamento com engenheiro responsável.',
      c5.id,
      juliana.id,
      2,
      'Confirmar agenda e preparar apresentação de cronograma de entregas.',
      0,
      'Pendente',
    )

    getOrCreateRegistro(
      'Lowlight',
      'Atraso no pagamento da última fatura — cliente solicitou renegociação.',
      c6.id,
      marcos.id,
      5,
      'Negociar plano de parcelamento e enviar novo boleto.',
      -3,
      'Pendente',
    )
    getOrCreateRegistro(
      'Highlight',
      'Cliente expandiu loja física — nova oportunidade de upgrade de equipamentos.',
      c6.id,
      marcos.id,
      1,
      '',
      0,
      'Pendente',
    )
  },
  (app) => {
    var emails = [
      'gestor.demo@demo.com',
      'roberto.vendas@demo.com',
      'juliana.comercial@demo.com',
      'marcos.vendas@demo.com',
    ]
    for (var i = 0; i < emails.length; i++) {
      try {
        var rec = app.findAuthRecordByEmail('_pb_users_auth_', emails[i])
        app.delete(rec)
      } catch (_) {}
    }
    var nomes = [
      'Padaria São João',
      'Farmácia Vida Saudável',
      'AutoPeças Veloz',
      'Restaurante Sabor & Arte',
      'Construtora Horizonte',
      'Loja TechMax',
    ]
    for (var j = 0; j < nomes.length; j++) {
      try {
        var c = app.findFirstRecordByData('clientes', 'nome', nomes[j])
        app.delete(c)
      } catch (_) {}
    }
  },
)
