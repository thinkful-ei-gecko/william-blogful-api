const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('blogful_users');
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('blogful_users')
      .returning('*')
      .then(rows => rows[0]);
  },

  getById(knex, id) {
    return knex
      .select('*')
      .from('blogful_users')
      .where( { id: id } )
      .first();
  },

  deleteUser(knex, id) {
    return knex
      .from('blogful_users')
      .where( { id: id } )
      .delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex
      .from('blogful_users')
      .update(newUserFields)
      .where( { id: id } );
  }
};

module.exports = UsersService;