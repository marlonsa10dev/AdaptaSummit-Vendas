migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('registros')
    if (!col.fields.getByName('dataConclusao')) {
      col.fields.add(new DateField({ name: 'dataConclusao' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('registros')
    const field = col.fields.getByName('dataConclusao')
    if (field) col.fields.remove(field)
    app.save(col)
  },
)
