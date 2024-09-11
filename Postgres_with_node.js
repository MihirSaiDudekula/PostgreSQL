const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.POSTGRESQL_URL, // Changed semicolon to comma
});

async function main() {
  try {
    await client.connect();

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert a user
    const insertResult = await client.query(`
      INSERT INTO users (username, email, password) 
      VALUES ('new_user', 'newuser@example.com', 'securepassword123')
      RETURNING *;
    `);
    console.log('Inserted user:', insertResult.rows[0]);

    // Query all users
    const selectResult = await client.query('SELECT * FROM users;');
    console.log('All users:', selectResult.rows);

    // Update a user
    const updateResult = await client.query(`
      UPDATE users 
      SET username = $1, email = $2 
      WHERE id = $3 
      RETURNING *;
    `, ['updated_username', 'updatedemail@example.com', insertResult.rows[0].id]);
    console.log('Updated user:', updateResult.rows[0]);

    // Delete a user
    const deleteResult = await client.query(`
      DELETE FROM users 
      WHERE id = $1 
      RETURNING *;
    `, [insertResult.rows[0].id]);
    console.log('Deleted user:', deleteResult.rows[0]);

  } catch (error) {
    console.error('Error executing queries', error.stack);
  } finally {
    await client.end();
  }
}

main();
