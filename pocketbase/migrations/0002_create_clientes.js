migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const collection = new Collection({
      name: 'clientes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != '' && @request.auth.perfil = 'Administrador'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'vendedor',
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
        'CREATE INDEX idx_clientes_nome ON clientes (nome)',
        'CREATE INDEX idx_clientes_vendedor ON clientes (vendedor)',
        'CREATE INDEX idx_clientes_created ON clientes (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('clientes')
    app.delete(collection)
  },
)
