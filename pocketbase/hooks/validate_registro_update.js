onRecordUpdate((e) => {
  const tipo = e.record.getString('tipo')
  const proximaAcao = e.record.getString('proximaAcao') || ''
  if (tipo === 'Ação para semana seguinte' && !proximaAcao.trim()) {
    throw new BadRequestError('A próxima ação é obrigatória para este tipo de registro', {
      proximaAcao: new ValidationError(
        'required',
        'A próxima ação é obrigatória para este tipo de registro.',
      ),
    })
  }
  e.next()
}, 'registros')
