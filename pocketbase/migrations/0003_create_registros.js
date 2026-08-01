migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const clientesCol = app.findCollectionByNameOrId('clientes')
    const collection = new Collection({
      name: 'registros',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != '' && @request.auth.perfil = 'Administrador'",
      fields: [
        { name: 'data', type: 'date', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['Highlight', 'Lowlight', 'Ação para semana seguinte'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        {
          name: 'cliente',
          type: 'relation',
          required: true,
          collectionId: clientesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'proximaAcao', type: 'text', required: false },
        {
          name: 'responsavel',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_registros_data ON registros (data)',
        'CREATE INDEX idx_registros_tipo ON registros (tipo)',
        'CREATE INDEX idx_registros_cliente ON registros (cliente)',
        'CREATE INDEX idx_registros_responsavel ON registros (responsavel)',
        'CREATE INDEX idx_registros_created ON registros (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('registros')
    app.delete(collection)
  },
)
