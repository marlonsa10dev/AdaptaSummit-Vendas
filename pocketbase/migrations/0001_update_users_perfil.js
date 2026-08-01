migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('perfil')) {
      users.fields.add(
        new SelectField({
          name: 'perfil',
          required: true,
          values: ['Vendedor', 'Gestor', 'Diretoria', 'Administrador'],
          maxSelect: 1,
        }),
      )
      app.save(users)
    }
    users.addIndex('idx_users_perfil', false, 'perfil', '')
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('perfil')) {
      users.fields.removeByName('perfil')
      app.save(users)
    }
  },
)
