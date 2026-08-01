migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('registros')
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('dataProximaAcao')) {
      col.fields.add(new DateField({ name: 'dataProximaAcao' }))
    }
    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({ name: 'status', values: ['Pendente', 'Concluída'], maxSelect: 1 }),
      )
    }
    if (!col.fields.getByName('atualizadoPor')) {
      col.fields.add(
        new RelationField({ name: 'atualizadoPor', collectionId: usersCol.id, maxSelect: 1 }),
      )
    }

    col.listRule = 'responsavel = @request.auth.id'
    col.viewRule = 'responsavel = @request.auth.id'
    col.createRule = "@request.auth.id != ''"
    col.updateRule = 'responsavel = @request.auth.id'
    col.deleteRule = 'responsavel = @request.auth.id'

    app.save(col)

    app
      .db()
      .newQuery("UPDATE registros SET status = 'Pendente' WHERE status IS NULL OR status = ''")
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('registros')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != '' && @request.auth.perfil = 'Administrador'"
    app.save(col)
  },
)
