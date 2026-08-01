onRecordUpdate((e) => {
  const name = e.record.getString('nome')
  if (!name) return e.next()
  const recId = e.record.id
  const clients = $app.findRecordsByFilter('clientes', "id != ''", '', 1000, 0)
  const cleanNew = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].id === recId) continue
    const cleanExisting = clients[i]
      .getString('nome')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
    if (cleanExisting === cleanNew) {
      throw new BadRequestError('Já existe um cliente com esse nome', {
        nome: new ValidationError('duplicate', 'Já existe um cliente cadastrado com esse nome.'),
      })
    }
  }
  e.next()
}, 'clientes')
