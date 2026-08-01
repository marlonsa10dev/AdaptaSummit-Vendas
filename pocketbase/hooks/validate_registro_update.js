onRecordUpdateRequest((e) => {
  const tipo = e.record.getString('tipo')
  const cliente = e.record.getString('cliente')
  const descricao = e.record.getString('descricao')
  const data = e.record.getString('data')
  const proximaAcao = e.record.getString('proximaAcao') || ''
  const dataProximaAcao = e.record.getString('dataProximaAcao') || ''

  if (e.auth) {
    e.record.set('atualizadoPor', e.auth.id)
  }

  const originalResponsavel = e.record.original().getString('responsavel')
  if (originalResponsavel) {
    e.record.set('responsavel', originalResponsavel)
  }

  const errors = {}

  if (!tipo) {
    errors['tipo'] = new ValidationError('required', 'Preencha o campo Tipo.')
  }
  if (!cliente) {
    errors['cliente'] = new ValidationError('required', 'Preencha o campo Cliente.')
  }
  if (!descricao || !descricao.trim()) {
    errors['descricao'] = new ValidationError('required', 'Preencha a Descrição.')
  }

  if (tipo === 'Lowlight' || tipo === 'Ação para semana seguinte') {
    if (!proximaAcao || !proximaAcao.trim()) {
      errors['proximaAcao'] = new ValidationError('required', 'Preencha a Próxima ação.')
    }
    if (!dataProximaAcao) {
      errors['dataProximaAcao'] = new ValidationError('required', 'Informe a Data prevista.')
    }
  }

  if (data) {
    const dateStr = data.split(' ')[0].split('T')[0]
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const recordDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const minDate = new Date()
      minDate.setDate(minDate.getDate() - 7)
      minDate.setHours(0, 0, 0, 0)
      if (recordDate > today) {
        errors['data'] = new ValidationError('invalid', 'A data não pode ser no futuro.')
      }
      if (recordDate < minDate) {
        errors['data'] = new ValidationError('invalid', 'A data não pode ser anterior a 7 dias.')
      }
    }
  } else {
    errors['data'] = new ValidationError('required', 'Preencha a Data.')
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError('Dados inválidos', errors)
  }

  e.next()
}, 'registros')
