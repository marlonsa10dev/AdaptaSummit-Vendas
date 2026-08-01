migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('ativo')) {
      usersCol.fields.add(new BoolField({ name: 'ativo' }))
    }

    usersCol.listRule =
      "@request.auth.id != '' && (@request.auth.perfil = 'Administrador' || id = @request.auth.id)"
    usersCol.viewRule =
      "@request.auth.id != '' && (@request.auth.perfil = 'Administrador' || id = @request.auth.id)"
    usersCol.createRule = "@request.auth.id != '' && @request.auth.perfil = 'Administrador'"
    usersCol.updateRule =
      "@request.auth.id != '' && (@request.auth.perfil = 'Administrador' || id = @request.auth.id)"
    usersCol.deleteRule = "@request.auth.id != '' && @request.auth.perfil = 'Administrador'"
    app.save(usersCol)

    app.db().newQuery('UPDATE users SET ativo = 1 WHERE ativo IS NULL OR ativo = 0').execute()

    const clientesCol = app.findCollectionByNameOrId('clientes')
    clientesCol.listRule =
      "@request.auth.id != '' && (vendedor = @request.auth.id || @request.auth.perfil = 'Gestor' || @request.auth.perfil = 'Diretoria' || @request.auth.perfil = 'Administrador')"
    clientesCol.viewRule =
      "@request.auth.id != '' && (vendedor = @request.auth.id || @request.auth.perfil = 'Gestor' || @request.auth.perfil = 'Diretoria' || @request.auth.perfil = 'Administrador')"
    clientesCol.createRule = "@request.auth.id != ''"
    clientesCol.updateRule = "@request.auth.id != ''"
    clientesCol.deleteRule = "@request.auth.id != '' && @request.auth.perfil = 'Administrador'"
    app.save(clientesCol)

    const registrosCol = app.findCollectionByNameOrId('registros')
    registrosCol.listRule =
      "@request.auth.id != '' && (responsavel = @request.auth.id || @request.auth.perfil = 'Gestor' || @request.auth.perfil = 'Diretoria' || @request.auth.perfil = 'Administrador')"
    registrosCol.viewRule =
      "@request.auth.id != '' && (responsavel = @request.auth.id || @request.auth.perfil = 'Gestor' || @request.auth.perfil = 'Diretoria' || @request.auth.perfil = 'Administrador')"
    registrosCol.createRule = "@request.auth.id != ''"
    registrosCol.updateRule =
      "@request.auth.id != '' && (responsavel = @request.auth.id || @request.auth.perfil = 'Gestor' || @request.auth.perfil = 'Diretoria' || @request.auth.perfil = 'Administrador')"
    registrosCol.deleteRule =
      "@request.auth.id != '' && (responsavel = @request.auth.id || @request.auth.perfil = 'Administrador')"
    app.save(registrosCol)

    const auditoriaCol = new Collection({
      name: 'auditoria',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.perfil = 'Administrador'",
      viewRule: "@request.auth.id != '' && @request.auth.perfil = 'Administrador'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'usuario',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'entidade', type: 'text', required: true },
        { name: 'entidadeId', type: 'text', required: false },
        { name: 'detalhes', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_auditoria_usuario ON auditoria (usuario)',
        'CREATE INDEX idx_auditoria_acao ON auditoria (acao)',
        'CREATE INDEX idx_auditoria_entidade ON auditoria (entidade)',
        'CREATE INDEX idx_auditoria_created ON auditoria (created DESC)',
      ],
    })
    app.save(auditoriaCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.createRule = ''
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    const ativoField = usersCol.fields.getByName('ativo')
    if (ativoField) usersCol.fields.remove(ativoField)
    app.save(usersCol)

    const clientesCol = app.findCollectionByNameOrId('clientes')
    clientesCol.listRule = "@request.auth.id != ''"
    clientesCol.viewRule = "@request.auth.id != ''"
    clientesCol.createRule = "@request.auth.id != ''"
    clientesCol.updateRule = "@request.auth.id != ''"
    clientesCol.deleteRule = "@request.auth.id != '' && @request.auth.perfil = 'Administrador'"
    app.save(clientesCol)

    const registrosCol = app.findCollectionByNameOrId('registros')
    registrosCol.listRule = 'responsavel = @request.auth.id'
    registrosCol.viewRule = 'responsavel = @request.auth.id'
    registrosCol.createRule = "@request.auth.id != ''"
    registrosCol.updateRule = 'responsavel = @request.auth.id'
    registrosCol.deleteRule = 'responsavel = @request.auth.id'
    app.save(registrosCol)

    const auditoriaCol = app.findCollectionByNameOrId('auditoria')
    app.delete(auditoriaCol)
  },
)
