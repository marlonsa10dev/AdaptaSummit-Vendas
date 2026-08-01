migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'UPDATE users SET emailVisibility = 1 WHERE emailVisibility = 0 OR emailVisibility IS NULL',
      )
      .execute()
  },
  (app) => {
    app.db().newQuery('UPDATE users SET emailVisibility = 0').execute()
  },
)
