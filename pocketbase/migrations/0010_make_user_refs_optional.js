migrate(
  (app) => {
    const clientesCol = app.findCollectionByNameOrId('clientes')
    const vendedorField = clientesCol.fields.getByName('vendedor')
    if (vendedorField) {
      vendedorField.required = false
    }
    app.save(clientesCol)

    const registrosCol = app.findCollectionByNameOrId('registros')
    const responsavelField = registrosCol.fields.getByName('responsavel')
    if (responsavelField) {
      responsavelField.required = false
    }
    app.save(registrosCol)

    const auditoriaCol = app.findCollectionByNameOrId('auditoria')
    const usuarioField = auditoriaCol.fields.getByName('usuario')
    if (usuarioField) {
      usuarioField.required = false
    }
    app.save(auditoriaCol)
  },
  (app) => {
    const clientesCol = app.findCollectionByNameOrId('clientes')
    const vendedorField = clientesCol.fields.getByName('vendedor')
    if (vendedorField) {
      vendedorField.required = true
    }
    app.save(clientesCol)

    const registrosCol = app.findCollectionByNameOrId('registros')
    const responsavelField = registrosCol.fields.getByName('responsavel')
    if (responsavelField) {
      responsavelField.required = true
    }
    app.save(registrosCol)

    const auditoriaCol = app.findCollectionByNameOrId('auditoria')
    const usuarioField = auditoriaCol.fields.getByName('usuario')
    if (usuarioField) {
      usuarioField.required = true
    }
    app.save(auditoriaCol)
  },
)
