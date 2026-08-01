routerAdd(
  'GET',
  '/backend/v1/relatorios/dados',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')

    const perfil = auth.getString('perfil')
    const isManager = perfil === 'Gestor' || perfil === 'Diretoria' || perfil === 'Administrador'

    const usersMap = {}
    try {
      const allUsers = $app.findRecordsByFilter('users', "id != ''", 'name', 100000, 0)
      for (const u of allUsers) {
        usersMap[u.id] = {
          id: u.id,
          name: u.getString('name'),
          email: u.getString('email'),
          perfil: u.getString('perfil'),
          ativo: u.getBool('ativo'),
          created: u.getString('created'),
          updated: u.getString('updated'),
        }
      }
    } catch (err) {}

    const clientesMap = {}
    try {
      const allClientes = $app.findRecordsByFilter('clientes', "id != ''", 'nome', 100000, 0)
      for (const c of allClientes) {
        const vendedorId = c.getString('vendedor')
        clientesMap[c.id] = {
          id: c.id,
          nome: c.getString('nome'),
          vendedor: vendedorId,
          created: c.getString('created'),
          updated: c.getString('updated'),
          expand: { vendedor: usersMap[vendedorId] || null },
        }
      }
    } catch (err) {}

    let registros = []
    try {
      if (isManager) {
        registros = $app.findRecordsByFilter('registros', "id != ''", '-data', 100000, 0)
      } else {
        registros = $app.findRecordsByFilter(
          'registros',
          "responsavel = '" + auth.id + "'",
          '-data',
          100000,
          0,
        )
      }
    } catch (err) {}

    const registrosData = registros.map((r) => {
      const clienteId = r.getString('cliente')
      const responsavelId = r.getString('responsavel')
      const atualizadoPorId = r.getString('atualizadoPor')
      return {
        id: r.id,
        data: r.getString('data'),
        tipo: r.getString('tipo'),
        descricao: r.getString('descricao'),
        cliente: clienteId,
        proximaAcao: r.getString('proximaAcao'),
        dataProximaAcao: r.getString('dataProximaAcao'),
        status: r.getString('status'),
        responsavel: responsavelId,
        atualizadoPor: atualizadoPorId,
        dataConclusao: r.getString('dataConclusao'),
        created: r.getString('created'),
        updated: r.getString('updated'),
        expand: {
          cliente: clientesMap[clienteId] || null,
          responsavel: usersMap[responsavelId] || null,
          atualizadoPor: usersMap[atualizadoPorId] || null,
        },
      }
    })

    const usersList = Object.values(usersMap)
    const clientesList = Object.values(clientesMap)

    let filteredUsers = usersList
    if (!isManager) {
      filteredUsers = usersList.filter(function (u) {
        return u.id === auth.id
      })
    }

    return e.json(200, { registros: registrosData, users: filteredUsers, clientes: clientesList })
  },
  $apis.requireAuth(),
)
